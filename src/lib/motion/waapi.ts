/**
 * Ajudantes da Web Animations API.
 *
 * Regras da casa: `fill: 'both'` sempre, iterações finitas, nenhum `transition`
 * CSS no mesmo elemento, geometria medida uma vez. Quem anima por aqui é o
 * único dono do movimento daquele elemento.
 */

export type Quadros = Keyframe[] | PropertyIndexedKeyframes;

export function animar(el: Element, quadros: Quadros, opcoes: KeyframeEffectOptions): Animation {
  return el.animate(quadros, { fill: 'both', ...opcoes });
}

/** Resolve quando a animação termina (ou é cancelada), sem lançar. */
export function aoTerminar(anim: Animation): Promise<void> {
  return anim.finished.then(
    () => undefined,
    () => undefined,
  );
}

/** Espera um tempo dentro de uma coreografia. */
export function pausa(ms: number): Promise<void> {
  return new Promise((r) => window.setTimeout(r, ms));
}

/** Centro de um elemento em coordenadas de viewport, medido uma vez. */
export function centroDe(el: Element): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
