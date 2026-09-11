// ==========================================================================
// MONITORAMICROVIDA
// Ponto de entrada da aplicação
// ==========================================================================

import {
  verificarAcessoPIN,
  estaAutenticado
} from './auth.js';

import {
  obterCulturaAtual
} from './cultura.js';

import {
  obterTempAmbienteAuto
} from './clima.js';

import {
  iniciarGravacao10s,
  obterVideoBlob,
  limparVideo
} from './video.js';

import {
  validarFormulario,
  carregarHistorico,
  construirRegistro,
  salvarRegistroLocal
} from './registros.js';

import {
  alternarAba,
  atualizarDropdownCulturas,
  preencherDataHora,
  voltarAoTopo
} from './ui.js';


// --------------------------------------------------------------------------
// Compatibilidade com código HTML existente
// --------------------------------------------------------------------------

window.obterCulturaAtual = obterCulturaAtual;
window.verificarAcessoPIN = verificarAcessoPIN;
window.iniciarGravacao10s = iniciarGravacao10s;
window.validarFormulario = validarFormulario;
window.carregarHistorico = carregarHistorico;
window.atualizarDropdownCulturas = atualizarDropdownCulturas;
window.preencherDataHora = preencherDataHora;
window.alternarAba = alternarAba;
window.voltarAoTopo = voltarAoTopo;


// --------------------------------------------------------------------------
// Inicialização
// --------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

  preencherDataHora();

  obterTempAmbienteAuto();

  atualizarDropdownCulturas();

  carregarHistorico();


  // ------------------------------------------------------------------------
  // Formulário
  // ------------------------------------------------------------------------

  const form =
    document.getElementById('cultivoForm');


  if (form) {

    form.addEventListener(
      'pointerdown',
      () => {

        if (!estaAutenticado()) {
          verificarAcessoPIN();
        }

      },
      { once: true }
    );
  }


  // ------------------------------------------------------------------------
  // Filtro do histórico
  // ------------------------------------------------------------------------

  const filtroTipo =
    document.getElementById('filtroTipo');


  if (filtroTipo) {

    filtroTipo.addEventListener(
      'change',
      carregarHistorico
    );
  }


  // ------------------------------------------------------------------------
  // Impressão
  // ------------------------------------------------------------------------

  const btnImprimir =
    document.getElementById('btnImprimir');


  if (btnImprimir) {

    btnImprimir.addEventListener(
      'click',
      () => window.print()
    );
  }


  // ------------------------------------------------------------------------
  // Abas
  // ------------------------------------------------------------------------

  const tabInicio =
    document.getElementById('tabInicio');

  const tabDiaria =
    document.getElementById('tabDiaria');


  if (tabInicio) {

    tabInicio.addEventListener(
      'click',
      () => alternarAba('inicio')
    );
  }


  if (tabDiaria) {

    tabDiaria.addEventListener(
      'click',
      () => alternarAba('diaria')
    );
  }


  // ------------------------------------------------------------------------
  // Gravação
  // ------------------------------------------------------------------------

  const btnGravar =
    document.getElementById('btnGravar');


  if (btnGravar) {

    btnGravar.addEventListener(
      'click',
      (evento) => {

        evento.preventDefault();


        if (
          !estaAutenticado() &&
          !verificarAcessoPIN()
        ) {
          return;
        }


        iniciarGravacao10s();
      }
    );
  }


  // ------------------------------------------------------------------------
  // Botão voltar ao topo
  // ------------------------------------------------------------------------

  window.addEventListener(
    'scroll',
    () => {

      const btnTopo =
        document.getElementById('btnTopo');

      if (!btnTopo) return;


      if (
        window.scrollY > 150
      ) {

        btnTopo.classList.remove(
          'hidden'
        );

      } else {

        btnTopo.classList.add(
          'hidden'
        );
      }
    }
  );


  // ------------------------------------------------------------------------
  // Campos monitorados
  // ------------------------------------------------------------------------

  const inputsMonitorados = [
    'inicioNomeCultura',
    'diariaCulturaRef'
  ];


  inputsMonitorados.forEach(id => {

    const el =
      document.getElementById(id);


    if (!el) return;


    el.addEventListener(
      'input',
      validarFormulario
    );

    el.addEventListener(
      'change',
      validarFormulario
    );
  });


  // ------------------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------------------

  if (form) {

    form.addEventListener(
      'submit',
      async (evento) => {

        evento.preventDefault();


        if (
          !estaAutenticado() &&
          !verificarAcessoPIN()
        ) {
          return;
        }


        const btnSalvar =
          document.getElementById(
            'btnSalvar'
          );

        const status =
          document.getElementById(
            'mensagemStatus'
          );


        // ------------------------------------------------------------------
        // Estado de processamento
        // ------------------------------------------------------------------

        if (btnSalvar) {

          btnSalvar.disabled = true;

          btnSalvar.className =
            'w-full bg-slate-600 text-slate-300 py-3 rounded-md font-bold cursor-not-allowed transition-all flex items-center justify-center gap-2';

          btnSalvar.innerHTML = `
            <svg
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">

              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4">
              </circle>

              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>

            </svg>

            Salvando Registro...
          `;
        }


        if (status) {
          status.textContent =
            'Processando e salvando...';
        }


        // ------------------------------------------------------------------
        // Vídeo
        // ------------------------------------------------------------------

        let videoUrlFinal = null;

        const videoBlob =
          obterVideoBlob();


        if (videoBlob) {

          /*
           * IMPORTANTE:
           *
           * Esta é uma solução temporária para a demo.
           *
           * Quando o Supabase Storage entrar,
           * o Blob será enviado para o Storage.
           *
           * NÃO devemos armazenar URL.createObjectURL()
           * como URL permanente no banco.
           */

          const reader =
            new FileReader();


          videoUrlFinal =
            await new Promise(resolve => {

              reader.onloadend = () => {
                resolve(reader.result);
              };

              reader.readAsDataURL(
                videoBlob
              );
            });
        }


        // ------------------------------------------------------------------
        // Registro
        // ------------------------------------------------------------------

        const tipo =
          document
            .getElementById('tipoRegistro')
            ?.value ||
          'inicio';


        const registro =
          construirRegistro(
            tipo,
            videoUrlFinal
          );


        // ------------------------------------------------------------------
        // Persistência local
        // ------------------------------------------------------------------

        salvarRegistroLocal(
          registro
        );


        // ------------------------------------------------------------------
        // Sucesso
        // ------------------------------------------------------------------

        if (status) {

          status.textContent =
            '✅ Registro salvo com sucesso!';
        }


        form.reset();

        limparVideo();


        if (btnSalvar) {
          btnSalvar.innerHTML =
            'Salvar Registro';
        }


        preencherDataHora();

        obterTempAmbienteAuto();

        validarFormulario();

        atualizarDropdownCulturas();

        carregarHistorico();
      }
    );
  }


  // ------------------------------------------------------------------------
  // Estado inicial
  // ------------------------------------------------------------------------

  validarFormulario();
});
