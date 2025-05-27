class ChangeSizeColumnToString < ActiveRecord::Migration[8.0]
  def change
    # Alterar a coluna size de integer para string para aceitar valores como "230pb"
    change_column :primers, :size, :string
  end
end
