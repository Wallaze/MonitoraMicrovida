// ==========================================================================
// MONITORAMICROVIDA
// Configurações globais e conexão com serviços externos
// ==========================================================================

export const SUPABASE_URL = 'COLE_AQUI_A_SUA_PROJECT_URL';

export const SUPABASE_ANON_KEY = 'COLE_AQUI_A_SUA_ANON_KEY';

export const _supabase =
  (typeof supabase !== 'undefined' &&
   SUPABASE_URL !== 'COLE_AQUI_A_SUA_PROJECT_URL')
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;


// --------------------------------------------------------------------------
// Configurações do vídeo
// --------------------------------------------------------------------------

// Importante:
// Estes valores controlam o comportamento da gravação.
// Não são configurações de CSS.

export const VIDEO_CONFIG = {
  duracaoSegundos: 10,

  // Limite de vídeos ainda será definido com mais precisão
  // quando estruturarmos a política de armazenamento.
  maxVideosPorRegistro: 3,

  audio: false,

  camera: {
    facingMode: {
      ideal: 'environment'
    }
  }
};


// --------------------------------------------------------------------------
// Configurações de armazenamento local
// --------------------------------------------------------------------------

export const STORAGE_PREFIX = 'registros_';


// --------------------------------------------------------------------------
// Configurações gerais
// --------------------------------------------------------------------------

export const TEMPERATURA_AMBIENTE_PADRAO = '25.0';
