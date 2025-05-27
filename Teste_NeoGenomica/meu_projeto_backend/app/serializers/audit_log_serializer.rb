class AuditLogSerializer < ActiveModel::Serializer
  attributes :id, :action, :entity_type, :entity_id, :entity_name, 
             :user_id, :user_name, :details, :performed_at, 
             :formatted_action, :formatted_date, :parsed_details

  def parsed_details
    object.parsed_details
  end
end 