require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Configurações básicas do ambiente
  config.enable_reloading = true
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true

  # Configurações de cache
  config.cache_store = :memory_store
  if Rails.root.join("tmp/caching-dev.txt").exist?
    config.action_controller.perform_caching = true
    config.action_controller.enable_fragment_cache_logging = true
    config.public_file_server.headers = { 
      "Cache-Control" => "public, max-age=#{2.days.to_i}" 
    }
  else
    config.action_controller.perform_caching = false
  end

  # Armazenamento de arquivos
  config.active_storage.service = :local

  # Configurações de email
  config.action_mailer.default_url_options = { host: "localhost", port: 3000 }
  config.action_mailer.raise_delivery_errors = false
  config.action_mailer.perform_caching = false

  # Monitoramento e logs
  config.active_support.deprecation = :log
  config.active_record.verbose_query_logs = true
  config.active_record.query_log_tags_enabled = true
  config.active_record.migration_error = :page_load
  config.active_job.verbose_enqueue_logs = true
  config.action_view.annotate_rendered_view_with_filenames = true

  # Segurança
  config.action_controller.raise_on_missing_callback_actions = true

  # Web Console (desativado para APIs)
  config.web_console.whiny_requests = false
  config.web_console.allowed_ips = ['127.0.0.1', '::1']
end

# Desabilita completamente o Web Console para requisições API
if Rails.env.development?
  Rails.application.config.middleware.delete(WebConsole::Middleware)
end