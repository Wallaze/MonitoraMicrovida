// Configuração do Supabase (Mantida para suporte futuro)
const SUPABASE_URL = 'COLE_AQUI_A_SUA_PROJECT_URL';
const SUPABASE_ANON_KEY = 'COLE_AQUI_A_SUA_ANON_KEY';
const _supabase = (typeof supabase !== 'undefined' && SUPABASE_URL !== 'COLE_AQUI_A_SUA_PROJECT_URL')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

let mediaRecorder = null;
let chunks = [];
let videoBlob = null;

// --- FUNÇÃO AUXILIAR: IDENTIFICAR A CULTURA ATUAL PELA URL ---
window.obterCulturaAtual = function() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('amphipodes')) return 'amphipodes';
  if (path.includes('tisbe')) return 'tisbe';
  if (path.includes('rotiferos')) return 'rotiferos';
  if (path.includes('nano')) return 'nano';
  return 'gigapods'; // Padrão
};

// Key dinâmica para isolar o LocalStorage por tipo de cultura
const CULTURA_ATUAL = window.obterCulturaAtual();
const STORAGE_KEY = `registros_${CULTURA_ATUAL}_v2`;

// --- ALTERAR ABA ---
window.alternarAba = function(tipo) {
  const inputTipo = document.getElementById('tipoRegistro');
  if (inputTipo) inputTipo.value = tipo;

  const tabInicio = document.getElementById('tabInicio');
  const tabDiaria = document.getElementById('tabDiaria');
  const secaoInicio = document.getElementById('secaoInicio');
  const secaoDiaria = document.getElementById('secaoDiaria');
  const labelVideo = document.getElementById('labelVideo');

  if (tipo === 'inicio') {
    if (tabInicio) tabInicio.className = 'flex-1 py-2 text-center rounded-md bg-amber-500 text-slate-950 transition-all font-bold';
    if (tabDiaria) tabDiaria.className = 'flex-1 py-2 text-center rounded-md text-slate-400 hover:text-slate-200 transition-all';
    if (secaoInicio) secaoInicio.classList.remove('hidden');
    if (secaoDiaria) secaoDiaria.classList.add('hidden');
    if (labelVideo) labelVideo.textContent = 'População em Vídeo (10s Obrigatórios)';
  } else {
    if (tabDiaria) tabDiaria.className = 'flex-1 py-2 text-center rounded-md bg-emerald-500 text-slate-950 transition-all font-bold';
    if (tabInicio) tabInicio.className = 'flex-1 py-2 text-center rounded-md text-slate-400 hover:text-slate-200 transition-all';
    if (secaoDiaria) secaoDiaria.classList.remove('hidden');
    if (secaoInicio) secaoInicio.classList.add('hidden');
    if (labelVideo) labelVideo.textContent = 'Análise Populacional em Vídeo (10s Obrigatórios)';

    // Atualiza a lista de culturas para o diário
    window.atualizarDropdownCulturas();
  }
};

// --- PREENCHER A LISTA DE CULTURAS NO SELECT DE ANOTAÇÃO DIÁRIA ---
window.atualizarDropdownCulturas = function() {
  const select = document.getElementById('diariaCulturaRef');
  if (!select) return;

  let registros = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const lotesInicio = registros.filter(r => r.tipo === 'inicio' && r.nome_cultura);

  select.innerHTML = '<option value="">Selecione o Lote / Cultura...</option>';

  lotesInicio.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote.nome_cultura;
    opt.textContent = lote.nome_cultura;
    select.appendChild(opt);
  });
};

// --- PREENCHER DATA E HORA ---
window.preencherDataHora = function() {
  const el = document.getElementById('dataRegistro');
  if (!el) return;
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  el.value = now.toISOString().slice(0, 16);
};

