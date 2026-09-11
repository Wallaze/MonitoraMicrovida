// ==========================================================================
// MONITORAMICROVIDA
// Temperatura ambiente automática
// ==========================================================================

import { TEMPERATURA_AMBIENTE_PADRAO } from './config.js';


// --------------------------------------------------------------------------
// Obter temperatura ambiente através de Geolocation + Open-Meteo
// --------------------------------------------------------------------------

export async function obterTempAmbienteAuto() {
  const elTemp = document.getElementById('tempAmbiente');

  if (!elTemp) return;

  const usarTemperaturaPadrao = () => {
    elTemp.value = TEMPERATURA_AMBIENTE_PADRAO;
  };


  if (!('geolocation' in navigator)) {
    usarTemperaturaPadrao();
    return;
  }


  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${latitude}` +
          `&longitude=${longitude}` +
          `&current_weather=true`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error('Falha ao consultar Open-Meteo.');
        }

        const data = await res.json();

        const temperatura =
          data?.current_weather?.temperature;

        elTemp.value =
          temperatura ?? TEMPERATURA_AMBIENTE_PADRAO;

      } catch (erro) {
        console.error(
          'Erro ao obter temperatura ambiente:',
          erro
        );

        usarTemperaturaPadrao();
      }
    },

    () => {
      usarTemperaturaPadrao();
    }
  );
}
