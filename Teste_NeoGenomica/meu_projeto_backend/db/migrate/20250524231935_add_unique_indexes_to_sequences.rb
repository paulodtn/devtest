class AddUniqueIndexesToSequences < ActiveRecord::Migration[8.0]
  def change
    # Remove índices existentes
    remove_index :primers, name: "index_primers_on_foward_sequence" if index_exists?(:primers, :foward_sequence)
    remove_index :primers, name: "index_primers_on_reverse_sequence" if index_exists?(:primers, :reverse_sequence)
    
    # Adiciona índices únicos individuais
    add_index :primers, :foward_sequence, unique: true, name: "index_primers_on_foward_sequence_unique"
    add_index :primers, :reverse_sequence, unique: true, name: "index_primers_on_reverse_sequence_unique"
  end
end
