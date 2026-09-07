/* ==========================================================================
   SISTEMA DE MONITORAMENTO E CULTIVO DE ORGANISMOS AQUÁTICOS
   Arquivo de Lógica Completo (index.html e gigapods.html)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initClockAndDate();
  initWeather();
  initTabNavigation();
  initMediaRecorder();
  initFormHandler();
  initScrollToTop();

  // Renderização e inicialização de componentes
  renderHistorico();
  atualizarSelectCulturas();
  initFiltrosEImpressao();
});

/* ==========================================
   1. METADADOS AUTOMÁTICOS (DATA/HORA E CLIMA)
   ========================================== */
function initClockAndDate() {
  const inputDataRegistro = document.getElementById('dataRegistro');
  if (inputDataRegistro) {
    const updateDateTime = () => {
      const now = new Date();
      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);
      inputDataRegistro.value = localISOTime;
    };
    updateDateTime();
  }
}

function initWeather() {
  const tempElement = document.getElementById('tempAmbiente');
  if (!tempElement) return;

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const data = await response.json();
          if (data.current_weather && data.current_weather.temperature !== undefined) {
            tempElement.value = data.current_weather.temperature;
          } else {
            tempElement.value = "N/A";
          }
        } catch (error) {
          console.error("Erro ao consultar a API de clima:", error);
          tempElement.value = "Erro";
        }
      },
      (error) => {
        console.warn("Geolocalização indisponível ou negada pelo usuário:", error.message);
        tempElement.value = "Bloqueado";
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  } else {
    tempElement.value = "N/A";
  }
}

/* ==========================================
   2. NAVEGAÇÃO ENTRE ABAS DE REGISTRO
   ========================================== */
function initTabNavigation() {
  const tabInicio = document.getElementById('tabInicio');
  const tabDiaria = document.getElementById('tabDiaria');
  const secaoInicio = document.getElementById('secaoInicio');
  const secaoDiaria = document.getElementById('secaoDiaria');
  const tipoRegistro = document.getElementById('tipoRegistro');

  if (!tabInicio || !tabDiaria) return;

  tabInicio.addEventListener('click', () => {
    tabInicio.className = "flex-1 py-2 text-center rounded-md bg-amber-500 text-slate-950 transition-all font-bold";
    tabDiaria.className = "flex-1 py-2 text-center rounded-md text-slate-400 hover:text-slate-200 transition-all font-bold";

    if (secaoInicio) secaoInicio.classList.remove('hidden');
    if (secaoDiaria) secaoDiaria.classList.add('hidden');
    if (tipoRegistro) tipoRegistro.value = 'inicio';
  });

  tabDiaria.addEventListener('click', () => {
    tabDiaria.className = "flex-1 py-2 text-center rounded-md bg-emerald-500 text-slate-950 transition-all font-bold";
    tabInicio.className = "flex-1 py-2 text-center rounded-md text-slate-400 hover:text-slate-200 transition-all font-bold";

    if (secaoDiaria) secaoDiaria.classList.remove('hidden');
    if (secaoInicio) secaoInicio.classList.add('hidden');
    if (tipoRegistro) tipoRegistro.value = 'diaria';

    atualizarSelectCulturas();
  });
}

/* ==========================================
   3. CÂMERA E GRAVAÇÃO DE VÍDEO
   ========================================== */
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let recordedBase64Video = null;

