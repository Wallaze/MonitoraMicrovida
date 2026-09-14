---

### 2. `docs/banco-de-dados.md`

```markdown
# 🗄️ Especificação de Banco de Dados — MonitoraMicrovida

Este documento detalha o modelo relacional, o dicionário de dados, as políticas de armazenamento e as rotinas de manutenção executadas no **PostgreSQL (Supabase)**.

---

## 📐 Diagrama Entidade-Relacionamento (DER)

```text
┌─────────────────────────┐         ┌──────────────────────────────┐
│      LOTES_CULTURA      │         │      REGISTROS_DIARIOS       │
├─────────────────────────┤         ├──────────────────────────────┤
│ PK  id (UUID)           │ 1     N │ PK  id (UUID)                │
│     cultura (VARCHAR)   │◄────────┼─FK  lote_id (UUID)           │
│     identificacao (TEXT)│         │     data_registro (TIMESTAMPTZ)│
│     recipiente (VARCHAR)│         │     temp_agua (NUMERIC)      │
│     litragem (NUMERIC)  │         │     ph (NUMERIC)             │
│     substrato (VARCHAR) │         │     amonia (NUMERIC)         │
│     iluminacao (VARCHAR)│         │     nitrato (NUMERIC)        │
│     aeracao (BOOLEAN)   │         │     fosfato (NUMERIC)        │
│     temp_amb (NUMERIC)  │         │     salinidade (NUMERIC)     │
│     salinidade (NUMERIC)│         │     temp_amb (NUMERIC)       │
│     video_url (TEXT)    │         │     video_url (TEXT)         │
│     observacoes (TEXT)  │         │     observacoes (TEXT)       │
│     created_at (TIMESTAMP)        │     created_at (TIMESTAMPTZ) │
└─────────────────────────┘         └──────────────────────────────┘
