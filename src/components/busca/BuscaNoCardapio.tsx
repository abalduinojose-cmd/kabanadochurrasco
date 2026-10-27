'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PaginaBusca } from './PaginaBusca';
import { useBusca } from '@/store/busca';

/**
 * A busca aberta pela lupa, por cima da página inicial: o mesmo conteúdo da
 * aba Busca (recentes, categorias, resultados), sem sair do cardápio. Fecha
 * pela seta, pelo Esc ou ao levar a uma categoria; trava a rolagem de baixo.
 * Vai para o body para cobrir também a barra de abas.
 */
export function BuscaNoCardapio() {
  const aberta = useBusca((s) => s.aberta);
  const fechar = useBusca((s) => s.fechar);

  // Ao sair da página inicial (abrir um prato, por exemplo), a camada não fica aberta.
  useEffect(() => () => useBusca.getState().fechar(), []);

  useEffect(() => {
    if (!aberta) return;
    const raiz = document.documentElement;
    const antes = raiz.style.overflow;
    raiz.style.overflow = 'hidden';
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
    };
    window.addEventListener('keydown', tecla);
    return () => {
      raiz.style.overflow = antes;
      window.removeEventListener('keydown', tecla);
    };
  }, [aberta, fechar]);

  if (!aberta) return null;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Buscar no cardápio" className="anima-veu fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-cartao">
      <PaginaBusca aoFechar={fechar} />
    </div>,
    document.body,
  );
}
