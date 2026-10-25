'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { useCarrinho, selQuantidade, selSubtotal } from '@/store/cart';
import { formatBRL } from '@/lib/money';
import { impacto } from '@/lib/motion/toque';
import { useValorQueTica } from '@/lib/motion/use-valor-que-tica';

/**
 * "Ver sacola", a barra flutuante acima das abas: escura, com o ícone laranja
 * e o contador, a quantidade de itens e o total. Ao receber item, dá um
 * impacto curto e o contador e o total ticam até o valor novo.
 */
export function BarraSacola() {
  const hidratado = useCarrinho((s) => s.hidratado);
  const quantidade = useCarrinho(selQuantidade);
  const subtotal = useCarrinho(selSubtotal);
  const qtdExibida = useValorQueTica(quantidade);
  const subtotalExibido = useValorQueTica(subtotal, 360);

  const barra = useRef<HTMLDivElement>(null);
  const anterior = useRef(quantidade);

  useEffect(() => {
    const subiu = quantidade > anterior.current;
    anterior.current = quantidade;
    if (subiu && barra.current) impacto(barra.current);
  }, [quantidade]);

  if (!hidratado || quantidade === 0) return null;

  return (
    <div
      data-alvo-carrinho
      className="fixed inset-x-0 z-40 px-3"
      style={{ bottom: 'calc(var(--altura-abas) + env(safe-area-inset-bottom) + 10px)' }}
    >
      <div ref={barra} className="mx-auto max-w-2xl" style={{ animation: 'sobe 300ms var(--ease-expo)' }}>
        <Link
          href="/sacola"
          className="flex h-[var(--altura-sacola)] items-center gap-3 rounded-[18px] bg-carvao pl-2 pr-3 text-white shadow-[0_12px_28px_-10px_rgba(0,0,0,0.55)]"
        >
          <span className="relative grid size-10 shrink-0 place-items-center rounded-[13px] bg-fogo text-carvao">
            <ShoppingBag className="size-5" strokeWidth={2.25} aria-hidden />
            <span
              data-contador-carrinho
              className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-extrabold tabular-nums text-carvao ring-2 ring-carvao"
            >
              {qtdExibida}
            </span>
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[15px] font-bold">Ver sacola</span>
            <span className="block text-[12px] text-white/60">
              {quantidade} {quantidade === 1 ? 'item' : 'itens'}
            </span>
          </span>
          <span className="text-[16px] font-extrabold tabular-nums">{formatBRL(subtotalExibido)}</span>
          <ChevronRight className="size-5 shrink-0 text-white/50" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
