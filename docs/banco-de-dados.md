# 🗄️ Especificação de Banco de Dados — MonitoraMicrovida

Este documento detalha o modelo relacional, o dicionário de dados, as políticas de armazenamento e as rotinas de manutenção executadas no **PostgreSQL (Supabase)**.

---

## 📐 Diagrama Entidade-Relacionamento (DER)

```text
┌──────────────────────────────┐
│          OPERADORES          │
├──────────────────────────────┤
│ PK  id (UUID)                │
│     nome (TEXT)              │
│     pin (TEXT, UNIQUE)       │
│     ativo (BOOLEAN)          │
│     created_at (TIMESTAMPTZ) │
└──────────────────────────────┘
                │ 1
                │
       ┌─────────┴─────────┐
       │ N                N │
       ▼                  ▼

┌────────────────────────────────────┐          ┌────────────────────────────────────┐
│           LOTES_CULTURA            │  1     N │         REGISTROS_DIARIOS          │
├────────────────────────────────────┤          ├────────────────────────────────────┤
│ PK  id (UUID)                      │          │ PK  id (UUID)                      │
│     cultura (TEXT)                 │          │ FK  lote_id (UUID)                 │
│     identificacao (TEXT)           │          │     temperatura_agua (NUMERIC)     │
│     recipiente (TEXT)              │          │     ph (NUMERIC)                   │
│     litragem (NUMERIC)             │          │     amonia (NUMERIC)               │
│     substrato (TEXT)               │          │     nitrato (NUMERIC)              │
│     iluminacao (TEXT)              │          │     fosfato (NUMERIC)              │
│     aeracao (BOOLEAN)              │          │     salinidade (NUMERIC)           │
│     temperatura_ambiente (NUMERIC) │          │     temperatura_ambiente (NUMERIC) │
│     salinidade (NUMERIC)           │          │     observacoes (TEXT)             │
│     video_path (TEXT)              │          │     video_path (TEXT)              │
│     observacoes (TEXT)             │          │ FK  operador_id (UUID)             │
│ FK  operador_id (UUID)             │          │     created_at (TIMESTAMPTZ)       │
│     created_at (TIMESTAMPTZ)       │          └────────────────────────────────────┘
└─────────────────────────────────────┘

Legenda: PK = chave primária | FK = chave estrangeira | 1/N = "um para muitos"
