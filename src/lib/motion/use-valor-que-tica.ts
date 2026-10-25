'use client';

import { useEffect, useRef, useState } from 'react';
import { aguardarPouso } from './toque';

/**
 * Um número que TICA do valor antigo ao novo em vez de trocar seco.
 *
 * Espera o 'pouso' do toque quando há um em curso, para o contador ticar
 * junto com o toast e não antes. Nunca passa do valor (Math.round, curva out).
 * Roda também com "reduzir movimento": contar é mostrar a mudança.
 */
export function useValorQueTica(valor: number, ms = 280): number {
  const [exibido, setExibido] = useState(valor);
  // Espelho do que está NA TELA. O cleanup não mexe nele: em StrictMode o
  // efeito roda duas vezes, e se o cleanup gravasse o alvo aqui a segunda
  // execução acharia que não há nada a contar e o número ficaria preso.
  const naTela = useRef(valor);

  useEffect(() => {
    const de = naTela.current;
    const para = valor;
    if (de === para) return;

    let raf = 0;
    let encaixe = 0;
    let cancelado = false;

    void aguardarPouso().then(() => {
      if (cancelado) return;
      const inicio = performance.now();
      const passo = (agora: number) => {
        const p = Math.min(1, (agora - inicio) / ms);
        const e = 1 - Math.pow(1 - p, 3); // power3.out
        const v = Math.round(de + (para - de) * e);
        naTela.current = v;
        setExibido(v);
        if (p < 1) raf = requestAnimationFrame(passo);
      };
      raf = requestAnimationFrame(passo);
      // Encaixe pelo relógio: sem quadros (aba oculta) o número não pode ficar
      // velho. Preço na tela nunca depende de animação.
      encaixe = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        naTela.current = para;
        setExibido(para);
      }, ms + 60);
    });

    return () => {
      cancelado = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(encaixe);
    };
  }, [valor, ms]);

  return exibido;
}
