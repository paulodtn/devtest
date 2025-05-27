class Primer < ApplicationRecord
  # Validações de presença
  validates :label, :foward_sequence, :reverse_sequence, :foward_temperature,
            :reverse_temperature, :chr, :transcrito, :start, :end, :conditions,
            :exon, :genome_version, :bed, :size, presence: true

  # Validações de unicidade - campos que NÃO podem ser compartilhados
  validates :label, uniqueness: { message: 'já está em uso' }
  validates :foward_sequence, uniqueness: { message: 'já está em uso' }
  validates :reverse_sequence, uniqueness: { message: 'já está em uso' }
  
  # Validação de unicidade para coordenadas genômicas (chr + start + end)
  validates :chr, uniqueness: { 
    scope: [:start, :end], 
    message: 'combinação de cromossomo, posição inicial e final já existe' 
  }

  # Validações de formato
  validates :foward_sequence, :reverse_sequence, format: { 
    with: /\A[ATCG]*\z/i,
    message: 'deve conter apenas caracteres A, T, G, C'
  }

  # Validações numéricas
  validates :foward_temperature, :reverse_temperature,
            numericality: { 
              greater_than_or_equal_to: 0,
              less_than_or_equal_to: 100,
              message: 'deve estar entre 0 e 100°C'
            }

  validates :start, :end,
            numericality: { 
              only_integer: true,
              greater_than_or_equal_to: 0,
              message: 'deve ser um número inteiro positivo'
            }

  # Validação do formato do cromossomo
  validates :chr, inclusion: { 
    in: %w[1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 X Y MT],
    message: "deve ser um cromossomo válido (1-22, X, Y, MT)"
  }

  # Validação da ordem das posições
  validate :start_before_end

  private

  def start_before_end
    return unless start.present? && self.end.present?
    if start >= self.end
      errors.add(:base, "A posição inicial deve ser menor que a posição final")
    end
  end
end
