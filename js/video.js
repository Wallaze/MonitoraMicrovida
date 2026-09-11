// ==========================================================================
// MONITORAMICROVIDA
// Gravação e gerenciamento temporário de vídeo
// ==========================================================================

import { VIDEO_CONFIG } from './config.js';

let mediaRecorder = null;
let chunks = [];
let videoBlob = null;


// --------------------------------------------------------------------------
// Retornar o vídeo gravado
// --------------------------------------------------------------------------

export function obterVideoBlob() {
  return videoBlob;
}


// --------------------------------------------------------------------------
// Limpar vídeo atual
// --------------------------------------------------------------------------

export function limparVideo() {
  videoBlob = null;
  chunks = [];
}


// --------------------------------------------------------------------------
// Gravação de vídeo
// --------------------------------------------------------------------------

export async function iniciarGravacao10s() {

  const btnGravar =
    document.getElementById('btnGravar');

  const cronometro =
    document.getElementById('cronometro');

  const tempoEl =
    document.getElementById('tempoRestante');

  const videoPreview =
    document.getElementById('videoPreview');


  limparVideo();


  try {

    chunks = [];

    let stream = null;


    // ----------------------------------------------------------------------
    // Acesso à câmera traseira
    // ----------------------------------------------------------------------

    try {

      stream =
        await navigator.mediaDevices.getUserMedia({
          video: VIDEO_CONFIG.camera,
          audio: VIDEO_CONFIG.audio
        });

    } catch (erroCameraTraseira) {

      // Fallback para dispositivos que não aceitam facingMode

      stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: VIDEO_CONFIG.audio
        });
    }


    // ----------------------------------------------------------------------
    // Preview ao vivo
    // ----------------------------------------------------------------------

    if (videoPreview) {

      videoPreview.srcObject = stream;
      videoPreview.muted = true;
      videoPreview.setAttribute('playsinline', '');

      await videoPreview.play();
    }


    // ----------------------------------------------------------------------
    // Seleção do formato
    // ----------------------------------------------------------------------

    let options = {};

    if (
      typeof MediaRecorder !== 'undefined' &&
      typeof MediaRecorder.isTypeSupported === 'function'
    ) {

      if (
        MediaRecorder.isTypeSupported('video/mp4')
      ) {
        options.mimeType = 'video/mp4';

      } else if (
        MediaRecorder.isTypeSupported(
          'video/webm;codecs=vp8'
        )
      ) {
        options.mimeType =
          'video/webm;codecs=vp8';

      } else if (
        MediaRecorder.isTypeSupported('video/webm')
      ) {
        options.mimeType = 'video/webm';
      }
    }


    // ----------------------------------------------------------------------
    // Criar MediaRecorder
    // ----------------------------------------------------------------------

    try {

      mediaRecorder =
        new MediaRecorder(stream, options);

    } catch (erroFormato) {

      mediaRecorder =
        new MediaRecorder(stream);
    }


    // ----------------------------------------------------------------------
    // Receber dados
    // ----------------------------------------------------------------------

    mediaRecorder.ondataavailable = (evento) => {

      if (
        evento.data &&
        evento.data.size > 0
      ) {
        chunks.push(evento.data);
      }
    };


    // ----------------------------------------------------------------------
    // Finalização
    // ----------------------------------------------------------------------

    mediaRecorder.onstop = () => {

      const mime =
        mediaRecorder.mimeType || 'video/webm';

      videoBlob =
        new Blob(chunks, {
          type: mime
        });


      // Liberar câmera

      stream
        .getTracks()
        .forEach(track => track.stop());


      // Mostrar resultado

      if (videoPreview) {

        videoPreview.srcObject = null;

        videoPreview.src =
          URL.createObjectURL(videoBlob);

        videoPreview.controls = true;
        videoPreview.loop = true;

        videoPreview
          .play()
          .catch(() => {});
      }
    };


    // ----------------------------------------------------------------------
    // Iniciar gravação
    // ----------------------------------------------------------------------

    mediaRecorder.start(1000);


    if (btnGravar) {

      btnGravar.disabled = true;

      btnGravar.classList.add(
        'opacity-50',
        'cursor-not-allowed'
      );
    }


    if (cronometro) {
      cronometro.classList.remove('hidden');
    }


    let tempo =
      VIDEO_CONFIG.duracaoSegundos;


    if (tempoEl) {
      tempoEl.textContent = tempo;
    }


    // ----------------------------------------------------------------------
    // Cronômetro
    // ----------------------------------------------------------------------

    const timer =
      setInterval(() => {

        tempo--;

        if (tempoEl) {
          tempoEl.textContent = tempo;
        }


        if (tempo <= 0) {

          clearInterval(timer);


          if (
            mediaRecorder &&
            mediaRecorder.state !== 'inactive'
          ) {
            mediaRecorder.stop();
          }


          if (btnGravar) {

            btnGravar.disabled = false;

            btnGravar.classList.remove(
              'opacity-50',
              'cursor-not-allowed'
            );

            btnGravar.textContent =
              '🎥 Gravar Novamente (10s)';
          }


          if (cronometro) {
            cronometro.classList.add('hidden');
          }
        }

      }, 1000);


  } catch (erro) {

    console.error(
      'Erro ao acessar a câmera:',
      erro
    );

    alert(
      'Erro ao acessar a câmera: ' +
      erro.message
    );
  }
}
