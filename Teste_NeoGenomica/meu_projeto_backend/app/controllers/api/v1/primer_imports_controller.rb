require 'csv'

module Api
  module V1
    class PrimerImportsController < ApplicationController
      skip_before_action :verify_authenticity_token

      # POST /api/v1/primer_imports
      def create
        begin
          # Validar se o arquivo foi enviado
          unless params[:file].present?
            return render json: { 
              success: false, 
              errors: ['Nenhum arquivo foi enviado'] 
            }, status: :bad_request
          end

          file = params[:file]
          
          # Validar extensão do arquivo
          unless file.original_filename.end_with?('.csv')
            return render json: { 
              success: false, 
              errors: ['Arquivo deve ter extensão .csv'] 
            }, status: :bad_request
          end

          # Ler e processar o CSV
          result = process_csv(file)
          
          render json: result, status: result[:success] ? :ok : :unprocessable_entity

        rescue StandardError => e
          Rails.logger.error "Erro na importação CSV: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          
          render json: { 
            success: false, 
            errors: ["Erro interno do servidor: #{e.message}"] 
          }, status: :internal_server_error
        end
      end

      private

      def process_csv(file)
        # Campos obrigatórios esperados no CSV
        required_headers = [
          'label', 'foward_sequence', 'reverse_sequence', 'foward_temperature',
          'reverse_temperature', 'chr', 'transcrito', 'start', 'end', 'conditions',
          'exon', 'genome_version', 'bed', 'size'
        ]

        inserted_count = 0
        updated_count = 0
        errors = []
        
        begin
          # Ler o arquivo CSV
          csv_content = file.read.force_encoding('UTF-8')
          csv_data = CSV.parse(csv_content, headers: true, header_converters: :downcase)
          
          # Validar cabeçalhos
          missing_headers = required_headers - csv_data.headers
          if missing_headers.any?
            return {
              success: false,
              errors: ["Colunas obrigatórias não encontradas: #{missing_headers.join(', ')}"]
            }
          end

          # Validar se há dados
          if csv_data.empty?
            return {
              success: false,
              errors: ['O arquivo CSV está vazio ou contém apenas cabeçalhos']
            }
          end

          # Validar duplicatas dentro do próprio CSV
          csv_validation_errors = validate_csv_duplicates(csv_data)
          if csv_validation_errors.any?
            return {
              success: false,
              errors: csv_validation_errors
            }
          end

          # Processamento atômico
          Primer.transaction do
            csv_data.each_with_index do |row, index|
              line_number = index + 2 # +2 porque começa na linha 2 (linha 1 é cabeçalho)
              
              begin
                # Validar campos obrigatórios
                validation_errors = validate_row(row, line_number)
                if validation_errors.any?
                  errors.concat(validation_errors)
                  next
                end

                # Converter tipos de dados
                primer_data = convert_row_data(row)
                
                # Validar unicidade de dados genômicos antes de criar/atualizar
                uniqueness_errors = validate_genomic_uniqueness(primer_data, line_number)
                if uniqueness_errors.any?
                  errors.concat(uniqueness_errors)
                  next
                end
                
                # Verificar se já existe um primer com o mesmo label
                existing_primer = Primer.find_by(label: primer_data[:label])
                
                if existing_primer
                  # Apenas atualizar se os dados genômicos forem os mesmos
                  if genomic_data_matches?(existing_primer, primer_data)
                    if existing_primer.update!(primer_data)
                      updated_count += 1
                    end
                  else
                    errors << "Linha #{line_number}: Primer '#{primer_data[:label]}' já existe com dados genômicos diferentes. Não é possível atualizar com dados genômicos conflitantes."
                    next
                  end
                else
                  # Criar novo primer
                  if Primer.create!(primer_data)
                    inserted_count += 1
                  end
                end

              rescue ActiveRecord::RecordInvalid => e
                errors << "Linha #{line_number}: #{e.record.errors.full_messages.join(', ')}"
              rescue StandardError => e
                errors << "Linha #{line_number}: Erro ao processar - #{e.message}"
              end
            end

            # Se houver erros críticos, fazer rollback
            if errors.any? && (inserted_count == 0 && updated_count == 0)
              raise ActiveRecord::Rollback
            end
          end

          return {
            success: errors.empty? || (inserted_count > 0 || updated_count > 0),
            inserted_count: inserted_count,
            updated_count: updated_count,
            total_processed: inserted_count + updated_count,
            errors: errors
          }

        rescue CSV::MalformedCSVError => e
          return {
            success: false,
            errors: ["Arquivo CSV mal formatado: #{e.message}"]
          }
        rescue Encoding::UndefinedConversionError => e
          return {
            success: false,
            errors: ["Erro de codificação do arquivo. Use UTF-8: #{e.message}"]
          }
        end
      end

      def validate_row(row, line_number)
        errors = []
        
        # Validar campos obrigatórios não vazios
        required_fields = ['label', 'foward_sequence', 'reverse_sequence', 'chr']
        
        required_fields.each do |field|
          if row[field].blank?
            errors << "Linha #{line_number}: Campo '#{field}' é obrigatório"
          end
        end

        # Validar tipos de dados específicos - removendo 'size' e 'exon' pois podem ser texto
        numeric_fields = ['foward_temperature', 'reverse_temperature', 'start', 'end']
        
        numeric_fields.each do |field|
          value = row[field]
          if value.present? && !is_numeric?(value)
            errors << "Linha #{line_number}: Campo '#{field}' deve ser numérico"
          end
        end

        errors
      end

      def convert_row_data(row)
        {
          label: row['label']&.strip,
          foward_sequence: row['foward_sequence']&.strip&.upcase,
          reverse_sequence: row['reverse_sequence']&.strip&.upcase,
          foward_temperature: convert_to_float(row['foward_temperature']),
          reverse_temperature: convert_to_float(row['reverse_temperature']),
          chr: row['chr']&.strip,
          transcrito: row['transcrito']&.strip,
          start: convert_to_integer(row['start']),
          end: convert_to_integer(row['end']),
          conditions: row['conditions']&.strip,
          exon: row['exon']&.strip,  # Mantém como string, não converte para inteiro
          genome_version: row['genome_version']&.strip,
          bed: row['bed']&.strip,
          size: row['size']&.strip  # Mantém como string, não converte para inteiro
        }
      end

      def is_numeric?(value)
        return false if value.blank?
        value.to_s.match?(/\A[+-]?\d*\.?\d+\z/)
      end

      def convert_to_float(value)
        return nil if value.blank?
        value.to_f
      end

      def convert_to_integer(value)
        return nil if value.blank?
        value.to_i
      end

      # Validar duplicatas dentro do próprio CSV
      def validate_csv_duplicates(csv_data)
        errors = []
        
        # Verificar labels duplicados no CSV
        labels = csv_data.map { |row| row['label']&.strip }.compact
        duplicate_labels = labels.select { |label| labels.count(label) > 1 }.uniq
        
        if duplicate_labels.any?
          errors << "Labels duplicados encontrados no CSV: #{duplicate_labels.join(', ')}"
        end
        
        # Verificar combinações genômicas duplicadas no CSV (chr + start + end)
        genomic_combinations = csv_data.map do |row|
          "#{row['chr']&.strip}_#{row['start']&.strip}_#{row['end']&.strip}"
        end.compact
        
        duplicate_genomics = genomic_combinations.select { |combo| genomic_combinations.count(combo) > 1 }.uniq
        
        if duplicate_genomics.any?
          errors << "Combinações genômicas duplicadas encontradas no CSV (chr+start+end): #{duplicate_genomics.count} duplicatas"
        end
        
        errors
      end

      # Validar unicidade de dados genômicos contra o banco de dados
      def validate_genomic_uniqueness(primer_data, line_number)
        errors = []
        
        # Verificar se já existe primer com as mesmas coordenadas genômicas
        existing_genomic = Primer.where(
          chr: primer_data[:chr],
          start: primer_data[:start],
          end: primer_data[:end]
        ).where.not(label: primer_data[:label]).first
        
        if existing_genomic
          errors << "Linha #{line_number}: Já existe primer '#{existing_genomic.label}' com as mesmas coordenadas genômicas (#{primer_data[:chr]}:#{primer_data[:start]}-#{primer_data[:end]})"
        end
        
        # Verificar se já existe primer com as mesmas sequências
        existing_sequences = Primer.where(
          foward_sequence: primer_data[:foward_sequence],
          reverse_sequence: primer_data[:reverse_sequence]
        ).where.not(label: primer_data[:label]).first
        
        if existing_sequences
          errors << "Linha #{line_number}: Já existe primer '#{existing_sequences.label}' com as mesmas sequências forward/reverse"
        end
        
        errors
      end

      # Verificar se os dados genômicos são compatíveis
      def genomic_data_matches?(existing_primer, new_data)
        existing_primer.chr == new_data[:chr] &&
        existing_primer.start == new_data[:start] &&
        existing_primer.end == new_data[:end] &&
        existing_primer.foward_sequence == new_data[:foward_sequence] &&
        existing_primer.reverse_sequence == new_data[:reverse_sequence]
      end
    end
  end
end 