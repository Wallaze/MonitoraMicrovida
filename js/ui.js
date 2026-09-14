// ==========================================================================
// MONITORAMICROVIDA
// Interface e elementos visuais
// ==========================================================================

import {
  CULTURA_ATUAL,
  STORAGE_KEY,
  obterRegistrosLocais
} from './cultura.js';

import { _supabase } from './config.js';


// --------------------------------------------------------------------------
// Sanitização para renderização HTML
// --------------------------------------------------------------------------

export function sanitizarEntrada(str) {

  if (typeof str !== 'string') {
    return str;
  }

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// --------------------------------------------------------------------------
// Expor sanitização para módulos/páginas legadas
// --------------------------------------------------------------------------

window.sanitizarEntrada = sanitizarEntrada;


// --------------------------------------------------------------------------
// Alterar abas
// --------------------------------------------------------------------------

export function alternarAba(tipo) {

  const inputTipo =
    document.getElementById('tipoRegistro');

  if (inputTipo) {
    inputTipo.value = tipo;
  }


  const tabInicio =
    document.getElementById('tabInicio');

  const tabDiaria =
    document.getElementById('tabDiaria');

  const secaoInicio =
    document.getElementById('secaoInicio');

  const secaoDiaria =
    document.getElementById('secaoDiaria');

  const labelVideo =
    document.getElementById('labelVideo');


  if (tipo === 'inicio') {

    if (tabInicio) {
      tabInicio.className =
        'flex-1 py-2 text-center rounded-md bg-amber-500 text-slate-950 transition-all font-bold';
    }

    if (tabDiaria) {
      tabDiaria.className =
        'flex-1 py-2 text-center rounded-md text-slate-400 hover:text-slate-200 transition-all';
    }

    if (secaoInicio) {
      secaoInicio.classList.remove('hidden');
    }

    if (secaoDiaria) {
      secaoDiaria.classList.add('hidden');
    }

    if (labelVideo) {
      labelVideo.textContent =
        'População em Vídeo (Opcional - 10s)';
    }

  } else {

    if (tabDiaria) {
      tabDiaria.className =
        'flex-1 py-2 text-center rounded-md bg-emerald-500 text-slate-950 transition-all font-bold';
    }

    if (tabInicio) {
      tabInicio.className =
        'flex-1 py-2 text-center rounded-md text-slate-400 hover:text-slate-200 transition-all';
    }

    if (secaoDiaria) {
      secaoDiaria.classList.remove('hidden');
    }

    if (secaoInicio) {
      secaoInicio.classList.add('hidden');
    }

    if (labelVideo) {
      labelVideo.textContent =
        'Análise Populacional em Vídeo (Opcional - 10s)';
    }

    atualizarDropdownCulturas();
  }

  if (typeof window.validarFormulario === 'function') {
    window.validarFormulario();
  }
}


// --------------------------------------------------------------------------
// Dropdown de culturas (Lê do Supabase)
// --------------------------------------------------------------------------

export async function atualizarDropdownCulturas() {

  const select =
    document.getElementById('diariaCulturaRef');

  if (!select) return;

  select.innerHTML =
    '<option value="">Carregando lotes...</option>';

  // Se Supabase está configurado, carregar do banco
  if (_supabase) {
    try {
      const { data: lotes, error } = await _supabase
        .from('lotes_cultura')
        .select('id, identificacao')
        .eq('cultura', CULTURA_ATUAL)
        .order('created_at', { ascending: false });

      if (error) throw error;

      select.innerHTML =
        '<option value="">Selecione o Lote / Cultura...</option>';

      if (lotes && lotes.length > 0) {
        lotes.forEach(lote => {
          const option =
            document.createElement('option');

          option.value = lote.id;
          option.textContent = lote.identificacao;

          select.appendChild(option);
        });
      }

      return;
    } catch (erro) {
      console.error('Erro ao carregar lotes do Supabase:', erro);
    }
  }

  // Fallback: Leitura local do sessionStorage
  const registros =
    obterRegistrosLocais();

  const lotesInicio =
    registros.filter(
      registro =>
        registro.tipo === 'inicio' &&
        registro.nome_cultura
    );

  select.innerHTML =
    '<option value="">Selecione o Lote / Cultura...</option>';

  lotesInicio.forEach(lote => {

    const option =
      document.createElement('option');

    option.value =
      sanitizarEntrada(lote.nome_cultura);

    option.textContent =
      lote.nome_cultura;

    select.appendChild(option);
  });
}


// --------------------------------------------------------------------------
// Data e hora
// --------------------------------------------------------------------------

export function preencherDataHora() {

  const el =
    document.getElementById('dataRegistro');

  if (!el) return;


  const now = new Date();

  now.setMinutes(
    now.getMinutes() -
    now.getTimezoneOffset()
  );


  el.value =
    now.toISOString().slice(0, 16);
}


// --------------------------------------------------------------------------
// Voltar ao topo
// --------------------------------------------------------------------------

export function voltarAoTopo() {

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}


// --------------------------------------------------------------------------
// Expor funções utilizadas pelo HTML
// --------------------------------------------------------------------------

window.alternarAba = alternarAba;
window.atualizarDropdownCulturas = atualizarDropdownCulturas;
window.preencherDataHora = preencherDataHora;
window.voltarAoTopo = voltarAoTopo;
