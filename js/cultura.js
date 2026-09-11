// ==========================================================================
// MONITORAMICROVIDA
// Identificação e armazenamento local por cultura
// ==========================================================================

import { STORAGE_PREFIX } from './config.js';


// --------------------------------------------------------------------------
// Identificação da cultura pela URL
// --------------------------------------------------------------------------

export function obterCulturaAtual() {
  const path = window.location.pathname.toLowerCase();

  if (path.includes('amphipodes')) return 'amphipodes';
  if (path.includes('tisbe')) return 'tisbe';
  if (path.includes('rotiferos')) return 'rotiferos';
  if (path.includes('nano')) return 'nano';

  return 'gigapods';
}


export const CULTURA_ATUAL = obterCulturaAtual();

export const STORAGE_KEY =
  `${STORAGE_PREFIX}${CULTURA_ATUAL}_v2`;


// --------------------------------------------------------------------------
// Leitura do armazenamento local
// --------------------------------------------------------------------------

export function obterRegistrosLocais() {
  try {
    return JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || '[]'
    );
  } catch (erro) {
    console.error('Erro ao ler registros locais:', erro);
    return [];
  }
}


// --------------------------------------------------------------------------
// Gravação no armazenamento local
// --------------------------------------------------------------------------

export function salvarRegistrosLocais(registros) {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(registros)
  );
}
