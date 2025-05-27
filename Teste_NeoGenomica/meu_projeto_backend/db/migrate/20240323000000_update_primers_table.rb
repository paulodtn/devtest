class UpdatePrimersTable < ActiveRecord::Migration[7.0]
  def up
    # Removendo colunas antigas se existirem
    remove_column :primers, :name if column_exists?(:primers, :name)
    remove_column :primers, :sequence if column_exists?(:primers, :sequence)
    remove_column :primers, :target_gene if column_exists?(:primers, :target_gene)

    # Adicionando novas colunas inicialmente permitindo valores nulos
    add_column :primers, :label, :string unless column_exists?(:primers, :label)
    add_column :primers, :forward_sequence, :string unless column_exists?(:primers, :forward_sequence)
    add_column :primers, :reverse_sequence, :string unless column_exists?(:primers, :reverse_sequence)
    add_column :primers, :forward_temperature, :decimal, precision: 4, scale: 1 unless column_exists?(:primers, :forward_temperature)
    add_column :primers, :reverse_temperature, :decimal, precision: 4, scale: 1 unless column_exists?(:primers, :reverse_temperature)
    add_column :primers, :chr, :string unless column_exists?(:primers, :chr)
    add_column :primers, :transcrito, :string unless column_exists?(:primers, :transcrito)
    add_column :primers, :start, :integer unless column_exists?(:primers, :start)
    add_column :primers, :end, :integer unless column_exists?(:primers, :end)
    add_column :primers, :conditions, :string unless column_exists?(:primers, :conditions)
    add_column :primers, :exon, :string unless column_exists?(:primers, :exon)
    add_column :primers, :genome_version, :string unless column_exists?(:primers, :genome_version)
    add_column :primers, :bed, :text unless column_exists?(:primers, :bed)
    add_column :primers, :size, :integer unless column_exists?(:primers, :size)

    # Atualizando registros existentes com valores padrão
    execute <<-SQL
      UPDATE primers
      SET label = 'Primer ' || id::text,
          forward_sequence = 'N/A',
          reverse_sequence = 'N/A',
          chr = 'N/A',
          transcrito = 'N/A',
          start = 0,
          "end" = 0,
          genome_version = 'N/A'
      WHERE label IS NULL
        OR forward_sequence IS NULL
        OR reverse_sequence IS NULL
        OR chr IS NULL
        OR transcrito IS NULL
        OR start IS NULL
        OR "end" IS NULL
        OR genome_version IS NULL;
    SQL

    # Adicionando restrições NOT NULL após atualizar os dados
    change_column_null :primers, :label, false
    change_column_null :primers, :forward_sequence, false
    change_column_null :primers, :reverse_sequence, false
    change_column_null :primers, :chr, false
    change_column_null :primers, :transcrito, false
    change_column_null :primers, :start, false
    change_column_null :primers, :end, false
    change_column_null :primers, :genome_version, false

    # Adicionando índices
    add_index :primers, :label, unique: true unless index_exists?(:primers, :label)
    add_index :primers, :forward_sequence unless index_exists?(:primers, :forward_sequence)
    add_index :primers, :reverse_sequence unless index_exists?(:primers, :reverse_sequence)
    add_index :primers, :transcrito unless index_exists?(:primers, :transcrito)
  end

  def down
    # Removendo índices
    remove_index :primers, :label if index_exists?(:primers, :label)
    remove_index :primers, :forward_sequence if index_exists?(:primers, :forward_sequence)
    remove_index :primers, :reverse_sequence if index_exists?(:primers, :reverse_sequence)
    remove_index :primers, :transcrito if index_exists?(:primers, :transcrito)

    # Removendo novas colunas
    remove_column :primers, :label if column_exists?(:primers, :label)
    remove_column :primers, :forward_sequence if column_exists?(:primers, :forward_sequence)
    remove_column :primers, :reverse_sequence if column_exists?(:primers, :reverse_sequence)
    remove_column :primers, :forward_temperature if column_exists?(:primers, :forward_temperature)
    remove_column :primers, :reverse_temperature if column_exists?(:primers, :reverse_temperature)
    remove_column :primers, :chr if column_exists?(:primers, :chr)
    remove_column :primers, :transcrito if column_exists?(:primers, :transcrito)
    remove_column :primers, :start if column_exists?(:primers, :start)
    remove_column :primers, :end if column_exists?(:primers, :end)
    remove_column :primers, :conditions if column_exists?(:primers, :conditions)
    remove_column :primers, :exon if column_exists?(:primers, :exon)
    remove_column :primers, :genome_version if column_exists?(:primers, :genome_version)
    remove_column :primers, :bed if column_exists?(:primers, :bed)
    remove_column :primers, :size if column_exists?(:primers, :size)

    # Restaurando colunas antigas
    add_column :primers, :name, :string unless column_exists?(:primers, :name)
    add_column :primers, :sequence, :string unless column_exists?(:primers, :sequence)
    add_column :primers, :target_gene, :string unless column_exists?(:primers, :target_gene)
  end
end 