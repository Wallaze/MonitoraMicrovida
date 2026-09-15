# Supabase — MonitoraMicrovida

Este diretório documenta a configuração de backend do projeto (PostgreSQL + Storage).

## Estrutura

- `migrations/` — histórico versionado de mudanças no schema do banco (arquivos `.sql`, numerados em ordem: `0001_...`, `0002_...`).
- `seed/` — dados de exemplo para popular o banco em ambiente de teste (opcional, ainda não utilizado).

## Schema atual

Três tabelas, todas com Row Level Security (RLS) habilitado:

| Tabela | Descrição |
|---|---|
| `operadores` | Pessoas autorizadas a registrar dados (nome, PIN) |
| `lotes_cultura` | Abertura de uma cultura (cultura, identificação, recipiente, litragem, etc.) |
| `registros_diarios` | Acompanhamento diário de um lote (`lote_id`, temperatura, pH, amônia, nitrato, fosfato, etc.) |

Ambas `lotes_cultura` e `registros_diarios` possuem coluna `video_path`, referenciando o caminho do arquivo no Storage (bucket `videos-cultivo`) — o vídeo em si não é salvo no PostgreSQL.

## Segurança (status atual)

As policies de RLS estão **abertas** (select/insert livres com a anon key) — nível de proteção equivalente ao PIN de frontend do protótipo. Isso é provisório: a versão definitiva deve restringir por operador autenticado. Ver `docs/seguranca.md` na raiz do projeto.

## Configuração no frontend

A URL e a anon key do projeto Supabase ficam em `js/config.js` (não versionar chaves sensíveis fora da anon key, que é pública por design).

## Como aplicar uma migration

1. Abra o SQL Editor no painel do Supabase.
2. Cole o conteúdo do arquivo de migration.
3. Rode.
4. Depois, adicione o mesmo arquivo em `supabase/migrations/` no repositório, para manter o histórico versionado junto ao código.
