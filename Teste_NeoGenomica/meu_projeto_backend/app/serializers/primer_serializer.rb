class PrimerSerializer < ActiveModel::Serializer
  attributes :id, :label, :foward_sequence, :reverse_sequence, :foward_temperature, 
             :reverse_temperature, :chr, :transcrito, :start, :end, :conditions, 
             :exon, :genome_version, :bed, :size, :created_at, :updated_at

  def created_at
    object.created_at.iso8601
  end

  def updated_at
    object.updated_at.iso8601
  end
end 