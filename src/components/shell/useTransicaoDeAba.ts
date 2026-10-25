'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Troca de aba com a View Transitions API.
 *
 * O CSS em globals.css faz o "cut the curve": o que sai acelera, o que entra
 * desacelera na mesma direção, corte no meio do voo. Este hook só marca a
 * direção no <html> e segura a transição até a rota nova renderizar.
 *
 * A promessa resolve no efeito que observa o pathname: é o sinal mais
 * confiável de que o DOM novo está em pé. Navegador sem a API navega direto.
 */

type Direcao = 'dir' | 'esq' | null;

const TETO_MS = 400;

type DocComVT = Document & {
  startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> };
};

export function useTransicaoDeAba() {
  const router = useRouter();
  const pathname = usePathname();
  const pendente = useRef<(() => void) | null>(null);

  useEffect(() => {
    pendente.current?.();
    pendente.current = null;
  }, [pathname]);

  return useCallback(
    (href: string, direcao: Direcao) => {
      if (href === pathname) return;
      const doc = document as DocComVT;

      if (!direcao || typeof doc.startViewTransition !== 'function') {
        router.push(href);
        return;
      }

      doc.documentElement.dataset.direcao = direcao;
      const vt = doc.startViewTransition(() => {
        const navegou = new Promise<void>((resolve) => {
          pendente.current = resolve;
          router.push(href);
        });
        /*
         * Teto de 400 ms: enquanto a transição espera, a tela fica congelada
         * na captura. Rota lenta (rede ruim, primeira compilação) não pode
         * travar o app; passou do teto, a transição corre com o que houver e o
         * conteúdo novo aparece em seguida sem deslizar.
         */
        const teto = new Promise<void>((resolve) => window.setTimeout(resolve, TETO_MS));
        return Promise.race([navegou, teto]);
      });
      // `finished` rejeita com AbortError quando a transição é pulada (outra
      // começou, ou reduce); é esperado, e a limpeza acontece do mesmo jeito.
      const limpar = () => {
        delete doc.documentElement.dataset.direcao;
      };
      vt.finished.then(limpar, limpar);
    },
    [router, pathname],
  );
}
