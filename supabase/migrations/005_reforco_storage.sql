-- MonitoraMicrovida — Migração 005
-- Reforça as regras do bucket de vídeos (não substitui PIN — ver observação no README)

-- 1) Remove as policies totalmente abertas
DROP POLICY IF EXISTS "Acesso publico upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Acesso publico leitura videos" ON storage.objects;

-- 2) Upload só é aceito se:
--    - for no bucket certo
--    - o caminho começar com uma cultura válida (ex: gigapods/123_video.webm)
--    - a extensão for de vídeo (.webm ou .mp4)
CREATE POLICY "upload restrito por cultura e extensao"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'videos-cultivo'
    AND (storage.foldername(name))[1] IN ('gigapods', 'amphipodes', 'tisbe', 'rotiferos', 'nano')
    AND (name ILIKE '%.webm' OR name ILIKE '%.mp4')
  );

-- 3) Leitura continua pública (necessário pro <video> tocar no navegador)
CREATE POLICY "leitura publica videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos-cultivo');

-- 4) Limite de tamanho de arquivo no próprio bucket (proteção extra, direto na config)
UPDATE storage.buckets
SET file_size_limit = 20971520  -- 20 MB, generoso pra um vídeo de 10s
WHERE id = 'videos-cultivo';
