// MONITORAMICROVIDA - Configurações Globais

export const SUPABASE_URL = 'https://ajrnwphdtlrhuyuehzen.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_YNVkbiEuFQ1mUo_AeK-z2Q_HZG0ri-4';

// Instanciação segura do cliente Supabase para não travar a aplicação em caso de erro na biblioteca/chave
let supabaseClient = null;

try {
  if (typeof window.supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (error) {
  console.warn('Alerta Supabase: Não foi possível inicializar o cliente com a chave fornecida. O sistema funcionará com fallback local.', error);
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
