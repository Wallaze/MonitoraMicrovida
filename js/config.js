// ==========================================================================
// MONITORAMICROVIDA - Configurações Globais
// ==========================================================================

export const SUPABASE_URL = 'https://ajrnwphdtlrhuyuehzen.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_YNVkbiEuFQ1mUo_AeK-z2Q_HZG0ri-4';

// Declarada fora do try/catch para garantir o escopo correto do export
let supabaseClient = null;

try {
  if (typeof window !== 'undefined' && window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (error) {
  console.warn('Alerta Supabase: Falha ao inicializar o cliente.', error);
}

export const _supabase = supabaseClient;

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
