module Api
  module V1
    class TestController < ApiController
      def health_check
        render_success({
          status: "online",
          message: "API está funcionando corretamente!",
          timestamp: Time.current
        })
      end
    end
  end
end 