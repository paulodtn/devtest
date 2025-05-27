module Api
  module V1
    class PrimersController < Api::V1::ApiController
      include Auditable
      
      skip_before_action :verify_authenticity_token
      before_action :set_primer, only: [:show, :update, :destroy]

      # GET /api/v1/primers
      def index
        @primers = Primer.all
        
        # Filtros opcionais
        @primers = @primers.where("label ILIKE ?", "%#{params[:search]}%") if params[:search].present?
        
        # Filtro genômico estilo IGV
        @primers = @primers.where(chr: params[:chr]) if params[:chr].present?
        
        # Lógica do filtro genômico: primer.start >= start_input AND primer.end <= end_input
        if params[:start_min].present?
          @primers = @primers.where("start >= ?", params[:start_min])
        end
        
        if params[:end_max].present?
          @primers = @primers.where("\"end\" <= ?", params[:end_max])
        end
        
        # Outros filtros mantidos para compatibilidade
        @primers = @primers.where("start <= ?", params[:start_max]) if params[:start_max].present?
        @primers = @primers.where("\"end\" >= ?", params[:end_min]) if params[:end_min].present?
        @primers = @primers.where("foward_temperature >= ?", params[:temp_min]) if params[:temp_min].present?
        @primers = @primers.where("foward_temperature <= ?", params[:temp_max]) if params[:temp_max].present?
        @primers = @primers.where("transcrito ILIKE ?", "%#{params[:transcrito]}%") if params[:transcrito].present?
        @primers = @primers.where(exon: params[:exon]) if params[:exon].present?
        @primers = @primers.where(genome_version: params[:genome_version]) if params[:genome_version].present?
        
        # Filtro de sequências
        if params[:foward_sequence].present?
          @primers = @primers.where("foward_sequence ILIKE ?", "%#{params[:foward_sequence].upcase}%")
        end
        
        if params[:reverse_sequence].present?
          @primers = @primers.where("reverse_sequence ILIKE ?", "%#{params[:reverse_sequence].upcase}%")
        end
        
        # Filtro por faixa de coordenadas (região genômica) - mantido para compatibilidade
        if params[:region_chr].present? && params[:region_start].present? && params[:region_end].present?
          @primers = @primers.where(
            chr: params[:region_chr]
          ).where(
            "start <= ? AND \"end\" >= ?", 
            params[:region_end].to_i, 
            params[:region_start].to_i
          )
        end
        
        render json: @primers
      end

      # GET /api/v1/primers/:id
      def show
        render json: @primer
      end

      # POST /api/v1/primers
      def create
        @primer = Primer.new(primer_params)
        
        if @primer.save
          # Log da auditoria
          log_audit_action(
            action: 'create_primer',
            entity_type: 'Primer',
            entity_id: @primer.id,
            entity_name: @primer.label
          )
          
          render json: @primer, status: :created
        else
          Rails.logger.error "Erro ao criar primer: #{@primer.errors.full_messages.join(', ')}"
          render json: { errors: @primer.errors }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotUnique => e
        Rails.logger.error "Erro de unicidade ao criar primer: #{e.message}"
        render json: { errors: { base: 'Erro ao criar primer. Verifique se os campos únicos não estão duplicados.' } }, status: :unprocessable_entity
      rescue StandardError => e
        Rails.logger.error "Erro inesperado ao criar primer: #{e.message}"
        render json: { errors: { base: 'Erro ao criar primer. Por favor, tente novamente.' } }, status: :internal_server_error
      end

      # PATCH/PUT /api/v1/primers/:id
      def update
        old_label = @primer.label # Guardar o label original
        
        if @primer.update(primer_params)
          # Log da auditoria
          log_audit_action(
            action: 'update_primer',
            entity_type: 'Primer',
            entity_id: @primer.id,
            entity_name: @primer.label,
            details: { previous_label: old_label }
          )
          
          render json: @primer
        else
          Rails.logger.error "Erro ao atualizar primer: #{@primer.errors.full_messages.join(', ')}"
          render json: { errors: @primer.errors }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotUnique => e
        Rails.logger.error "Erro de unicidade ao atualizar primer: #{e.message}"
        render json: { errors: { base: 'Erro ao atualizar primer. Verifique se os campos únicos não estão duplicados.' } }, status: :unprocessable_entity
      rescue StandardError => e
        Rails.logger.error "Erro inesperado ao atualizar primer: #{e.message}"
        render json: { errors: { base: 'Erro ao atualizar primer. Por favor, tente novamente.' } }, status: :internal_server_error
      end

      # DELETE /api/v1/primers/:id
      def destroy
        primer_label = @primer.label # Guardar o label antes de excluir
        primer_id = @primer.id
        
        @primer.destroy
        
        # Log da auditoria
        log_audit_action(
          action: 'delete_primer',
          entity_type: 'Primer',
          entity_id: primer_id,
          entity_name: primer_label
        )
        
        head :no_content
      rescue StandardError => e
        Rails.logger.error "Erro ao excluir primer: #{e.message}"
        render json: { errors: { base: 'Erro ao excluir primer. Por favor, tente novamente.' } }, status: :internal_server_error
      end

      private

      def set_primer
        @primer = Primer.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { errors: { base: 'Primer não encontrado' } }, status: :not_found
      end

      def primer_params
        params.require(:primer).permit(
          :label,
          :foward_sequence,
          :reverse_sequence,
          :foward_temperature,
          :reverse_temperature,
          :chr,
          :transcrito,
          :start,
          :end,
          :conditions,
          :exon,
          :genome_version,
          :bed,
          :size
        )
      end
    end
  end
end 