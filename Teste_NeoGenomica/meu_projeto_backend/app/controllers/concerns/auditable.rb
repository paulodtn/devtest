module Auditable
  extend ActiveSupport::Concern
  
  private
  
  def log_audit_action(action:, entity_type:, entity_id: nil, entity_name: nil, details: nil)
    # Por enquanto, vamos usar dados fixos do usuário
    # Quando implementarmos autenticação real, isso virá do current_user
    user_id = 'admin_1'
    user_name = 'Administrador'
    
    AuditLog.log_action(
      action: action,
      entity_type: entity_type,
      entity_id: entity_id,
      entity_name: entity_name,
      user_id: user_id,
      user_name: user_name,
      details: details
    )
  rescue => e
    # Log do erro mas não falha a operação principal
    Rails.logger.error "Erro ao registrar auditoria: #{e.message}"
  end
end 