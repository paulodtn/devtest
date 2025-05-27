class RenameForwardColumnsToFoward < ActiveRecord::Migration[8.0]
  def change
    # Renomear forward_sequence para foward_sequence
    rename_column :primers, :forward_sequence, :foward_sequence
    
    # Renomear forward_temperature para foward_temperature
    rename_column :primers, :forward_temperature, :foward_temperature
  end
end
