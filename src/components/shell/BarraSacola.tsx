'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCarrinho, selQuantidade, selSubtotal } from '@/store/cart';
import { formatBRL } from '@/lib/money';
import { impacto } from '@/lib/motion/toque';
import { useValorQueTica } from '@/lib/motion/use-valor-que-tica';

/**
 * "Ver sacola", a barra flutuante do iFood: laranja, acima das abas, com o
 * contador no ícone e o total à direita. Ao receber item, dá um impacto curto
 * e o contador e o total ticam até o valor novo.
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
          className="sombra-flutuante flex h-[var(--altura-sacola)] items-center gap-3 rounded-cartao bg-fogo px-4 text-carvao"
        >
          <span className="relative">
            <ShoppingBag className="size-6" strokeWidth={2} aria-hidden />
            <span
              data-contador-carrinho
              className="absolute -right-2.5 -top-2 grid min-w-[18px] place-items-center rounded-full bg-carvao px-1 text-[10px] font-extrabold tabular-nums text-fogo"
            >
              {qtdExibida}
            </span>
          </span>
          <span className="flex-1 text-[15px] font-bold">Ver sacola</span>
          <span className="text-[15px] font-extrabold tabular-nums">{formatBRL(subtotalExibido)}</span>
        </Link>
      </div>
    </div>
  );
}