// --- OBTER TEMPERATURA AMBIENTE ---
window.obterTempAmbienteAuto = async function() {
  const elTemp = document.getElementById('tempAmbiente');
  if (!elTemp) return;

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true`);
        const data = await res.json();
        elTemp.value = data?.current_weather?.temperature || "25.0";
      } catch (e) { elTemp.value = "25.0"; }
    }, () => { elTemp.value = "25.0"; });
  } else { elTemp.value = "25.0"; }
};

// --- GRAVAÇÃO DE VÍDEO COMPLETA E FUNCIONAL ---
window.iniciarGravacao10s = async function() {
  const btnGravar = document.getElementById('btnGravar');
  const cronometro = document.getElementById('cronometro');
  const tempoEl = document.getElementById('tempoRestante');
  const videoPreview = document.getElementById('videoPreview');

  try {
    chunks = [];
    let stream = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });
    } catch (e1) {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }

    if (videoPreview) {
      videoPreview.srcObject = stream;
      videoPreview.muted = true;
      videoPreview.setAttribute('playsinline', '');
      await videoPreview.play();
    }

    let options = {};
    if (typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function") {
      if (MediaRecorder.isTypeSupported('video/mp4')) options.mimeType = 'video/mp4';
      else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) options.mimeType = 'video/webm;codecs=vp8';
      else if (MediaRecorder.isTypeSupported('video/webm')) options.mimeType = 'video/webm';
    }

    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e2) {
      mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const mime = mediaRecorder.mimeType || 'video/webm';
      videoBlob = new Blob(chunks, { type: mime });

      stream.getTracks().forEach(track => track.stop());

      if (videoPreview) {
        videoPreview.srcObject = null;
        videoPreview.src = URL.createObjectURL(videoBlob);
        videoPreview.controls = true;
        videoPreview.loop = true;
        videoPreview.play().catch(() => {});
      }

      window.validarFormulario();
    };

    mediaRecorder.start(1000);

    if (btnGravar) {
      btnGravar.disabled = true;
      btnGravar.classList.add('opacity-50', 'cursor-not-allowed');
    }
    if (cronometro) cronometro.classList.remove('hidden');

    let tempo = 10;
    if (tempoEl) tempoEl.textContent = tempo;

    const timer = setInterval(() => {
      tempo--;
      if (tempoEl) tempoEl.textContent = tempo;
      if (tempo <= 0) {
        clearInterval(timer);
        if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
        if (btnGravar) {
          btnGravar.disabled = false;
          btnGravar.classList.remove('opacity-50', 'cursor-not-allowed');
          btnGravar.textContent = '🎥 Gravar Novamente (10s)';
        }
        if (cronometro) cronometro.classList.add('hidden');
      }
    }, 1000);

  } catch (err) {
    alert('Erro ao acessar a câmera: ' + err.message);
  }
};

// --- VALIDAÇÃO DE FORMULÁRIO ---
window.validarFormulario = function() {
  const salinidadeEl = document.getElementById('salinidade');
  const btnSalvar = document.getElementById('btnSalvar');
  if (!salinidadeEl || !btnSalvar) return;

  const salinidade = salinidadeEl.value;
  if (videoBlob && salinidade >= 1000 && salinidade <= 1040) {
    btnSalvar.disabled = false;
    btnSalvar.className = 'w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-md font-bold cursor-pointer transition-all shadow-lg';
  } else {
    btnSalvar.disabled = true;
    btnSalvar.className = 'w-full bg-slate-700 text-slate-400 py-3 rounded-md font-bold cursor-not-allowed transition-all';
  }
};

// --- CARREGAR HISTÓRICO ---
window.carregarHistorico = async function() {
  const container = document.getElementById('historicoContainer');
  const filtroTipo = document.getElementById('filtroTipo')?.value || 'todos';
  if (!container) return;

  let registros = [];
  if (_supabase) {
    const { data } = await _supabase.from('registros_cultivo').select('*').eq('cultura', CULTURA_ATUAL).order('created_at', { ascending: false });
    registros = data || [];
  } else {
    registros = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  // Aplica filtro por tipo
  if (filtroTipo !== 'todos') {
    registros = registros.filter(r => r.tipo === filtroTipo);
  }

  if (registros.length === 0) {
    container.innerHTML = '<p class="text-slate-500 italic text-center py-4">Nenhum registro encontrado.</p>';
    return;
  }

  container.innerHTML = registros.map(item => `
    <div class="border border-slate-700 p-2.5 rounded bg-slate-900 space-y-1">
      <div class="flex justify-between font-bold text-slate-200">
        <span>${item.tipo === 'inicio' ? '🚀 Início de Cultura' : '📅 Registro Diário'}</span>
        <span>📅 ${new Date(item.data_hora).toLocaleDateString('pt-BR')} ${new Date(item.data_hora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
      </div>

      <div class="text-[11px] text-slate-300 border-t border-slate-800 pt-1 space-y-0.5">
        <p><strong>Clima:</strong> ${item.temp_clima}°C | <strong>Salinidade:</strong> ${item.salinidade}</p>

        ${item.tipo === 'inicio' ? `
          <p><strong>Lote:</strong> ${item.nome_cultura || 'N/A'}</p>
          <p><strong>Recipiente:</strong> ${item.recipiente || 'N/A'} (${item.litragem || '0'}L) | <strong>Substrato:</strong> ${item.substrato || 'N/A'}</p>
          <p><strong>Aeração:</strong> ${item.aeracao ? '✅ Ativa' : '❌ Inativa'}</p>
        ` : `
          <p><strong>Cultura Ref.:</strong> ${item.cultura_ref || 'Geral'}</p>
          <p><strong>Temp. Água:</strong> ${item.temp_agua || 'N/A'}°C | <strong>pH:</strong> ${item.ph || 'N/A'}</p>
          <p><strong>Química:</strong> NH3: ${item.amonia || '0'} | NO3: ${item.nitrato || '0'} | PO4: ${item.fosfato || '0'}</p>
        `}

        ${item.observacoes ? `<p class="italic text-slate-400">Obs: "${item.observacoes}"</p>` : ''}
      </div>

      ${item.video_url ? `<video src="${item.video_url}" controls class="w-full h-24 rounded mt-1 bg-black object-cover"></video>` : ''}
    </div>
  `).join('');
};

window.voltarAoTopo = function() {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// --- INICIALIZAÇÃO DE EVENTOS DO DOM ---
document.addEventListener('DOMContentLoaded', () => {
  window.preencherDataHora();
  window.obterTempAmbienteAuto();
  window.atualizarDropdownCulturas();
  window.carregarHistorico();

  // Escuta troca de filtro de histórico
  const filtroTipo = document.getElementById('filtroTipo');
  if (filtroTipo) {
    filtroTipo.addEventListener('change', window.carregarHistorico);
  }

  // Botão Imprimir / PDF
  const btnImprimir = document.getElementById('btnImprimir');
  if (btnImprimir) {
    btnImprimir.addEventListener('click', () => window.print());
  }

  // Mapeamento das abas
  const tabInicio = document.getElementById('tabInicio');
  const tabDiaria = document.getElementById('tabDiaria');
  if (tabInicio) tabInicio.addEventListener('click', () => window.alternarAba('inicio'));
  if (tabDiaria) tabDiaria.addEventListener('click', () => window.alternarAba('diaria'));

  // Botão de gravação
  const btnGravar = document.getElementById('btnGravar');
  if (btnGravar) {
    btnGravar.addEventListener('click', (e) => {
      e.preventDefault();
      window.iniciarGravacao10s();
    });
  }

  const elSalinidade = document.getElementById('salinidade');
  if (elSalinidade) {
    elSalinidade.addEventListener('input', window.validarFormulario);
  }

  // Form Submit
  const form = document.getElementById('cultivoForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('mensagemStatus');
      if (status) status.textContent = 'Salvando registro...';

      const tipo = document.getElementById('tipoRegistro')?.value || 'inicio';

      let videoUrlFinal = null;
      if (videoBlob) {
        if (!_supabase) {
          videoUrlFinal = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(videoBlob);
          });
        } else {
          videoUrlFinal = URL.createObjectURL(videoBlob);
        }
      }

      const registro = {
        id: Date.now(),
        cultura: CULTURA_ATUAL,
        tipo: tipo,
        data_hora: document.getElementById('dataRegistro')?.value,
        temp_clima: document.getElementById('tempAmbiente')?.value,
        salinidade: document.getElementById('salinidade')?.value,
        observacoes: document.getElementById('observacoes')?.value,
        video_url: videoUrlFinal,

        // Campos de Início
        nome_cultura: tipo === 'inicio' ? document.getElementById('inicioNomeCultura')?.value : null,
        recipiente: tipo === 'inicio' ? document.getElementById('inicioRecipiente')?.value : null,
        litragem: tipo === 'inicio' ? document.getElementById('inicioLitragem')?.value : null,
        substrato: tipo === 'inicio' ? document.getElementById('inicioSubstrato')?.value : null,
        iluminacao_desc: tipo === 'inicio' ? document.getElementById('inicioIluminacaoDesc')?.value : null,
        aeracao: tipo === 'inicio' ? document.getElementById('inicioAeracao')?.checked : null,

        // Campos Diários
        cultura_ref: tipo === 'diaria' ? document.getElementById('diariaCulturaRef')?.value : null,
        temp_agua: tipo === 'diaria' ? document.getElementById('diariaTempAgua')?.value : null,
        ph: tipo === 'diaria' ? document.getElementById('diariaPh')?.value : null,
        amonia: tipo === 'diaria' ? document.getElementById('diariaAmonia')?.value : null,
        nitrato: tipo === 'diaria' ? document.getElementById('diariaNitrato')?.value : null,
        fosfato: tipo === 'diaria' ? document.getElementById('diariaFosfato')?.value : null,
      };

      if (!_supabase) {
        let localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        localData.unshift(registro);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
      }

      if (status) status.textContent = '✅ Registro salvo com sucesso!';
      form.reset();
      window.preencherDataHora();
      window.obterTempAmbienteAuto();
      videoBlob = null;
      window.validarFormulario();
      window.atualizarDropdownCulturas();
      window.carregarHistorico();
    });
  }

  window.onscroll = function() {
    const btnTopo = document.getElementById("btnTopo");
    if (!btnTopo) return;
    if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
      btnTopo.classList.remove("hidden");
    } else {
      btnTopo.classList.add("hidden");
    }
  };
});
