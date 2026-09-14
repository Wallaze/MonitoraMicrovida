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
