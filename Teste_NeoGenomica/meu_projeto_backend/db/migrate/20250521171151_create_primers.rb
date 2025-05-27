class CreatePrimers < ActiveRecord::Migration[8.0]
  def change
    create_table :primers do |t|
      t.string :name, null: false
      t.string :sequence, null: false
      t.string :target_gene, null: false

      t.timestamps
    end

    add_index :primers, :name, unique: true
  end
end
