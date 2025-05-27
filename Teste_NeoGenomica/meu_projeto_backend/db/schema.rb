# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_05_26_050959) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "audit_logs", force: :cascade do |t|
    t.string "action", null: false
    t.string "entity_type", null: false
    t.integer "entity_id"
    t.string "entity_name"
    t.string "user_id", null: false
    t.string "user_name", null: false
    t.text "details"
    t.datetime "performed_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["entity_type", "entity_id"], name: "index_audit_logs_on_entity_type_and_entity_id"
    t.index ["entity_type"], name: "index_audit_logs_on_entity_type"
    t.index ["performed_at"], name: "index_audit_logs_on_performed_at"
    t.index ["user_id"], name: "index_audit_logs_on_user_id"
  end

  create_table "primers", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "label", null: false
    t.text "foward_sequence", null: false
    t.text "reverse_sequence", null: false
    t.decimal "foward_temperature", precision: 4, scale: 1
    t.decimal "reverse_temperature", precision: 4, scale: 1
    t.text "chr", null: false
    t.text "transcrito", null: false
    t.integer "start", null: false
    t.integer "end", null: false
    t.text "conditions"
    t.text "exon"
    t.text "genome_version", null: false
    t.text "bed"
    t.text "size"
    t.index ["chr", "start", "end"], name: "index_primers_on_genomic_coords", unique: true
    t.index ["foward_sequence", "reverse_sequence"], name: "index_primers_on_sequences", unique: true
    t.index ["foward_sequence"], name: "index_primers_on_foward_sequence_unique", unique: true
    t.index ["label"], name: "index_primers_on_label", unique: true
    t.index ["reverse_sequence"], name: "index_primers_on_reverse_sequence_unique", unique: true
    t.index ["transcrito"], name: "index_primers_on_transcrito"
  end
end
