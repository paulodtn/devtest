# 🔍 Filtro Avançado por Coordenadas - Documentação

## 📋 Resumo
Implementação de um filtro avançado para buscar primers com base em cromossomo e coordenadas genômicas.

## 🎯 Funcionalidades Implementadas

### 1. **Filtro Avançado (Frontend)**
- **Localização**: `src/components/PrimerList/PrimerList.jsx`
- **Campos disponíveis**:
  - **Cromossomo**: Campo de texto livre onde o usuário pode digitar qualquer cromossomo (1-22, X, Y, MT, etc.)
  - **Posição Inicial**: Campo de texto que aceita coordenadas com caracteres especiais
  - **Posição Final**: Campo de texto que aceita coordenadas com caracteres especiais

### 2. **Limpeza Automática de Caracteres Especiais**
- **Função**: `cleanGenomicCoordinate(value)`
- **Comportamento**: Remove automaticamente todos os caracteres não numéricos
- **Exemplos**:
  - `48.520.301` → `48520301`
  - `48,520,301` → `48520301`
  - `48 520 301` → `48520301`
  - `chr7:48.520.301` → `48520301`

### 3. **Lógica de Filtro (Backend)**
- **Localização**: `meu_projeto_backend/app/controllers/api/v1/primers_controller.rb`
- **Lógica implementada**:
  ```ruby
  # Filtro avançado por coordenadas
  @primers = @primers.where(chr: params[:chr]) if params[:chr].present?
  
  # primer.start >= start_input
  if params[:start_min].present?
    @primers = @primers.where("start >= ?", params[:start_min])
  end
  
  # primer.end <= end_input  
  if params[:end_max].present?
    @primers = @primers.where("\"end\" <= ?", params[:end_max])
  end
  ```

### 4. **Botões de Limpeza**
- **Botão no filtro avançado**: Limpa apenas os filtros avançados
- **Botão na barra de busca**: Aparece quando há filtros ativos e limpa TODOS os filtros
- **Contador de filtros**: Mostra quantos filtros estão ativos

## 🔍 Como Usar

### Exemplo 1: Buscar primers no cromossomo 7
1. Clique em "Filtro Avançado"
2. Digite "7" no campo cromossomo
3. Clique em "Aplicar Filtros"

### Exemplo 2: Buscar primers em uma região específica
1. Clique em "Filtro Avançado"
2. Digite cromossomo: "7"
3. Digite posição inicial: "76.000.000" (será limpo para "76000000")
4. Digite posição final: "77.000.000" (será limpo para "77000000")
5. Clique em "Aplicar Filtros"

**Resultado**: Retorna primers onde:
- `primer.chr == "7"`
- `primer.start >= 76000000`
- `primer.end <= 77000000`

### Exemplo 3: Cromossomos especiais
- Digite "X" para cromossomo X
- Digite "Y" para cromossomo Y
- Digite "MT" para cromossomo mitocondrial

## 🧪 Testes

### Script de Teste
- **Arquivo**: `meu_projeto_backend/teste_filtro_genomico_igv.rb`
- **Execução**: `ruby teste_filtro_genomico_igv.rb`

### Resultados dos Testes
✅ **Filtro por cromossomo**: Funcional  
✅ **Filtro por posição inicial**: Funcional  
✅ **Filtro por posição final**: Funcional  
✅ **Filtro combinado**: Funcional  
✅ **Limpeza de caracteres especiais**: Funcional  

## 📡 API Endpoints

### GET /api/v1/primers
**Parâmetros de filtro avançado**:
- `chr`: Cromossomo (ex: "7", "X", "Y", "MT")
- `start_min`: Posição inicial mínima (ex: "76000000")
- `end_max`: Posição final máxima (ex: "77000000")

**Exemplo de URL**:
```
GET /api/v1/primers?chr=7&start_min=76000000&end_max=77000000
```

## 🎨 Interface do Usuário

### Estados Visuais
- **Filtro fechado**: Botão "Filtro Avançado" com ícone de expansão
- **Filtro aberto**: Formulário com 3 campos organizados em grid
- **Filtros ativos**: Chip mostrando quantidade + botão "Limpar"
- **Busca ativa**: Botão "Limpar Filtros (N)" na barra de busca

### Feedback Visual
- **Placeholders**: Mostram exemplos de formato aceito
- **Helper text**: Explica o comportamento de cada campo
- **Contador**: Mostra quantos filtros estão ativos
- **Limpeza automática**: Caracteres especiais removidos transparentemente

### Campos de Entrada
- **Cromossomo**: Campo de texto livre (aceita qualquer valor)
  - **Conversão automática**: Letras são convertidas automaticamente para maiúsculo
  - Exemplos: `x` → `X`, `y` → `Y`, `mt` → `MT`
- **Coordenadas**: Campos de texto que aceitam qualquer formato, mas mantêm apenas números

## 🔧 Arquitetura

### Frontend (React)
```
PrimerList.jsx
├── genomicFilters (state)
├── appliedGenomicFilters (state)
├── cleanGenomicCoordinate() (função)
├── applyGenomicFilters() (função)
├── updateGenomicFilter() (função)
└── clearAllFilters() (função)
```

### Backend (Rails)
```
primers_controller.rb
├── index action
├── Filtro por chr
├── Filtro por start_min
└── Filtro por end_max
```

### API Service
```
api.js
├── listPrimers(filters)
├── Construção de parâmetros
└── Tratamento de resposta
```

## ✨ Características Especiais

1. **Campo de cromossomo livre**: Usuário pode digitar qualquer valor
2. **Conversão automática para maiúsculo**: Cromossomos como X, Y, MT são automaticamente convertidos
3. **Limpeza automática robusta**: Remove todos os caracteres não numéricos
4. **Filtros combinados**: Funciona junto com busca por texto
5. **Interface intuitiva**: Design claro e responsivo
6. **Feedback visual**: Mostra filtros ativos e permite limpeza fácil

## 🆕 Melhorias Implementadas

- **Campo de cromossomo mais flexível**: Não limitado a uma lista predefinida
- **Conversão automática para maiúsculo**: `x` → `X`, `y` → `Y`, `mt` → `MT`
- **Limpeza mais robusta**: Remove qualquer caractere não numérico
- **Interface simplificada**: Menos elementos visuais, mais foco na funcionalidade
- **Nomenclatura clara**: "Filtro Avançado" é mais intuitivo que "Filtro Genômico" 