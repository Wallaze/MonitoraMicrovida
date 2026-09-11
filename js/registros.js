// ==========================================================================
// MONITORAMICROVIDA
// Registros de cultivo
// ==========================================================================

import {
  CULTURA_ATUAL,
  obterRegistrosLocais,
  salvarRegistrosLocais
} from './cultura.js';

import {
  _supabase
} from './config.js';

import {
  sanitizarEntrada
} from './ui.js';


// --------------------------------------------------------------------------
// Validação do formulário
// --------------------------------------------------------------------------

export function validarFormulario() {

  const btnSalvar =
    document.getElementById('btnSalvar');

  const tipoRegistro =
    document.getElementById('tipoRegistro')?.value ||
    'inicio';


  if (!btnSalvar) return;


  let campoObrigatorioValido =
    false;


  if (tipoRegistro === 'inicio') {

    const nomeCultura =
      document
        .getElementById('inicioNomeCultura')
        ?.value
        ?.trim();


    campoObrigatorioValido =
      Boolean(
        nomeCultura &&
        nomeCultura.length > 0
      );


  } else if (tipoRegistro === 'diaria') {

    const culturaRef =
      document
        .getElementById('diariaCulturaRef')
        ?.value;


    campoObrigatorioValido =
      Boolean(
        culturaRef &&
        culturaRef !== ''
      );
  }


  if (campoObrigatorioValido) {

    btnSalvar.disabled = false;

    btnSalvar.className =
      'w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-md font-bold cursor-pointer transition-all shadow-lg';

  } else {

    btnSalvar.disabled = true;

    btnSalvar.className =
      'w-full bg-slate-700 text-slate-400 py-3 rounded-md font-bold cursor-not-allowed transition-all';
  }
}


// --------------------------------------------------------------------------
// Carregar histórico
// --------------------------------------------------------------------------

export async function carregarHistorico() {

  const container =
    document.getElementById(
      'historicoContainer'
    );

  const filtroTipo =
    document
      .getElementById('filtroTipo')
      ?.value ||
    'todos';


  if (!container) return;


  let registros = [];


  if (_supabase) {

    const { data, error } =
      await _supabase
        .from('registros_cultivo')
        .select('*')
        .eq('cultura', CULTURA_ATUAL)
        .order(
          'created_at',
          { ascending: false }
        );


    if (error) {

      console.error(
        'Erro ao carregar histórico:',
        error
      );

      registros = [];

    } else {

      registros = data || [];
    }

  } else {

    registros =
      obterRegistrosLocais();
  }


  if (filtroTipo !== 'todos') {

    registros =
      registros.filter(
        registro =>
          registro.tipo === filtroTipo
      );
  }


  if (registros.length === 0) {

    container.innerHTML =
      '<p class="text-slate-500 italic text-center py-4">Nenhum registro encontrado.</p>';

    return;
  }


  container.innerHTML =
    registros.map(item => {

      const corBorda =
        item.tipo === 'inicio'
          ? 'border-amber-500'
          : 'border-emerald-500';


      return `
        <div class="border-2 ${corBorda} p-2.5 rounded bg-slate-900 space-y-1 transition-all">

          <div class="flex justify-between font-bold text-slate-200">

            <span>
              ${
                item.tipo === 'inicio'
                  ? '🚀 Início de Cultura'
                  : '📅 Registro Diário'
              }
            </span>

            <span>
              📅 ${
                new Date(item.data_hora)
                  .toLocaleDateString('pt-BR')
              }

              ${
                new Date(item.data_hora)
                  .toLocaleTimeString(
                    'pt-BR',
                    {
                      hour: '2-digit',
                      minute: '2-digit'
                    }
                  )
              }
            </span>

          </div>


          <div class="text-[11px] text-slate-300 border-t border-slate-800 pt-1 space-y-0.5">

            <p>
              <strong>Clima:</strong>
              ${sanitizarEntrada(String(item.temp_clima || 'N/A'))}°C

              |

              <strong>Salinidade:</strong>
              ${sanitizarEntrada(String(item.salinidade || 'N/A'))}
            </p>


            ${
              item.tipo === 'inicio'
                ? `

                  <p>
                    <strong>Lote:</strong>
                    ${sanitizarEntrada(item.nome_cultura || 'N/A')}
                  </p>

                  <p>
                    <strong>Recipiente:</strong>
                    ${sanitizarEntrada(item.recipiente || 'N/A')}

                    (
                    ${sanitizarEntrada(String(item.litragem || '0'))}L
                    )

                    |

                    <strong>Substrato:</strong>
                    ${sanitizarEntrada(item.substrato || 'N/A')}
                  </p>

                  <p>
                    <strong>Aeração:</strong>
                    ${
                      item.aeracao
                        ? '✅ Ativa'
                        : '❌ Inativa'
                    }
                  </p>

                `
                : `

                  <p>
                    <strong>Cultura Ref.:</strong>
                    ${sanitizarEntrada(item.cultura_ref || 'Geral')}
                  </p>

                  <p>
                    <strong>Temp. Água:</strong>
                    ${sanitizarEntrada(String(item.temp_agua || 'N/A'))}°C

                    |

                    <strong>pH:</strong>
                    ${sanitizarEntrada(String(item.ph || 'N/A'))}
                  </p>

                  <p>
                    <strong>Química:</strong>
                    NH3:
                    ${sanitizarEntrada(String(item.amonia || '0'))}

                    |

                    NO3:
                    ${sanitizarEntrada(String(item.nitrato || '0'))}

                    |

                    PO4:
                    ${sanitizarEntrada(String(item.fosfato || '0'))}
                  </p>

                `
            }


            ${
              item.observacoes
                ? `
                  <p class="italic text-slate-400">
                    Obs:
                    "${sanitizarEntrada(item.observacoes)}"
                  </p>
                `
                : ''
            }

          </div>


          ${
            item.video_url
              ? `
                <video
                  src="${sanitizarEntrada(item.video_url)}"
                  controls
                  class="w-full h-24 rounded mt-1 bg-black object-cover">
                </video>
              `
              : ''
          }

        </div>
      `;

    }).join('');
}


