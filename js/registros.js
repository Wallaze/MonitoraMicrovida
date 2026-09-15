// ==========================================================================
// MONITORAMICROVIDA
// Registros de cultivo — persistência via funções RPC com validação de PIN
// ==========================================================================

import {
  CULTURA_ATUAL,
  obterRegistrosLocais,
  salvarRegistrosLocais
} from './cultura.js';

import { _supabase } from './config.js';
import { sanitizarEntrada } from './ui.js';
import {
  obterPin,
  estaAutenticado,
  verificarAcessoPIN,
  limparAutenticacao
} from './auth.js';

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
// Salvar Registro via função RPC (PIN validado dentro do banco)
// --------------------------------------------------------------------------
export async function salvarRegistroSupabase(tipo, videoUrl) {
  if (!_supabase) return { ok: false, pinInvalido: false };

  const pin = obterPin();
  const parseNum = (val) => (val === '' || val === null || val === undefined ? null : parseFloat(val));

  try {
    if (tipo === 'inicio') {
      const nomeCultura = document.getElementById('inicioNomeCultura')?.value?.trim();

      if (!nomeCultura) {
        console.error('Erro: Nome/Identificação da cultura é obrigatório.');
        return { ok: false, pinInvalido: false };
      }

      const payload = {
        p_pin: pin,
        p_cultura: CULTURA_ATUAL,
        p_identificacao: nomeCultura,
        p_recipiente: document.getElementById('inicioRecipiente')?.value || null,
        p_litragem: parseNum(document.getElementById('inicioLitragem')?.value),
        p_substrato: document.getElementById('inicioSubstrato')?.value || null,
        p_iluminacao: document.getElementById('inicioIluminacaoDesc')?.value || null,
        p_aeracao: Boolean(document.getElementById('inicioAeracao')?.checked),
        p_temperatura_ambiente: parseNum(document.getElementById('tempAmbiente')?.value),
        p_salinidade: parseNum(document.getElementById('salinidade')?.value),
        p_observacoes: document.getElementById('observacoes')?.value || null,
        p_video_path: videoUrl || null
      };

      const { error } = await _supabase.rpc('criar_lote', payload);

      if (error) {
        console.error('Erro detalhado no RPC criar_lote:', error.message, error.details);
        throw error;
      }

    } else if (tipo === 'diaria') {
      const loteId = document.getElementById('diariaCulturaRef')?.value;

      if (!loteId) {
        console.error('Erro: Lote de cultura de referência é obrigatório.');
        return { ok: false, pinInvalido: false };
      }

      const payload = {
        p_pin: pin,
        p_lote_id: loteId,
        p_temperatura_agua: parseNum(document.getElementById('diariaTempAgua')?.value),
        p_ph: parseNum(document.getElementById('diariaPh')?.value),
        p_amonia: parseNum(document.getElementById('diariaAmonia')?.value),
        p_nitrato: parseNum(document.getElementById('diariaNitrato')?.value),
        p_fosfato: parseNum(document.getElementById('diariaFosfato')?.value),
        p_temperatura_ambiente: parseNum(document.getElementById('tempAmbiente')?.value),
        p_salinidade: parseNum(document.getElementById('salinidade')?.value),
        p_observacoes: document.getElementById('observacoes')?.value || null,
        p_video_path: videoUrl || null
      };

      const { error } = await _supabase.rpc('criar_registro_diario', payload);

      if (error) {
        console.error('Erro detalhado no RPC criar_registro_diario:', error.message, error.details);
        throw error;
      }
    }

    return { ok: true, pinInvalido: false };
  } catch (err) {
    console.error('Erro ao salvar no banco:', err);
    const pinInvalido = (err.message || '').includes('PIN inválido');
    if (pinInvalido) limparAutenticacao();
    return { ok: false, pinInvalido };
  }
}

// --------------------------------------------------------------------------
// Carregar Histórico Relacional (lista única, ordenada por data/hora)
// --------------------------------------------------------------------------
export async function carregarHistorico() {
  const container = document.getElementById('historicoContainer');
  const filtroTipo = document.getElementById('filtroTipo')?.value || 'todos';

  if (!container) return;

  if (_supabase) {
    try {
      let itens = [];

      if (filtroTipo === 'todos' || filtroTipo === 'inicio') {
        const { data: lotes } = await _supabase
          .from('lotes_cultura')
          .select('*, operadores(nome)')
          .eq('cultura', CULTURA_ATUAL);

        (lotes || []).forEach(l => itens.push({ tipo: 'inicio', data: l }));
      }

      if (filtroTipo === 'todos' || filtroTipo === 'diaria') {
        const { data: diarios } = await _supabase
          .from('registros_diarios')
          .select('*, lotes_cultura!inner(identificacao, cultura), operadores(nome)')
          .eq('lotes_cultura.cultura', CULTURA_ATUAL);

        (diarios || []).forEach(d => itens.push({ tipo: 'diaria', data: d }));
      }

      itens.sort((a, b) => new Date(b.data.created_at) - new Date(a.data.created_at));

      let html = itens.map(item => {
        if (item.tipo === 'inicio') {
          const l = item.data;
          return `
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
              ${l.video_path ? `<video src="${sanitizarEntrada(l.video_path)}" controls class="w-full h-24 rounded mt-1 bg-black object-cover"></video>` : ''}
              <p><strong>Operador:</strong> ${sanitizarEntrada(l.operadores?.nome || 'N/I')}</p>
            </div>`;
        } else {
          const d = item.data;
          return `
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
              <p><strong>Operador:</strong> ${sanitizarEntrada(d.operadores?.nome || 'N/I')}</p>
            </div>`;
        }
      }).join('');

      container.innerHTML = html || '<p class="text-slate-500 italic text-center py-4">Nenhum registro encontrado.</p>';
      return;
    } catch (err) {
      console.error('Erro ao buscar do Supabase:', err);
    }
  }

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
// Excluir Registro via função RPC (PIN validado dentro do banco)
// --------------------------------------------------------------------------
export async function deletarRegistroSupabase(id, tabela) {
  if (!_supabase) return false;

  if (!estaAutenticado() && !verificarAcessoPIN()) {
    return false;
  }

  const confirmacao = confirm('Tem certeza que deseja excluir este registro permanentemente?');
  if (!confirmacao) return false;

  const pin = obterPin();
  const rpcName = tabela === 'lotes_cultura' ? 'deletar_lote' : 'deletar_registro_diario';

  try {
    const { error } = await _supabase.rpc(rpcName, { p_pin: pin, p_id: id });
    if (error) throw error;

    alert('Registro excluído com sucesso!');
    await carregarHistorico();
    return true;
  } catch (err) {
    console.error('Erro ao excluir registro:', err);

    if ((err.message || '').includes('PIN inválido')) {
      limparAutenticacao();
      alert('PIN inválido. Tente novamente na próxima ação.');
    } else {
      alert('Erro ao tentar excluir o registro.');
    }
    return false;
  }
}

window.deletarRegistroSupabase = deletarRegistroSupabase;
