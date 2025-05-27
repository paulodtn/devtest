module Api
  module V1
    class ApiController < ActionController::Base
      protect_from_forgery with: :null_session
      
      # Resposta padrão para formato JSON
      before_action :set_default_format
      
      private
      
      def set_default_format
        request.format = :json
      end
      
      # Método para resposta de erro padrão
      def render_error(message, status = :unprocessable_entity)
        render json: { error: message }, status: status
      end
      
      # Método para resposta de sucesso padrão
      def render_success(data, status = :ok)
        render json: data, status: status
      end
    end
  end
end 