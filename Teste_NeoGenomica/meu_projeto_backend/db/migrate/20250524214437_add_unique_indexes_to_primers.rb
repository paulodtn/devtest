class AddUniqueIndexesToPrimers < ActiveRecord::Migration[8.0]
  def change
    # Índice único para combinação de coordenadas genômicas
    add_index :primers, [:chr, :start, :end], unique: true, name: 'index_primers_on_genomic_coords'
    
    # Índice único para combinação de sequências
    add_index :primers, [:foward_sequence, :reverse_sequence], unique: true, name: 'index_primers_on_sequences'
    
    # Remover validação de sobreposição genômica do modelo pois é muito restritiva
    # O índice único para coordenadas já garante que não haverá primers idênticos
  end
end
