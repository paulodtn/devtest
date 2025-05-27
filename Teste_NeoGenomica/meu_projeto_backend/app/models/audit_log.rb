class AuditLog < ApplicationRecord
  # Validações
  validates :action, :entity_type, :user_id, :user_name, :performed_at, presence: true
  
  # Scopes para facilitar consultas
  scope :recent, -> { order(performed_at: :desc) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }
  scope :by_entity_type, ->(type) { where(entity_type: type) }
  scope :by_action, ->(action) { where(action: action) }
  
  # Método para criar log de auditoria
  def self.log_action(action:, entity_type:, entity_id: nil, entity_name: nil, user_id:, user_name:, details: nil)
    create!(
      action: action,
      entity_type: entity_type,
      entity_id: entity_id,
      entity_name: entity_name,
      user_id: user_id,
      user_name: user_name,
      details: details&.to_json,
      performed_at: Time.current
    )
  end
  
  # Método para obter detalhes parseados
  def parsed_details
    return {} unless details.present?
    JSON.parse(details)
  rescue JSON::ParserError
    {}
  end
  
  # Método para formatar a ação para exibição
  def formatted_action
    case action
    when 'create_primer'
      "Criou primer: #{entity_name}"
    when 'update_primer'
      "Editou primer: #{entity_name}"
    when 'delete_primer'
      "Excluiu primer: #{entity_name}"
    when 'export_bed'
      details_hash = parsed_details
      count = details_hash['primers_count'] || 0
      "Exportou #{count} primer(s) para arquivo .bed"
    when 'export_csv'
      details_hash = parsed_details
      count = details_hash['primers_count'] || 0
      "Exportou #{count} primer(s) para arquivo CSV"
    when 'import_csv'
      details_hash = parsed_details
      created = details_hash['created_count'] || 0
      updated = details_hash['updated_count'] || 0
      "Upload CSV: #{created} criados, #{updated} atualizados"
    else
      action.humanize
    end
  end
  
  # Método para formatar data em português
  def formatted_date
    performed_at.strftime('%d/%m/%Y às %H:%M')
  end
end 