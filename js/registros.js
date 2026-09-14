// ==========================================================================
// MONITORAMICROVIDA
// Registros de cultivo integrados ao schema oficial do Supabase
// ==========================================================================

import {
  CULTURA_ATUAL,
  obterRegistrosLocais,
  salvarRegistrosLocais
} from './cultura.js';

import { _supabase } from './config.js';
import { sanitizarEntrada } from './ui.js';

export function validarFormulario() {
  const btnSalvar = document.getElementById('btnSalvar');
  const tipoRegistro = document.getElementById('tipoRegistro')?.value || 'inicio';

  if (!btnSalvar) return;

  let campoObrigatorioValido = false;

  if (tipoRegistro === 'inicio') {
    const nomeCultura = document.getElementById('inicioNomeCultura')?.value?.trim();
    campoObrigatorioValido = Boolean(nomeCultura && nomeCultura.length > 0);
  } else if (tipoRegistro === 'diaria') {
    const culturaRef = document.getElementById('diariaCulturaRef')?.value;
    campoObrigatorioValido = Boolean(culturaRef && culturaRef !== '');
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
// Upload de Vídeo para o Supabase Storage
// --------------------------------------------------------------------------
export async function uploadVideoSupabase(videoBlob) {
  if (!_supabase || !videoBlob) return null;

  try {
    const filePath = `${CULTURA_ATUAL}/${Date.now()}_video.webm`;
    const { error } = await _supabase.storage
      .from('videos-cultivo')
      .upload(filePath, videoBlob, {
        contentType: videoBlob.type || 'video/webm'
      });

    if (error) throw error;

    const { data } = _supabase.storage
      .from('videos-cultivo')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('Erro no upload do vídeo:', err);
    return null;
  }
}

// --------------------------------------------------------------------------
// Salvar Registro no Supabase usando a tabela correspondente
// --------------------------------------------------------------------------
export async function salvarRegistroSupabase(tipo, videoUrl) {
  if (!_supabase) return false;

  const parseNum = (val) => (val === '' || val === null || val === undefined ? null : parseFloat(val));

  try {
    if (tipo === 'inicio') {
      const payloadLote = {
        cultura: CULTURA_ATUAL,
        identificacao: document.getElementById('inicioNomeCultura')?.value,
        recipiente: document.getElementById('inicioRecipiente')?.value || null,
        litragem: parseNum(document.getElementById('inicioLitragem')?.value),
        substrato: document.getElementById('inicioSubstrato')?.value || null,
        iluminacao: document.getElementById('inicioIluminacaoDesc')?.value || null,
        aeracao: document.getElementById('inicioAeracao')?.checked || false,
        temperatura_ambiente: parseNum(document.getElementById('tempAmbiente')?.value),
        salinidade: parseNum(document.getElementById('salinidade')?.value),
        observacoes: document.getElementById('observacoes')?.value || null
      };

      const { error } = await _supabase.from('lotes_cultura').insert([payloadLote]);
      if (error) throw error;

    } else if (tipo === 'diaria') {
      const loteId = document.getElementById('diariaCulturaRef')?.value;

      const payloadDiario = {
        lote_id: loteId,
        temperatura_agua: parseNum(document.getElementById('diariaTempAgua')?.value),
        ph: parseNum(document.getElementById('diariaPh')?.value),
        amonia: parseNum(document.getElementById('diariaAmonia')?.value),
        nitrato: parseNum(document.getElementById('diariaNitrato')?.value),
        fosfato: parseNum(document.getElementById('diariaFosfato')?.value),
        temperatura_ambiente: parseNum(document.getElementById('tempAmbiente')?.value),
        salinidade: parseNum(document.getElementById('salinidade')?.value),
        observacoes: document.getElementById('observacoes')?.value || null,
        video_path: videoUrl
      };

      const { error } = await _supabase.from('registros_diarios').insert([payloadDiario]);
      if (error) throw error;
    }

    return true;
  } catch (err) {
    console.error('Erro ao salvar no banco:', err);
    return false;
  }
}

// --------------------------------------------------------------------------
// Carregar Histórico Relacional
// --------------------------------------------------------------------------
export async function carregarHistorico() {
  const container = document.getElementById('historicoContainer');
  const filtroTipo = document.getElementById('filtroTipo')?.value || 'todos';

  if (!container) return;

  if (_supabase) {
    try {
      let html = '';

      if (filtroTipo === 'todos' || filtroTipo === 'inicio') {
        const { data: lotes } = await _supabase
          .from('lotes_cultura')
          .select('*')
          .eq('cultura', CULTURA_ATUAL)
          .order('created_at', { ascending: false });

if (filtroTipo === 'todos' || filtroTipo === 'inicio') {
        const { data: lotes } = await _supabase
          .from('lotes_cultura')
          .select('*')
          .eq('cultura', CULTURA_ATUAL)
          .order('created_at', { ascending: false });

        if (lotes) {
          lotes.forEach(l => {
            html += `
              <div class="border-2 border-amber-500 p-2.5 rounded bg-slate-900 space-y-1">
                <div class="flex justify-between font-bold text-slate-200">
                  <span>🚀 Início de Lote: ${sanitizarEntrada(l.identificacao)}</span>
                  <div class="flex items-center gap-2">
                    <span>📅 ${new Date(l.created_at).toLocaleDateString('pt-BR')}</span>
                    <button onclick="deletarRegistroSupabase('${l.id}', 'lotes_cultura')" class="text-rose-400 hover:text-rose-300 font-bold px-1 cursor-pointer" title="Excluir Lote">🗑️</button>
                  </div>
                </div>
                <div class="text-[11px] text-slate-300">
                  <p><strong>Litragem:</strong> ${l.litragem ?? 'N/I'}L | <strong>Recipiente:</strong> ${sanitizarEntrada(l.recipiente || 'N/I')}</p>
                  <p><strong>Aeração:</strong> ${l.aeracao ? '✅ Ativa' : '❌ Inativa'}</p>
                </div>
              </div>`;
          });
        }
      }

      if (filtroTipo === 'todos' || filtroTipo === 'diaria') {
        const { data: diarios } = await _supabase
          .from('registros_diarios')
          .select('*, lotes_cultura!inner(identificacao, cultura)')
          .eq('lotes_cultura.cultura', CULTURA_ATUAL)
          .order('created_at', { ascending: false });

        if (diarios) {
          diarios.forEach(d => {
            html += `
              <div class="border-2 border-emerald-500 p-2.5 rounded bg-slate-900 space-y-1">
                <div class="flex justify-between font-bold text-slate-200">
                  <span>📅 Medição Diária (Lote: ${sanitizarEntrada(d.lotes_cultura?.identificacao)})</span>
                  <div class="flex items-center gap-2">
                    <span>${new Date(d.created_at).toLocaleDateString('pt-BR')}</span>
                    <button onclick="deletarRegistroSupabase('${d.id}', 'registros_diarios')" class="text-rose-400 hover:text-rose-300 font-bold px-1 cursor-pointer" title="Excluir Medição">🗑️</button>
                  </div>
                </div>
                <div class="text-[11px] text-slate-300">
                  <p><strong>Temp Água:</strong> ${d.temperatura_agua ?? 'N/I'}°C | <strong>pH:</strong> ${d.ph ?? 'N/I'}</p>
                  <p><strong>Amônia:</strong> ${d.amonia ?? 'N/I'} | <strong>Nitrato:</strong> ${d.nitrato ?? 'N/I'}</p>
                </div>
                ${d.video_path ? `<video src="${sanitizarEntrada(d.video_path)}" controls class="w-full h-24 rounded mt-1 bg-black object-cover"></video>` : ''}
              </div>`;
          });
        }
      }

      container.innerHTML = html || '<p class="text-slate-500 italic text-center py-4">Nenhum registro encontrado.</p>';
      return;
    } catch (err) {
      console.error('Erro ao buscar do Supabase:', err);
    }
  }

  // Fallback Local se o Supabase falhar
  const registrosLocais = obterRegistrosLocais();
  container.innerHTML = registrosLocais.length > 0
    ? '<p class="text-slate-400 text-center py-2">Exibindo dados armazenados localmente.</p>'
    : '<p class="text-slate-500 italic text-center py-4">Nenhum registro local encontrado.</p>';
}

export function salvarRegistroLocal(registro) {
  const registros = obterRegistrosLocais();
  registros.unshift(registro);
  salvarRegistrosLocais(registros);
}

// --------------------------------------------------------------------------
// Excluir Registro ou Lote no Supabase
// --------------------------------------------------------------------------
export async function deletarRegistroSupabase(id, tabela) {
  if (!_supabase) return false;

  const confirmacao = confirm('Tem certeza que deseja excluir este registro permanentemente?');
  if (!confirmacao) return false;

  try {
    const { error } = await _supabase
      .from(tabela)
      .delete()
      .eq('id', id);

    if (error) throw error;

    alert('Registro excluído com sucesso!');
    await carregarHistorico();
    return true;
  } catch (err) {
    console.error('Erro ao excluir registro:', err);
    alert('Erro ao tentar excluir o registro.');
    return false;
  }
}

// Tornar a função acessível no escopo global para chamadas via onclick
window.deletarRegistroSupabase = deletarRegistroSupabase;
