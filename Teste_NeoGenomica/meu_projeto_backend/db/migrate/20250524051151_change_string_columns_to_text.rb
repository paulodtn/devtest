class ChangeStringColumnsToText < ActiveRecord::Migration[8.0]
  def change
    # Alterando todas as colunas string para text
    change_column :primers, :label, :text
    change_column :primers, :foward_sequence, :text
    change_column :primers, :reverse_sequence, :text
    change_column :primers, :chr, :text
    change_column :primers, :transcrito, :text
    change_column :primers, :conditions, :text
    change_column :primers, :exon, :text
    change_column :primers, :genome_version, :text
    change_column :primers, :size, :text
  end
end
