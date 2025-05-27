# app/controllers/primers_controller.rb
require 'csv'

class PrimersController < ApplicationController
  before_action :ensure_json_request
  skip_before_action :verify_authenticity_token
  # before_action :authenticate_user!
  # before_action :authorize_admin, only: [:import_csv]

  def index
    primers = Primer.all
    render json: primers
  end

  def show
    primer = Primer.find(params[:id])
    render json: primer
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Primer não encontrado" }, status: :not_found
  end

  def import_csv
    unless valid_csv_file?
      return render_error("Por favor, envie um arquivo CSV válido.", :bad_request)
    end

    process_csv_import
  rescue StandardError => e
    handle_import_error(e)
  end

  private

  def ensure_json_request
    request.format = :json
  end

  def valid_csv_file?
    params[:file].present? && 
    (params[:file].content_type.in?(['text/csv', 'application/csv', 'application/vnd.ms-excel']) ||
     params[:file].original_filename.end_with?('.csv'))
  end

  def process_csv_import
    csv = parse_csv_file
    import_stats = { created: 0, updated: 0 }

    ActiveRecord::Base.transaction do
      csv.each do |row|
        primer = process_primer_row(row.to_hash)
        import_stats[primer.new_record? ? :created : :updated] += 1
      end
    end

    render_success(import_stats)
  end

  def parse_csv_file
    CSV.parse(params[:file].read, headers: true, header_converters: :symbol, col_sep: ',')
  end

  def process_primer_row(row_data)
    convert_numeric_fields(row_data)
    primer = Primer.find_or_initialize_by(label: row_data[:label])
    primer.update!(row_data)
    primer
  rescue ActiveRecord::RecordInvalid => e
    raise StandardError, "Erro na linha #{row_data}: #{e.message}"
  end

  def convert_numeric_fields(data)
    numeric_fields = {
      float: %w[forward_temperature reverse_temperature],
      integer: %w[start end]
    }

    numeric_fields.each do |type, fields|
      fields.each do |field|
        next unless data[field.to_sym].present?
        data[field.to_sym] = type == :float ? data[field.to_sym].to_f : data[field.to_sym].to_i
      end
    end
  end

  def render_success(stats)
    render json: {
      status: :success,
      message: "Importação concluída com sucesso.",
      data: {
        created: stats[:created],
        updated: stats[:updated]
      }
    }, status: :ok
  end

  def render_error(message, status)
    render json: {
      status: :error,
      message: message
    }, status: status
  end

  def handle_import_error(error)
    Rails.logger.error("CSV Import Error: #{error.message}\n#{error.backtrace.join("\n")}")
    render_error("Erro na importação: #{error.message}", :unprocessable_entity)
  end
end

# app/controllers/api/primers_controller.rb
class Api::PrimersController < ApplicationController
  before_action :set_default_response_format

  def index
    @primers = Primer.all
    render json: @primers
  end

  private

  def set_default_response_format
    request.format = :json
  end
end