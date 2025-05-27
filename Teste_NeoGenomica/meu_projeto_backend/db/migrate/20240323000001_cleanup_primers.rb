class CleanupPrimers < ActiveRecord::Migration[8.0]
  def up
    # Remove primers com dados vazios
    execute <<-SQL
      DELETE FROM primers 
      WHERE forward_sequence = 'N/A' 
      OR reverse_sequence = 'N/A' 
      OR chr = 'N/A' 
      OR transcrito = 'N/A' 
      OR genome_version = 'N/A';
    SQL

    # Reseta a sequência de IDs
    execute <<-SQL
      ALTER SEQUENCE primers_id_seq RESTART WITH 1;
    SQL

    # Atualiza os IDs para serem sequenciais
    execute <<-SQL
      WITH numbered_primers AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) as new_id
        FROM primers
      )
      UPDATE primers
      SET id = numbered_primers.new_id
      FROM numbered_primers
      WHERE primers.id = numbered_primers.id;
    SQL
  end

  def down
    # Não é possível reverter esta migration
  end
end 