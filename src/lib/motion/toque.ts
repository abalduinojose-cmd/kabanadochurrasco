/**
 * Feedback de toque, discreto como o do iFood.
 *
 * Esmagar e soltar no botão (mola ζ 0,85) e um impacto curto na barra da
 * sacola quando um item entra. Tudo por relógio: nenhuma espera por quadro.
 */

import { CURVA, mola } from './curvas';
import { animar, aoTerminar, pausa } from './waapi';

let pousoPendente: Promise<void> | null = null;

/** O contador espera por isto antes de ticar; resolve na hora se não há nada em curso. */
export function aguardarPouso(): Promise<void> {
  return pousoPendente ?? Promise.resolve();
}

/** Esmaga em 80 ms e solta em mola. Resolve na soltura, pelo relógio. */
export async function esmagar(botao: Element): Promise<void> {
  const aperta = animar(botao, [{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }], {
    duration: 80,
    easing: CURVA.power2in,
  });
  await Promise.race([aoTerminar(aperta), pausa(90)]);
  const m = mola({ response: 0.3, dampingFraction: 0.85 });
  const solta = animar(botao, [{ transform: 'scale(0.96)' }, { transform: 'scale(1)' }], {
    duration: m.duration,
    easing: m.easing,
  });
  void Promise.race([aoTerminar(solta), pausa(m.duration + 100)]).then(() => {
    aperta.cancel();
    solta.cancel();
  });
}

/** A barra recebe o item: 1,02 → 1 em mola, a partir da base. */
export function impacto(barra: HTMLElement): void {
  barra.style.transformOrigin = '50% 100%';
  const m = mola({ response: 0.32, dampingFraction: 0.85 });
  const a = animar(barra, [{ transform: 'scale(1.02)' }, { transform: 'scale(1)' }], {
    duration: m.duration,
    easing: m.easing,
  });
  void Promise.race([aoTerminar(a), pausa(m.duration + 100)]).then(() => a.cancel());
}

/**
 * Adicionar com feedback: vibra (com gesto real), esmaga o botão e segura o
 * contador por ~120 ms para ele ticar junto com o toast, não antes.
 */
export async function adicionarComToque(botao: HTMLElement): Promise<void> {
  if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(12);
  const pouso = pausa(120);
  pousoPendente = pouso;
  void pouso.finally(() => {
    if (pousoPendente === pouso) pousoPendente = null;
  });
  await esmagar(botao);
}
