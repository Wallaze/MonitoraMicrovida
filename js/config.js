// ==========================================================================
// MONITORAMICROVIDA - Configurações Globais
// ==========================================================================

export const SUPABASE_URL = 'https://ajrnwphdtlrhuyuehzen.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_YNVkbiEuFQ1mUo_AeK-z2Q_HZG0ri-4';

// 1. Declaramos a variável fora do bloco para estar no escopo de exportação do módulo
let clientInstance = null;

// 2. Tenta inicializar o cliente Supabase sem interromper a execução global
try {
  if (typeof window !== 'undefined' && window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
    clientInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (error) {
  console.warn('Alerta Supabase: Falha ao instanciar cliente.', error);
}

// 3. Exporta a referência para uso nos demais módulos (registros.js, etc.)
export const _supabase = clientInstance;

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
