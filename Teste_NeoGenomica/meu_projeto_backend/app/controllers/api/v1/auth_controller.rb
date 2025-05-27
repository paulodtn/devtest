require 'jwt'

module Api
  module V1
    class AuthController < Api::V1::ApiController
      skip_before_action :verify_authenticity_token
      
      # POST /api/v1/auth/login
      def login
        username = params[:username]
        password = params[:password]
        client_ip = request.remote_ip
        
        # Verificar se o usuário está bloqueado
        blocked_status = user_blocked?(username, client_ip)
        
        if blocked_status
          remaining_time = get_remaining_block_time(username, client_ip)
          render json: {
            success: false,
            error: "Muitas tentativas de login falhadas. Tente novamente em #{remaining_time} segundos.",
            blocked: true,
            remaining_time: remaining_time
          }, status: :too_many_requests
          return
        end
        
        # Validação das credenciais (para demonstração)
        if valid_credentials?(username, password)
          # Login bem-sucedido - limpar tentativas falhadas
          clear_failed_attempts(username, client_ip)
          
          # Gerar token JWT real
          token = generate_jwt_token(username)
          user_data = get_user_data(username)
          
          render json: {
            success: true,
            token: token,
            user: user_data,
            message: 'Login realizado com sucesso'
          }, status: :ok
        else
          # Login falhado - incrementar tentativas
          increment_failed_attempts(username, client_ip)
          attempts = get_failed_attempts(username, client_ip)
          
          if attempts >= 3
            block_user(username, client_ip)
            render json: {
              success: false,
              error: 'Muitas tentativas de login falhadas. Usuário bloqueado por 10 segundos.',
              blocked: true,
              remaining_time: 10
            }, status: :too_many_requests
          else
            remaining_attempts = 3 - attempts
            render json: {
              success: false,
              error: "Usuário ou senha incorretos. Restam #{remaining_attempts} tentativa(s).",
              remaining_attempts: remaining_attempts
            }, status: :unauthorized
          end
        end
      rescue StandardError => e
        Rails.logger.error "Erro no login: #{e.message}"
        render json: {
          success: false,
          error: 'Erro interno do servidor'
        }, status: :internal_server_error
      end
      
      # POST /api/v1/auth/logout
      def logout
        # Em uma implementação real, você invalidaria o token aqui
        render json: {
          success: true,
          message: 'Logout realizado com sucesso'
        }, status: :ok
      end
      
      # GET /api/v1/auth/me
      def me
        begin
          token = extract_token_from_header
          
          if token && valid_token?(token)
            user_data = decode_jwt_token(token)
            render json: {
              success: true,
              user: user_data
            }, status: :ok
          else
            render json: {
              success: false,
              error: 'Token inválido ou expirado'
            }, status: :unauthorized
          end
        rescue StandardError => e
          Rails.logger.error "Erro na validação do token: #{e.message}"
          render json: {
            success: false,
            error: 'Erro interno do servidor'
          }, status: :internal_server_error
        end
      end
      
      # POST /api/v1/auth/validate_password
      def validate_password
        begin
          token = extract_token_from_header
          password = params[:password]
          
          if token && valid_token?(token)
            user_data = decode_jwt_token(token)
            username = user_data[:username]
            
            # Validar se a senha fornecida é a senha de confirmação do usuário
            if valid_confirmation_password?(username, password)
              render json: {
                success: true,
                message: 'Senha validada com sucesso'
              }, status: :ok
            else
              render json: {
                success: false,
                error: 'Senha de confirmação incorreta'
              }, status: :unauthorized
            end
          else
            render json: {
              success: false,
              error: 'Token inválido ou expirado'
            }, status: :unauthorized
          end
        rescue StandardError => e
          Rails.logger.error "Erro na validação da senha: #{e.message}"
          render json: {
            success: false,
            error: 'Erro interno do servidor'
          }, status: :internal_server_error
        end
      end
      
      private
      
      def valid_credentials?(username, password)
        # Para demonstração, mantemos as credenciais fixas
        # Em produção, isso viria do banco de dados
        demo_users = {
          'admin_1' => '123',
          'demo' => 'demo123'
        }
        
        demo_users[username] == password
      end
      
      def generate_jwt_token(username)
        payload = {
          username: username,
          exp: (Time.current + 24.hours).to_i, # Token expira em 24 horas
          iat: Time.current.to_i
        }
        
        JWT.encode(payload, jwt_secret, 'HS256')
      end
      
      def get_user_data(username)
        # Dados do usuário para demonstração
        user_profiles = {
          'admin_1' => {
            id: 1,
            username: 'admin_1',
            name: 'Administrador',
            role: 'admin',
            email: 'admin@neogenomica.com'
          },
          'demo' => {
            id: 2,
            username: 'demo',
            name: 'Usuário Demo',
            role: 'user',
            email: 'demo@neogenomica.com'
          }
        }
        
        user_profiles[username] || {}
      end
      
      def valid_confirmation_password?(username, password)
        # Senhas de confirmação individuais para cada usuário
        confirmation_passwords = {
          'admin_1' => 'admin123',  # Senha de confirmação do admin
          'demo' => 'demo123'       # Senha de confirmação do demo (simples como solicitado)
        }
        
        confirmation_passwords[username] == password
      end
      
      def extract_token_from_header
        auth_header = request.headers['Authorization']
        return nil unless auth_header
        
        auth_header.split(' ').last if auth_header.start_with?('Bearer ')
      end
      
      def valid_token?(token)
        begin
          decoded = JWT.decode(token, jwt_secret, true, { algorithm: 'HS256' })
          return decoded.first['exp'] > Time.current.to_i
        rescue JWT::DecodeError, JWT::ExpiredSignature
          return false
        end
      end
      
      def decode_jwt_token(token)
        begin
          decoded = JWT.decode(token, jwt_secret, true, { algorithm: 'HS256' })
          username = decoded.first['username']
          get_user_data(username)
        rescue JWT::DecodeError
          nil
        end
      end
      
      def jwt_secret
        # Em produção, isso viria de uma variável de ambiente
        ENV.fetch('SECRET_KEY_BASE') { Rails.application.secret_key_base }
      end
      
      # Métodos para controle de tentativas de login
      def cache_key_attempts(username, ip)
        "login_attempts:#{username}:#{ip}"
      end
      
      def cache_key_blocked(username, ip)
        "login_blocked:#{username}:#{ip}"
      end
      
      def get_failed_attempts(username, ip)
        Rails.cache.read(cache_key_attempts(username, ip)) || 0
      end
      
      def increment_failed_attempts(username, ip)
        key = cache_key_attempts(username, ip)
        current_attempts = get_failed_attempts(username, ip)
        new_attempts = current_attempts + 1
        Rails.cache.write(key, new_attempts, expires_in: 5.minutes)
      end
      
      def clear_failed_attempts(username, ip)
        Rails.cache.delete(cache_key_attempts(username, ip))
        Rails.cache.delete(cache_key_blocked(username, ip))
      end
      
      def block_user(username, ip)
        Rails.cache.write(cache_key_blocked(username, ip), Time.current.to_i, expires_in: 10.seconds)
      end
      
      def user_blocked?(username, ip)
        blocked_time = Rails.cache.read(cache_key_blocked(username, ip))
        return false unless blocked_time
        
        # Verificar se ainda está dentro do período de bloqueio
        current_time = Time.current.to_i
        elapsed_time = current_time - blocked_time
        
        # Se passou mais de 10 segundos, remover do cache e desbloquear
        if elapsed_time >= 10
          Rails.cache.delete(cache_key_blocked(username, ip))
          return false
        end
        
        true
      end
      
      def get_remaining_block_time(username, ip)
        blocked_time = Rails.cache.read(cache_key_blocked(username, ip))
        return 0 unless blocked_time
        
        remaining = 10 - (Time.current.to_i - blocked_time)
        [remaining, 0].max
      end
    end
  end
end 