function initMediaRecorder() {
  const videoPreview = document.getElementById('videoPreview');
  const btnGravar = document.getElementById('btnGravar');
  const cronometro = document.getElementById('cronometro');
  const tempoRestante = document.getElementById('tempoRestante');
  const btnSalvar = document.getElementById('btnSalvar');

  if (!videoPreview || !btnGravar) return;

  async function solicitarCamera() {
    if (mediaStream) return true;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      videoPreview.srcObject = mediaStream;
      return true;
    } catch (err) {
      console.error("Erro ao solicitar a câmera:", err);
      alert("Acesso à câmera bloqueado. Libere as permissões no seu navegador.");
      return false;
    }
  }

  solicitarCamera();

  btnGravar.addEventListener('click', async () => {
    const ativa = await solicitarCamera();
    if (!ativa) return;

    recordedChunks = [];
    recordedBase64Video = null;

    let options = { mimeType: 'video/webm' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/mp4' };
    }

    try {
      mediaRecorder = new MediaRecorder(mediaStream, options);
    } catch (e) {
      mediaRecorder = new MediaRecorder(mediaStream);
    }

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'video/webm' });
      videoPreview.srcObject = null;
      videoPreview.src = URL.createObjectURL(videoBlob);
      videoPreview.controls = true;
      videoPreview.loop = true;
      videoPreview.play();

      // Converte vídeo para Base64 para persistência local
      const reader = new FileReader();
      reader.readAsDataURL(videoBlob);
      reader.onloadend = () => {
        recordedBase64Video = reader.result;
      };

      if (btnSalvar) {
        btnSalvar.disabled = false;
        btnSalvar.className = "w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-md transition-all shadow-lg cursor-pointer";
      }
    };

    mediaRecorder.start();
    btnGravar.disabled = true;
    btnGravar.classList.add('opacity-50', 'cursor-not-allowed');
    if (cronometro) cronometro.classList.remove('hidden');

    let segundos = 10;
    if (tempoRestante) tempoRestante.textContent = segundos;

    const interval = setInterval(() => {
      segundos--;
      if (tempoRestante) tempoRestante.textContent = segundos;
      if (segundos <= 0) {
        clearInterval(interval);
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
        if (cronometro) cronometro.classList.add('hidden');
        btnGravar.disabled = false;
        btnGravar.classList.remove('opacity-50', 'cursor-not-allowed');
        btnGravar.textContent = "🔄 Gravar Novamente";
      }
    }, 1000);
  });
}

/* ==========================================
   4. PERSISTÊNCIA DOS DADOS (LOCALSTORAGE)
   ========================================== */
function getStorageKey() {
  const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  return `historico_${pageName}`;
}

function initFormHandler() {
  const form = document.getElementById('cultivoForm');
  const statusMsg = document.getElementById('mensagemStatus');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const tipo = document.getElementById('tipoRegistro')?.value || 'inicio';

    const registro = {
      id: Date.now(),
      tipo: tipo,
      data: document.getElementById('dataRegistro')?.value || new Date().toISOString(),
      tempAmbiente: document.getElementById('tempAmbiente')?.value || 'N/A',
      salinidade: document.getElementById('salinidade')?.value || '',
      observacoes: document.getElementById('observacoes')?.value || '',
      video_url: recordedBase64Video || null
    };

    if (tipo === 'inicio') {
      registro.nomeCultura = document.getElementById('inicioNomeCultura')?.value || 'Cultura sem nome';
      registro.recipiente = document.getElementById('inicioRecipiente')?.value || '';
      registro.litragem = document.getElementById('inicioLitragem')?.value || '';
      registro.substrato = document.getElementById('inicioSubstrato')?.value || '';
      registro.iluminacao = document.getElementById('inicioIluminacaoDesc')?.value || '';
      registro.aeracao = document.getElementById('inicioAeracao')?.checked || false;
    } else {
      registro.culturaRef = document.getElementById('diariaCulturaRef')?.value || 'Geral';
      registro.tempAgua = document.getElementById('diariaTempAgua')?.value || '';
      registro.ph = document.getElementById('diariaPh')?.value || '';
      registro.amonia = document.getElementById('diariaAmonia')?.value || '';
      registro.nitrato = document.getElementById('diariaNitrato')?.value || '';
      registro.fosfato = document.getElementById('diariaFosfato')?.value || '';
    }

    const chave = getStorageKey();
    const historico = JSON.parse(localStorage.getItem(chave) || '[]');
    historico.unshift(registro);
    localStorage.setItem(chave, JSON.stringify(historico));

    if (statusMsg) {
      statusMsg.textContent = "✅ Registro gravado com sucesso!";
      setTimeout(() => { statusMsg.textContent = ""; }, 3000);
    }

    recordedBase64Video = null;
    form.reset();
    initClockAndDate();
    renderHistorico();
    atualizarSelectCulturas();
  });
}

/* ==========================================
   5. RENDERIZAÇÃO DO HISTÓRICO
   ========================================== */
