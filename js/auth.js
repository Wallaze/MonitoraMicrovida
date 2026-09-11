// ==========================================================================
// MONITORAMICROVIDA
// Controle de acesso
// ==========================================================================

const PIN_ACESSO_CORRETO = '1234';

let pinAutenticado = false;


// --------------------------------------------------------------------------
// Verificação do PIN
// --------------------------------------------------------------------------

export function verificarAcessoPIN() {
  const pinSalvo = sessionStorage.getItem('app_pin_autenticado');

  if (pinSalvo === 'true') {
    pinAutenticado = true;
    return true;
  }

  const pinInformado = prompt(
    '🔒 Acesso Restrito: Digite o PIN de segurança para utilizar o formulário:'
  );

  if (pinInformado === PIN_ACESSO_CORRETO) {
    sessionStorage.setItem('app_pin_autenticado', 'true');

    pinAutenticado = true;

    return true;
  }

  alert('❌ PIN incorreto! Acesso negado.');

  pinAutenticado = false;

  return false;
}


// --------------------------------------------------------------------------
// Estado atual da autenticação
// --------------------------------------------------------------------------

export function estaAutenticado() {
  return pinAutenticado;
}
