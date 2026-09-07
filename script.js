// Configuração do Supabase
const SUPABASE_URL = 'COLE_AQUI_A_SUA_PROJECT_URL';
const SUPABASE_ANON_KEY = 'COLE_AQUI_A_SUA_ANON_KEY';
const _supabase = (typeof supabase !== 'undefined' && SUPABASE_URL !== 'COLE_AQUI_A_SUA_PROJECT_URL') 
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

let mediaRecorder = null;
let chunks = [];
let videoBlob = null;

// --- ALTERAR ABA (MANTIDO 100% ORIGINAL) ---
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
    if (tabDiaria) tabDiaria.className = 'flex-1 py-2 text-center rounded-md bg-amber-500 text-slate-950 transition-all font-bold';
    if (tabInicio) tabInicio.className = 'flex-1 py-2 text-center rounded-md text-slate-400 hover:text-slate-200 transition-all';
    if (secaoDiaria) secaoDiaria.classList.remove('hidden');
    if (secaoInicio) secaoInicio.classList.add('hidden');
    if (labelVideo) labelVideo.textContent = 'Análise Populacional em Vídeo (10s Obrigatórios)';
  }
};

// --- PREENCHER DATA E HORA (MANTIDO ORIGINAL) ---
window.preencherDataHora = function() {
  const el = document.getElementById('dataRegistro');
  if (!el) return;
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  el.value = now.toISOString().slice(0, 16);
};

// --- OBTER TEMPERATURA AMBIENTE (MANTIDO ORIGINAL) ---
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

// --- GRAVAÇÃO DE VÍDEO (AJUSTADO APENAS O BITRATE E RESOLUÇÃO CONTRA TRAVAMENTO) ---
window.iniciarGravacao10s = async function() {
  const btnGravar = document.getElementById('btnGravar');
  const cronometro = document.getElementById('cronometro');
  const tempoEl = document.getElementById('tempoRestante');
  const videoPreview = document.getElementById('videoPreview');

  try {
    chunks = [];
    // Limita a resolução em 480p para não estourar a memória RAM do Android em 4K
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });

    videoPreview.srcObject = stream;
    videoPreview.play();

    let options = { videoBitsPerSecond: 400000 };
    if (typeof MediaRecorder !== "undefined") {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) options.mimeType = 'video/webm;codecs=vp8';
      else if (MediaRecorder.isTypeSupported('video/webm')) options.mimeType = 'video/webm';
      else if (MediaRecorder.isTypeSupported('video/mp4')) options.mimeType = 'video/mp4';
    }

    try { mediaRecorder = new MediaRecorder(stream, options); } 
    catch (e) { mediaRecorder = new MediaRecorder(stream); }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const mime = mediaRecorder.mimeType || 'video/webm';
      videoBlob = new Blob(chunks, { type: mime });

      stream.getTracks().forEach(track => track.stop());
      videoPreview.srcObject = null;
      videoPreview.src = URL.createObjectURL(videoBlob);
      videoPreview.controls = true;
      videoPreview.loop = true;
      videoPreview.play();
      
      window.validarFormulario();
    };

    mediaRecorder.start();
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
        if (mediaRecorder && mediaRecorder.state === "recording") mediaRecorder.stop();
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

// --- VALIDAÇÃO DE FORMULÁRIO (MANTIDO ORIGINAL) ---
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

// --- CARREGAR HISTÓRICO (MANTIDOS TODOS OS CAMPOS ORIGINAIS) ---
window.carregarHistorico = async function() {
  const container = document.getElementById('historicoContainer');
  if (!container) return;

  let registros = [];
  if (_supabase) {
    const { data } = await _supabase.from('registros_cultivo').select('*').order('created_at', { ascending: false });
    registros = data || [];
  } else {
    registros = JSON.parse(localStorage.getItem('registros_gigapods_v2') || '[]');
  }

  if (registros.length === 0) {
    container.innerHTML = '<p class="text-slate-500 italic">Nenhum registro no histórico.</p>';
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
          <p><strong>Recipiente:</strong> ${item.recipiente || 'N/A'} (${item.litragem || '0'}L) | <strong>Substrato:</strong> ${item.substrato || 'N/A'}</p>
          <p><strong>Checklist:</strong> Iluminação ${item.iluminacao ? '✅' : '❌'} | Aeração ${item.aeracao ? '✅' : '❌'}</p>
        ` : `
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

// --- EXECUTAR QUANDO O DOM ESTIVER PRONTO ---
document.addEventListener('DOMContentLoaded', () => {
  window.preencherDataHora();
  window.obterTempAmbienteAuto();
  window.carregarHistorico();

  const elSalinidade = document.getElementById('salinidade');
  if (elSalinidade) {
    elSalinidade.addEventListener('input', window.validarFormulario);
  }

  const form = document.getElementById('cultivoForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('mensagemStatus');
      if (status) status.textContent = 'Gravando registro...';

      const tipo = document.getElementById('tipoRegistro')?.value || 'inicio';

      // COLETANDO TODOS OS SEUS CAMPOS ORIGINAIS
      const registro = {
        id: Date.now(),
        tipo: tipo,
        data_hora: document.getElementById('dataRegistro')?.value,
        temp_clima: document.getElementById('tempAmbiente')?.value,
        salinidade: document.getElementById('salinidade')?.value,
        observacoes: document.getElementById('observacoes')?.value,
        video_url: videoBlob ? URL.createObjectURL(videoBlob) : null,

        // Campos do Início de Cultura
        recipiente: tipo === 'inicio' ? document.getElementById('inicioRecipiente')?.value : null,
        litragem: tipo === 'inicio' ? document.getElementById('inicioLitragem')?.value : null,
        substrato: tipo === 'inicio' ? document.getElementById('inicioSubstrato')?.value : null,
        iluminacao: tipo === 'inicio' ? document.getElementById('inicioIluminacao')?.checked : null,
        aeracao: tipo === 'inicio' ? document.getElementById('inicioAeracao')?.checked : null,

        // Campos Diários
        temp_agua: tipo === 'diaria' ? document.getElementById('diariaTempAgua')?.value : null,
        ph: tipo === 'diaria' ? document.getElementById('diariaPh')?.value : null,
        amonia: tipo === 'diaria' ? document.getElementById('diariaAmonia')?.value : null,
        nitrato: tipo === 'diaria' ? document.getElementById('diariaNitrato')?.value : null,
        fosfato: tipo === 'diaria' ? document.getElementById('diariaFosfato')?.value : null,
      };

      if (!_supabase) {
        let localData = JSON.parse(localStorage.getItem('registros_gigapods_v2') || '[]');
        localData.unshift(registro);
        localStorage.setItem('registros_gigapods_v2', JSON.stringify(localData));
      }

      if (status) status.textContent = '✅ Registro salvo com sucesso!';
      form.reset();
      window.preencherDataHora();
      window.obterTempAmbienteAuto();
      videoBlob = null;
      window.validarFormulario();
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
