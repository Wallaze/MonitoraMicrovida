// ==========================================================================
// MONITORAMICROVIDA
// Sistema de autenticação por PIN
// ==========================================================================

const PIN_CORRETO = '1234';
const CHAVE_SESSAO = 'mmv_autenticado';

export function checarAutenticacao() {
  const autenticado = sessionStorage.getItem(CHAVE_SESSAO);
  const modal = document.getElementById('modal-auth');

  if (autenticado === 'true') {
    if (modal) modal.style.display = 'none';
    return true;
  } else {
    if (modal) modal.style.display = 'flex';
    return false;
  }
}

export function validarPIN(pin) {
  if (pin === PIN_CORRETO) {
    sessionStorage.setItem(CHAVE_SESSAO, 'true');
    const modal = document.getElementById('modal-auth');
    if (modal) modal.style.display = 'none';
    return true;
  }
  return false;
}

export function verificarAcessoPIN() {
  const pinSalvo = sessionStorage.getItem(CHAVE_SESSAO);
  if (pinSalvo === 'true') {
    return true;
  }

  const pinInformado = prompt('🔒 Acesso Restrito: Digite o PIN de segurança para utilizar o formulário:');
  if (pinInformado === PIN_CORRETO) {
    sessionStorage.setItem(CHAVE_SESSAO, 'true');
    return true;
  } else {
    alert('❌ PIN incorreto! Acesso negado.');
    return false;
  }
}

export function estaAutenticado() {
  return sessionStorage.getItem(CHAVE_SESSAO) === 'true';
}
