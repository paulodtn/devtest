class CreateAuditLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :audit_logs do |t|
      t.string :action, null: false              # Ação realizada (ex: 'create_primer', 'edit_primer', etc.)
      t.string :entity_type, null: false         # Tipo da entidade (ex: 'Primer')
      t.integer :entity_id                       # ID da entidade (pode ser null para ações como import)
      t.string :entity_name                      # Nome/label da entidade para facilitar identificação
      t.string :user_id, null: false             # ID do usuário que executou a ação
      t.string :user_name, null: false           # Nome do usuário para facilitar leitura
      t.text :details                            # Detalhes adicionais em JSON
      t.datetime :performed_at, null: false      # Data e hora da ação
      
      t.timestamps
    end

    # Índices para melhorar performance das consultas
    add_index :audit_logs, :user_id
    add_index :audit_logs, :entity_type
    add_index :audit_logs, :performed_at
    add_index :audit_logs, [:entity_type, :entity_id]
  end
end
