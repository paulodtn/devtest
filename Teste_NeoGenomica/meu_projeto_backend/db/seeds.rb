# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Dados de teste para primers genéticos
primers = [
  {
    name: 'GAPDH-F',
    sequence: 'TGCACCACCAACTGCTTAGC',
    target_gene: 'GAPDH'
  },
  {
    name: 'GAPDH-R',
    sequence: 'GGCATGGACTGTGGTCATGAG',
    target_gene: 'GAPDH'
  },
  {
    name: 'TNF-alpha-F',
    sequence: 'CCTCTCTCTAATCAGCCCTCTG',
    target_gene: 'TNF-alpha'
  },
  {
    name: 'TNF-alpha-R',
    sequence: 'GAGGACCTGGGAGTAGATGAG',
    target_gene: 'TNF-alpha'
  },
  {
    name: 'IL6-F',
    sequence: 'ACTCACCTCTTCAGAACGAATTG',
    target_gene: 'IL6'
  },
  {
    name: 'IL6-R',
    sequence: 'CCATCTTTGGAAGGTTCAGGTTG',
    target_gene: 'IL6'
  },
  {
    name: 'BRCA1-F',
    sequence: 'GGCTATCCTCTCAGAGTGACATTTTA',
    target_gene: 'BRCA1'
  },
  {
    name: 'BRCA1-R',
    sequence: 'GCTTTGTAAGTTCATTTGCTTTGA',
    target_gene: 'BRCA1'
  },
  {
    name: 'TP53-F',
    sequence: 'CAGCACATGACGGAGGTTGT',
    target_gene: 'TP53'
  },
  {
    name: 'TP53-R',
    sequence: 'TCATCCAAATACTCCACACGC',
    target_gene: 'TP53'
  }
]

# Limpa todos os primers existentes
puts 'Limpando banco de dados...'
Primer.destroy_all

# Cria os novos primers
puts 'Criando primers de teste...'
primers.each do |primer|
  Primer.create!(primer)
end

puts "Criados #{Primer.count} primers com sucesso!"
