// ==========================================================================
// MONITORAMICROVIDA
// Gravação e gerenciamento temporário de vídeo
// ==========================================================================

import { VIDEO_CONFIG } from './config.js';

let mediaRecorder = null;
let chunks = [];
let videoBlob = null;

export function obterVideoBlob() {
  return videoBlob;
}

export function limparVideo() {
  videoBlob = null;
  chunks = [];
}

// --------------------------------------------------------------------------
// Limpar vídeo + resetar a UI (preview e botão)
// --------------------------------------------------------------------------
export function limparVideoUI() {
  limparVideo();

  const videoPreview = document.getElementById('videoPreview');
  const btnGravar = document.getElementById('btnGravar');

  if (videoPreview) {
    videoPreview.pause();
    if (videoPreview.src) {
      URL.revokeObjectURL(videoPreview.src);
    }
    videoPreview.removeAttribute('src');
    videoPreview.removeAttribute('controls');
    videoPreview.load();
  }

  if (btnGravar) {
    btnGravar.textContent = '🎥 Gravar Vídeo (10s)';
  }
}

export async function iniciarGravacao10s() {

  const btnGravar = document.getElementById('btnGravar');
  const cronometro = document.getElementById('cronometro');
  const tempoEl = document.getElementById('tempoRestante');
  const videoPreview = document.getElementById('videoPreview');

  limparVideo();

  try {
    chunks = [];
    let stream = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: VIDEO_CONFIG.camera,
        audio: VIDEO_CONFIG.audio
      });
    } catch (erroCameraTraseira) {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: VIDEO_CONFIG.audio
      });
    }

    if (videoPreview) {
      videoPreview.srcObject = stream;
      videoPreview.muted = true;
      videoPreview.setAttribute('playsinline', '');
      await videoPreview.play();
    }

    let options = {};

    if (
      typeof MediaRecorder !== 'undefined' &&
      typeof MediaRecorder.isTypeSupported === 'function'
    ) {
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        options.mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        options.mimeType = 'video/webm;codecs=vp8';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        options.mimeType = 'video/webm';
      }
    }

    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (erroFormato) {
      mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorder.ondataavailable = (evento) => {
      if (evento.data && evento.data.size > 0) {
        chunks.push(evento.data);
      }
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
    };

    mediaRecorder.start(1000);

    if (btnGravar) {
      btnGravar.disabled = true;
      btnGravar.classList.add('opacity-50', 'cursor-not-allowed');
    }

    if (cronometro) {
      cronometro.classList.remove('hidden');
    }

    let tempo = VIDEO_CONFIG.duracaoSegundos;

    if (tempoEl) {
      tempoEl.textContent = tempo;
    }

    const timer = setInterval(() => {
      tempo--;

      if (tempoEl) {
        tempoEl.textContent = tempo;
      }

      if (tempo <= 0) {
        clearInterval(timer);

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }

        if (btnGravar) {
          btnGravar.disabled = false;
          btnGravar.classList.remove('opacity-50', 'cursor-not-allowed');
          btnGravar.textContent = '🎥 Gravar Novamente (10s)';
        }

        if (cronometro) {
          cronometro.classList.add('hidden');
        }
      }
    }, 1000);

  } catch (erro) {
    console.error('Erro ao acessar a câmera:', erro);
    alert('Erro ao acessar a câmera: ' + erro.message);
  }
}
