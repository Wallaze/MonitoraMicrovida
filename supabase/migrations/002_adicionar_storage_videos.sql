-- MonitoraMicrovida — Migração 002
-- Adiciona o Bucket de Storage para vídeos de 10s e ajusta a coluna aeracao

-- 1) Ajuste do tipo da coluna aeracao na tabela lotes_cultura
ALTER TABLE lotes_cultura
  ALTER COLUMN aeracao TYPE BOOLEAN
  USING (CASE WHEN aeracao = 'Ativa' THEN true ELSE false END);

-- 2) Criação do Bucket de Storage no Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos-cultivo', 'videos-cultivo', true)
ON CONFLICT (id) DO NOTHING;

-- 3) Políticas de Acesso RLS para o Bucket
CREATE POLICY "Acesso publico upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'videos-cultivo');

CREATE POLICY "Acesso publico leitura videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos-cultivo');
