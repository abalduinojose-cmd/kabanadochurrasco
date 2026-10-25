/**
 * Curvas de movimento (receitas da skill movimento-premium).
 *
 * Entrada em `out`, saída em `in`, laço em `sineInOut`. A peça usa três
 * caracteres: calmo (power2), padrão (power3), seco (power4/expo).
 */

export const CURVA = {
  /** suave, apoio */
  power2out: 'cubic-bezier(0.25, 1, 0.5, 1)',
  /** padrão da casa: assentar longo */
  power3out: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  /** seco, decidido */
  power4out: 'cubic-bezier(0.22, 1, 0.36, 1)',
  /** dramático */
  expoOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** chegada macia sem sobressalto */
  circOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
  power2in: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  power3in: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  power4in: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  /** ambiente, laços diegéticos */
  sineInOut: 'cubic-bezier(0.37, 0, 0.63, 1)',
} as const;

export type Mola = {
  /** segundos de uma oscilação; 0,3–0,6 em entradas */
  response?: number;
  /** 1 = crítica (sem sobressalto); 0,80–0,85 = toque iOS; 0,6–0,7 = brincalhão */
  dampingFraction?: number;
};

/**
 * Mola amortecida como curva, função pura e seek-safe.
 * Devolve a duração até assentar (±0,1%) e a função de progresso p ∈ [0,1] → [0,1].
 */
export function springEase({ response = 0.5, dampingFraction = 1 }: Mola = {}): {
  duration: number;
  ease: (p: number) => number;
} {
  const w = (2 * Math.PI) / response;
  const z = dampingFraction;
  let pos: (t: number) => number;

  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    pos = (t) =>
      1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  } else if (z > 1) {
    const wo = w * Math.sqrt(z * z - 1);
    pos = (t) =>
      1 - Math.exp(-z * w * t) * (Math.cosh(wo * t) + ((z * w) / wo) * Math.sinh(wo * t));
  } else {
    pos = (t) => 1 - Math.exp(-w * t) * (1 + w * t);
  }

  // Tempo de assentar: último instante fora de ±0,1%, numa varredura fixa.
  const rate = z <= 1 ? z * w : (z - Math.sqrt(z * z - 1)) * w;
  const SCAN = 12 / rate;
  const N = 4800;
  let T = SCAN;
  for (let i = N; i >= 0; i--) {
    const t = (i / N) * SCAN;
    if (Math.abs(1 - pos(t)) > 0.001) {
      T = ((i + 1) / N) * SCAN;
      break;
    }
  }
  const xT = pos(T);
  return { duration: T, ease: (p) => pos(p * T) + p * (1 - xT) };
}

/**
 * Converte uma função de progresso em `linear(...)` do CSS, que a Web
 * Animations API aceita como easing. Amostragem uniforme; 48 pontos bastam
 * para uma mola.
 */
export function easeParaLinear(ease: (p: number) => number, amostras = 48): string {
  const pontos: string[] = [];
  for (let i = 0; i <= amostras; i++) {
    pontos.push(ease(i / amostras).toFixed(4));
  }
  return `linear(${pontos.join(', ')})`;
}

/** Mola pronta para a WAAPI: duração em ms e easing em `linear()`. */
export function mola(opts: Mola = {}): { duration: number; easing: string } {
  const s = springEase(opts);
  return { duration: Math.round(s.duration * 1000), easing: easeParaLinear(s.ease) };
}
