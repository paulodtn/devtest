class Api::V1::AuditLogsController < Api::V1::ApiController
  include Auditable
  
  # Pular verificação CSRF para endpoints de API
  skip_before_action :verify_authenticity_token
  
  before_action :set_audit_log, only: [:show]

  # GET /api/v1/audit_logs
  def index
    @audit_logs = AuditLog.recent
    
    # Filtros opcionais
    @audit_logs = @audit_logs.by_user(params[:user_id]) if params[:user_id].present?
    @audit_logs = @audit_logs.by_entity_type(params[:entity_type]) if params[:entity_type].present?
    @audit_logs = @audit_logs.by_action(params[:action_filter]) if params[:action_filter].present?
    
    # Paginação
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 50
    per_page = [per_page, 100].min # Máximo 100 por página
    
    @audit_logs = @audit_logs.limit(per_page).offset((page - 1) * per_page)
    
    render json: @audit_logs, each_serializer: AuditLogSerializer
  end

  # GET /api/v1/audit_logs/1
  def show
    render json: @audit_log, serializer: AuditLogSerializer
  end

  # POST /api/v1/audit_logs/export_bed
  def log_bed_export
    primers_count = params[:primers_count]&.to_i || 0
    selected_primers = params[:selected_primers] || []
    
    log_audit_action(
      action: 'export_bed',
      entity_type: 'Primer',
      details: {
        primers_count: primers_count,
        selected_primer_ids: selected_primers,
        export_format: 'bed'
      }
    )
    
    render json: { success: true, message: 'Exportação BED registrada com sucesso' }
  rescue => e
    Rails.logger.error "Erro ao registrar exportação BED: #{e.message}"
    render json: { success: false, error: e.message }, status: :internal_server_error
  end

  # POST /api/v1/audit_logs/export_csv
  def log_csv_export
    primers_count = params[:primers_count]&.to_i || 0
    selected_primers = params[:selected_primers] || []
    
    log_audit_action(
      action: 'export_csv',
      entity_type: 'Primer',
      details: {
        primers_count: primers_count,
        selected_primer_ids: selected_primers,
        export_format: 'csv'
      }
    )
    
    render json: { success: true, message: 'Exportação CSV registrada com sucesso' }
  rescue => e
    Rails.logger.error "Erro ao registrar exportação CSV: #{e.message}"
    render json: { success: false, error: e.message }, status: :internal_server_error
  end

  private

  def set_audit_log
    @audit_log = AuditLog.find(params[:id])
  end
end 