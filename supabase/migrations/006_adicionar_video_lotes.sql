-- MonitoraMicrovida — Migração 006
-- Adiciona a coluna video_path à tabela lotes_cultura para compatibilidade com o RPC criar_lote

ALTER TABLE lotes_cultura
ADD COLUMN IF NOT EXISTS video_path TEXT;
