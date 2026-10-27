'use client';

import { isOpenNow } from './store-hours';
import { useAgora } from './use-agora';

/**
 * A loja está aberta agora? É o que decide se o pedido pode ser finalizado:
 * fora do horário o app continua todo aberto (cardápio, sacola, checkout),
 * aparece o aviso (`AvisoHorario`) e o envio é bloqueado no checkout e no
 * tablet da mesa. null enquanto o relógio não resolveu (servidor e primeiro
 * render).
 *
 * Modo de teste, para mostrar o app fora do horário: abrir qualquer página com
 * `?teste=aberto` deixa a loja aberta até fechar a aba (fica na sessão);
 * `?teste=fechado` desliga.
 */

const CHAVE = 'kabana:teste-aberto';

if (typeof window !== 'undefined') {
  try {
    const pedido = new URLSearchParams(window.location.search).get('teste');
    if (pedido === 'aberto') sessionStorage.setItem(CHAVE, '1');
    if (pedido === 'fechado') sessionStorage.removeItem(CHAVE);
  } catch {
    // sessão bloqueada: segue o relógio
  }
}

function emModoTeste(): boolean {
  try {
    return sessionStorage.getItem(CHAVE) === '1';
  } catch {
    return false;
  }
}

export function useLojaAberta(): boolean | null {
  const agora = useAgora();
  if (agora === null) return null;
  return emModoTeste() || isOpenNow(agora);
}
