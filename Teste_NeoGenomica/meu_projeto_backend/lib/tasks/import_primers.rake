require 'csv'

namespace :primers do
  desc "Importa primers do CSV e sobrescreve pelo label"
  task import_csv: :environment do
    file_path = Rails.root.join('lib', 'tasks', 'assets', 'primers_csv.csv')

    puts "Lendo arquivo: #{file_path}"

    CSV.foreach(file_path, headers: true) do |row|
      primer = Primer.find_or_initialize_by(label: row['label'])

      primer.assign_attributes(
        forward_sequence: row['forward_sequence'],
        reverse_sequence: row['reverse_sequence'],
        forward_temperature: row['forward_temperature'],
        reverse_temperature: row['reverse_temperature'],
        chr: row['chr'],
        transcrito: row['transcrito'],
        start: row['start'],
        end: row['end'],
        conditions: row['conditions'],
        exon: row['exon'],
        genome_version: row['genome_version'],
        bed: row['bed'],
        size: row['size']
      )

      if primer.save
        puts "✔️ Primer '#{primer.label}' importado com sucesso."
      else
        puts "❌ Erro ao salvar primer '#{primer.label}': #{primer.errors.full_messages.join(', ')}"
      end
    end

    puts "✅ Importação finalizada!"
  end
end
