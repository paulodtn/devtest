class FixPrimersIdSequence < ActiveRecord::Migration[7.0]
  def up
    # Primeiro, vamos obter o maior ID atual
    max_id = execute("SELECT COALESCE(MAX(id), 0) FROM primers").first['coalesce']
    
    # Resetar a sequência para começar após o maior ID
    execute("ALTER SEQUENCE primers_id_seq RESTART WITH #{max_id + 1}")
  end

  def down
    # Não é possível reverter esta migração com segurança
  end
end 