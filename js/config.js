// ==========================================================================
// MONITORAMICROVIDA - Configurações Globais
// ==========================================================================

export const SUPABASE_URL = 'https://ajrnwphdtlrhuyuehzen.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_YNVkbiEuFQ1mUo_AeK-z2Q_HZG0ri-4';

// Instanciação do cliente Supabase a partir do SDK importado no HTML
export const _supabase = (typeof window.supabase !== 'undefined' && SUPABASE_URL !== '')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Configurações do vídeo
export const VIDEO_CONFIG = {
  duracaoSegundos: 10,
  maxVideosPorRegistro: 3,
  audio: false,
  camera: {
    facingMode: { ideal: 'environment' }
  }
};

// Configurações gerais e fallback local
export const STORAGE_PREFIX = 'registros_';
export const TEMPERATURA_AMBIENTE_PADRAO = '25.0';
