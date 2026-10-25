'use client';

import { useEffect } from 'react';
import { Undo2 } from 'lucide-react';
import { useCarrinho, JANELA_DESFAZER_MS } from '@/store/cart';

/**
 * Desfazer no lugar de "tem certeza?". A remoção acontece na hora e fica
 * cinco segundos ao alcance, na mesma pílula escura do toast do app.
 */
export function DesfazerToast() {
  const removida = useCarrinho((s) => s.removida);
  const desfazer = useCarrinho((s) => s.desfazerRemocao);
  const descartar = useCarrinho((s) => s.descartarDesfazer);

  useEffect(() => {
    if (!removida) return;
    const t = window.setTimeout(descartar, JANELA_DESFAZER_MS);
    return () => window.clearTimeout(t);
  }, [removida, descartar]);

  if (!removida) return null;

  return (
    <div
      role="status"
      style={{ animation: 'toast-entra 220ms var(--ease-brasa)', bottom: 'calc(88px + env(safe-area-inset-bottom))' }}
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4"
    >
      <div className="sombra-flutuante pointer-events-auto flex items-center gap-3 rounded-botao bg-carvao py-2 pl-4 pr-2 text-fundo">
        <span className="truncate text-[14px] font-semibold">{removida.linha.nome} saiu da sacola</span>
        <button
          type="button"
          onClick={desfazer}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-botao px-3 text-[14px] font-bold text-fogo"
        >
          <Undo2 className="size-4" aria-hidden />
          Desfazer
        </button>
      </div>
    </div>
  );
}
