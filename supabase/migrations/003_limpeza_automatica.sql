-- 1. Função que apaga registros e lotes com mais de 6 meses
CREATE OR REPLACE FUNCTION limpar_dados_antigos()
RETURNS void AS $$
BEGIN
  -- Apaga registros diários criados há mais de 6 meses (180 dias)
  DELETE FROM registros_diarios
  WHERE created_at < NOW() - INTERVAL '6 months';

  -- Apaga lotes antigos que não possuem mais registros associados
  DELETE FROM lotes_cultura
  WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- 2. Agendamento automático para rodar todo domingo à meia-noite (Extension pg_cron)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'limpeza-semestral-job',
  '0 0 * * 0', -- Toda semana
  'SELECT limpar_dados_antigos()'
);
