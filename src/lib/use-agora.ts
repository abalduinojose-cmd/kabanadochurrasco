'use client';

import { useSyncExternalStore } from 'react';

/**
 * O relógio, resolvido só no cliente.
 *
 * Qualquer coisa que dependa da hora (loja aberta, próxima abertura, carimbo
 * do pedido) daria resultado diferente no servidor e no navegador, e quebraria
 * a hidratação. Aqui o snapshot do servidor é `null`: quem chama renderiza um
 * estado neutro primeiro e resolve depois.
 *
 * A fatia é o minuto, não o milissegundo, para o valor ser estável entre
 * renders e a loja fechar sozinha na tela de quem deixou a página aberta.
 */

const MEIO_MINUTO = 30_000;

function assinar(aoMudar: () => void) {
  const t = setInterval(aoMudar, MEIO_MINUTO);
  return () => clearInterval(t);
}

const minutoAtual = () => Math.floor(Date.now() / 60_000);
const noServidor = () => null;

/** Devolve null no servidor e no primeiro render; depois, o "agora". */
export function useAgora(): Date | null {
  const minuto = useSyncExternalStore(assinar, minutoAtual, noServidor);
  return minuto === null ? null : new Date(minuto * 60_000);
}