// --------------------------------------------------------------------------
// Criar objeto do registro
// --------------------------------------------------------------------------

export function construirRegistro(tipo, videoUrlFinal) {

  return {

    id: Date.now(),

    cultura: CULTURA_ATUAL,

    tipo: tipo,

    data_hora:
      document.getElementById('dataRegistro')?.value,

    temp_clima:
      sanitizarEntrada(
        document.getElementById('tempAmbiente')?.value
      ),

    salinidade:
      sanitizarEntrada(
        document.getElementById('salinidade')?.value
      ),

    observacoes:
      sanitizarEntrada(
        document.getElementById('observacoes')?.value
      ),

    video_url: videoUrlFinal,


    // ----------------------------------------------------------------------
    // Início
    // ----------------------------------------------------------------------

    nome_cultura:
      tipo === 'inicio'
        ? sanitizarEntrada(
            document
              .getElementById('inicioNomeCultura')
              ?.value
          )
        : null,

    recipiente:
      tipo === 'inicio'
        ? sanitizarEntrada(
            document
              .getElementById('inicioRecipiente')
              ?.value
          )
        : null,

    litragem:
      tipo === 'inicio'
        ? sanitizarEntrada(
            document
              .getElementById('inicioLitragem')
              ?.value
          )
        : null,

    substrato:
      tipo === 'inicio'
        ? sanitizarEntrada(
            document
              .getElementById('inicioSubstrato')
              ?.value
          )
        : null,

    iluminacao_desc:
      tipo === 'inicio'
        ? sanitizarEntrada(
            document
              .getElementById('inicioIluminacaoDesc')
              ?.value
          )
        : null,

    aeracao:
      tipo === 'inicio'
        ? document
            .getElementById('inicioAeracao')
            ?.checked
        : null,


    // ----------------------------------------------------------------------
    // Diário
    // ----------------------------------------------------------------------

    cultura_ref:
      tipo === 'diaria'
        ? sanitizarEntrada(
            document
              .getElementById('diariaCulturaRef')
              ?.value
          )
        : null,

    temp_agua:
      tipo === 'diaria'
        ? sanitizarEntrada(
            document
              .getElementById('diariaTempAgua')
              ?.value
          )
        : null,

    ph:
      tipo === 'diaria'
        ? sanitizarEntrada(
            document
              .getElementById('diariaPh')
              ?.value
          )
        : null,

    amonia:
      tipo === 'diaria'
        ? sanitizarEntrada(
            document
              .getElementById('diariaAmonia')
              ?.value
          )
        : null,

    nitrato:
      tipo === 'diaria'
        ? sanitizarEntrada(
            document
              .getElementById('diariaNitrato')
              ?.value
          )
        : null,

    fosfato:
      tipo === 'diaria'
        ? sanitizarEntrada(
            document
              .getElementById('diariaFosfato')
              ?.value
          )
        : null
  };
}


// --------------------------------------------------------------------------
// Salvar registro local
// --------------------------------------------------------------------------

export function salvarRegistroLocal(registro) {

  const registros =
    obterRegistrosLocais();

  registros.unshift(registro);

  salvarRegistrosLocais(registros);
}
