-- MonitoraMicrovida — Migração 004
-- Fecha o insert/delete direto via anon key e move a validação de PIN pro banco

-- 1) Fecha a brecha mais grave: ninguém mais lê nem escreve na tabela operadores
--    direto pela anon key. PINs deixam de ser visíveis/graváveis pelo frontend.
DROP POLICY IF EXISTS "leitura publica operadores" ON operadores;
DROP POLICY IF EXISTS "escrita publica operadores" ON operadores;

-- 2) Fecha o insert direto em lotes_cultura e registros_diarios.
--    Select continua público (histórico/dashboard precisam ler).
DROP POLICY IF EXISTS "escrita publica lotes" ON lotes_cultura;
DROP POLICY IF EXISTS "escrita publica registros" ON registros_diarios;

-- Delete direto nunca existia como policy (não havia "for delete"),
-- então já estava fechado — mantemos assim.

-- 3) Função: criar lote (abertura de cultura), validando PIN internamente
CREATE OR REPLACE FUNCTION criar_lote(
  p_pin text,
  p_cultura text,
  p_identificacao text,
  p_recipiente text,
  p_litragem numeric,
  p_substrato text,
  p_iluminacao text,
  p_aeracao boolean,
  p_temperatura_ambiente numeric,
  p_salinidade numeric,
  p_observacoes text,
  p_video_path text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_operador_id uuid;
  v_novo_id uuid;
BEGIN
  SELECT id INTO v_operador_id
  FROM operadores
  WHERE pin = p_pin AND ativo = true;

  IF v_operador_id IS NULL THEN
    RAISE EXCEPTION 'PIN inválido ou operador inativo';
  END IF;

  INSERT INTO lotes_cultura (
    cultura, identificacao, recipiente, litragem, substrato,
    iluminacao, aeracao, temperatura_ambiente, salinidade,
    observacoes, video_path, operador_id
  ) VALUES (
    p_cultura, p_identificacao, p_recipiente, p_litragem, p_substrato,
    p_iluminacao, p_aeracao, p_temperatura_ambiente, p_salinidade,
    p_observacoes, p_video_path, v_operador_id
  )
  RETURNING id INTO v_novo_id;

  RETURN v_novo_id;
END;
$$;

-- 4) Função: criar registro diário, validando PIN internamente
CREATE OR REPLACE FUNCTION criar_registro_diario(
  p_pin text,
  p_lote_id uuid,
  p_temperatura_agua numeric,
  p_ph numeric,
  p_amonia numeric,
  p_nitrato numeric,
  p_fosfato numeric,
  p_temperatura_ambiente numeric,
  p_salinidade numeric,
  p_observacoes text,
  p_video_path text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_operador_id uuid;
  v_novo_id uuid;
BEGIN
  SELECT id INTO v_operador_id
  FROM operadores
  WHERE pin = p_pin AND ativo = true;

  IF v_operador_id IS NULL THEN
    RAISE EXCEPTION 'PIN inválido ou operador inativo';
  END IF;

  INSERT INTO registros_diarios (
    lote_id, temperatura_agua, ph, amonia, nitrato, fosfato,
    temperatura_ambiente, salinidade, observacoes, video_path, operador_id
  ) VALUES (
    p_lote_id, p_temperatura_agua, p_ph, p_amonia, p_nitrato, p_fosfato,
    p_temperatura_ambiente, p_salinidade, p_observacoes, p_video_path, v_operador_id
  )
  RETURNING id INTO v_novo_id;

  RETURN v_novo_id;
END;
$$;

-- 5) Funções de exclusão (uma por tabela, evita SQL dinâmico arriscado)
CREATE OR REPLACE FUNCTION deletar_lote(p_pin text, p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_operador_id uuid;
BEGIN
  SELECT id INTO v_operador_id FROM operadores WHERE pin = p_pin AND ativo = true;
  IF v_operador_id IS NULL THEN
    RAISE EXCEPTION 'PIN inválido ou operador inativo';
  END IF;

  DELETE FROM lotes_cultura WHERE id = p_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION deletar_registro_diario(p_pin text, p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_operador_id uuid;
BEGIN
  SELECT id INTO v_operador_id FROM operadores WHERE pin = p_pin AND ativo = true;
  IF v_operador_id IS NULL THEN
    RAISE EXCEPTION 'PIN inválido ou operador inativo';
  END IF;

  DELETE FROM registros_diarios WHERE id = p_id;
  RETURN true;
END;
$$;

-- 6) Libera a execução das funções pra anon key (as funções fazem a checagem, não a policy)
GRANT EXECUTE ON FUNCTION criar_lote TO anon, authenticated;
GRANT EXECUTE ON FUNCTION criar_registro_diario TO anon, authenticated;
GRANT EXECUTE ON FUNCTION deletar_lote TO anon, authenticated;
GRANT EXECUTE ON FUNCTION deletar_registro_diario TO anon, authenticated;