function renderHistorico(dadosFiltrados = null) {
  const container = document.getElementById('historicoContainer');
  if (!container) return;

  const chave = getStorageKey();
  const registros = dadosFiltrados || JSON.parse(localStorage.getItem(chave) || '[]');

  if (registros.length === 0) {
    container.innerHTML = `<p class="text-slate-500 italic text-center py-4">Nenhum registro encontrado.</p>`;
    return;
  }

  container.innerHTML = registros.map(item => {
    const dataFormatada = item.data ? item.data.replace('T', ' ') : 'Data N/I';
    const videoTag = item.video_url ? `<video src="${item.video_url}" controls class="w-full h-32 rounded mt-2 bg-black object-cover"></video>` : '';

    if (item.tipo === 'inicio') {
      return `
        <div class="bg-slate-900/60 border-l-4 border-l-amber-500 border-y border-r border-slate-700/60 rounded-r-lg p-3 space-y-1 relative">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              🚀 INÍCIO DE CULTURA
            </span>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-400">${dataFormatada}</span>
              <button onclick="removerRegistro(${item.id})" title="Apagar Registro" class="text-slate-500 hover:text-red-400 transition-colors p-0.5 no-print">
                🗑️
              </button>
            </div>
          </div>
          <p class="font-bold text-slate-200 text-xs mt-1">${item.nomeCultura}</p>
          <p class="text-[11px] text-slate-400">
            ${item.recipiente ? `Recipiente: ${item.recipiente} (${item.litragem || '-'}L) | ` : ''}Salinidade: ${item.salinidade || 'N/I'}
          </p>
          ${item.iluminacao ? `<p class="text-[11px] text-slate-400">Iluminação: ${item.iluminacao}</p>` : ''}
          ${item.observacoes ? `<p class="text-[10px] text-slate-500 italic">Obs: "${item.observacoes}"</p>` : ''}
          ${videoTag}
        </div>
      `;
    } else {
      return `
        <div class="bg-slate-900/60 border-l-4 border-l-emerald-500 border-y border-r border-slate-700/60 rounded-r-lg p-3 space-y-1 relative">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              📅 ANOTAÇÃO DIÁRIA
            </span>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-400">${dataFormatada}</span>
              <button onclick="removerRegistro(${item.id})" title="Apagar Registro" class="text-slate-500 hover:text-red-400 transition-colors p-0.5 no-print">
                🗑️
              </button>
            </div>
          </div>
          <p class="font-bold text-slate-200 text-xs mt-1">Ref: ${item.culturaRef}</p>
          <p class="text-[11px] text-slate-400">
            ${item.tempAgua ? `Temp Água: ${item.tempAgua}°C | ` : ''}${item.ph ? `pH: ${item.ph} | ` : ''}Salinidade: ${item.salinidade || 'N/I'}
          </p>
          ${item.observacoes ? `<p class="text-[10px] text-slate-500 italic">Obs: "${item.observacoes}"</p>` : ''}
          ${videoTag}
        </div>
      `;
    }
  }).join('');
}

function atualizarSelectCulturas() {
  const selectCultura = document.getElementById('diariaCulturaRef');
  if (!selectCultura) return;

  const chave = getStorageKey();
  const registros = JSON.parse(localStorage.getItem(chave) || '[]');
  const inicios = registros.filter(r => r.tipo === 'inicio' && r.nomeCultura);

  selectCultura.innerHTML = '<option value="">Selecione o Lote / Cultura...</option>';
  inicios.forEach(c => {
    const option = document.createElement('option');
    option.value = c.nomeCultura;
    option.textContent = c.nomeCultura;
    selectCultura.appendChild(option);
  });
}

window.removerRegistro = function(id) {
  if (!confirm("Deseja realmente apagar este registro do histórico?")) return;

  const chave = getStorageKey();
  let registros = JSON.parse(localStorage.getItem(chave) || '[]');
  registros = registros.filter(r => r.id !== id);

  localStorage.setItem(chave, JSON.stringify(registros));
  renderHistorico();
  atualizarSelectCulturas();
};

/* ==========================================
   6. FILTROS E GERAÇÃO DE RELATÓRIO (PDF)
   ========================================== */
function initFiltrosEImpressao() {
  const filtroSelect = document.getElementById('filtroTipo');
  const btnImprimir = document.getElementById('btnImprimir');

  if (filtroSelect) {
    filtroSelect.addEventListener('change', (e) => {
      const valor = e.target.value;
      const chave = getStorageKey();
      const todos = JSON.parse(localStorage.getItem(chave) || '[]');

      if (valor === 'todos') {
        renderHistorico(todos);
      } else {
        const filtrados = todos.filter(r => r.tipo === valor);
        renderHistorico(filtrados);
      }
    });
  }

  if (btnImprimir) {
    btnImprimir.addEventListener('click', () => {
      window.print();
    });
  }
}

/* ==========================================
   7. RETORNO AO TOPO (ROLAGEM DA PÁGINA)
   ========================================== */
function initScrollToTop() {
  const btnTopo = document.getElementById('btnTopo');
  if (!btnTopo) return;

  const monitorarRolagem = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY > 150) {
      btnTopo.classList.remove('hidden');
    } else {
      btnTopo.classList.add('hidden');
    }
  };

  window.addEventListener('scroll', monitorarRolagem);

  btnTopo.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
