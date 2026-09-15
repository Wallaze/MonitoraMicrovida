// ==========================================================================
// MONITORAMICROVIDA
// Sistema de autenticação por PIN
// Validação realizada via RPC no Supabase
// ==========================================================================

let pinAtual = null;

export function estaAutenticado() {
  return pinAtual !== null;
}

export function obterPin() {
  return pinAtual;
}

export function verificarAcessoPIN() {
  if (estaAutenticado()) {
    return true;
  }

  const pinInformado = prompt('🔒 Acesso Restrito: Digite seu PIN de operador:');

  if (!pinInformado) {
    return false;
  }

  pinAtual = pinInformado.trim();
  return true;
}

// Chamada quando o banco rejeita o PIN — força pedir de novo na próxima ação
export function limparAutenticacao() {
  pinAtual = null;
}
