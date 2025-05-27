Rails.application.routes.draw do
  # Rotas básicas
  get "home/index"
  get 'cadastro', to: 'users#new'
  get "up" => "rails/health#show", as: :rails_health_check
  root "home#index"

  # Rotas para Primers (RESTful + custom)
  resources :primers, only: [:index, :show] do
    collection do
      post :import_csv
    end
  end

  # Namespace para a API (versão 1)
  namespace :api do
    namespace :v1 do
      # Rota de teste de saúde da API
      get 'health_check', to: 'test#health_check'
      
      # Rotas de autenticação
      namespace :auth do
        post 'login'
        post 'logout'
        get 'me'
        post 'validate_password'
      end
      
      # Rotas completas para primers (CRUD)
      resources :primers
      
      # Rota para importação de primers via CSV
      resources :primer_imports, only: [:create]
      
      # Rotas para histórico de auditoria (apenas leitura)
      resources :audit_logs, only: [:index, :show] do
        collection do
          post :log_bed_export
          post :log_csv_export
        end
      end
    end
  end
end