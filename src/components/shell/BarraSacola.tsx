'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { useCarrinho, selQuantidade, selSubtotal } from '@/store/cart';
import { formatBRL } from '@/lib/money';
import { impacto } from '@/lib/motion/toque';
import { useValorQueTica } from '@/lib/motion/use-valor-que-tica';

/**
 * "Ver sacola", a faixa laranja que nasce dentro da doca das abas quando a
 * sacola tem item (a doca cresce para cima): a sacola com o contador, a
 * quantidade de itens e o total. Ao receber item, dá um impacto curto e o
 * contador e o total ticam até o valor novo.
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
    <div data-alvo-carrinho className="overflow-hidden" style={{ animation: 'doca-sacola 340ms var(--ease-expo) both' }}>
      <div ref={barra} className="pb-1.5">
        <Link
          href="/sacola"
          className="flex h-[var(--altura-sacola)] items-center gap-3 rounded-[22px] bg-fogo pl-2 pr-3 text-carvao shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] active:brightness-95"
        >
          <span className="relative grid size-10 shrink-0 place-items-center rounded-[15px] bg-brasa text-fogo">
            <ShoppingBag className="size-5" strokeWidth={2.25} aria-hidden />
            <span
              data-contador-carrinho
              className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-extrabold tabular-nums text-carvao ring-2 ring-fogo"
            >
              {qtdExibida}
            </span>
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[15px] font-extrabold">Ver sacola</span>
            <span className="block text-[12px] font-semibold text-carvao/65">
              {quantidade} {quantidade === 1 ? 'item' : 'itens'}
            </span>
          </span>
          <span className="text-[16px] font-extrabold tabular-nums">{formatBRL(subtotalExibido)}</span>
          <ChevronRight className="size-5 shrink-0 text-carvao/55" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
