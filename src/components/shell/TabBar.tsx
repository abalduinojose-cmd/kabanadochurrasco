'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, ReceiptText, CircleUserRound, type LucideIcon } from 'lucide-react';
import { ABAS, direcaoDaAba, indiceDaAba, type HrefAba } from './abas';
import { BarraSacola } from './BarraSacola';
import { useTransicaoDeAba } from './useTransicaoDeAba';

/**
 * A doca do rodapé: uma barra flutuante no carvão da fachada, solta das bordas,
 * com as quatro abas (Início, Busca, Pedidos, Perfil). A aba atual tem o ícone
 * laranja e uma cápsula de vidro que DESLIZA até ela na troca (a aba anda, não
 * pisca). Com item na sacola, a doca cresce para cima e ganha a faixa laranja
 * "Ver sacola" (`BarraSacola`). Links de verdade (deep link, voltar).
 */

const ICONES: Record<HrefAba, LucideIcon> = {
  '/': Home,
  '/busca': Search,
  '/pedidos': ReceiptText,
  '/perfil': CircleUserRound,
};

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const ir = useTransicaoDeAba();
  const atual = indiceDaAba(pathname);

  useEffect(() => {
    for (const aba of ABAS) router.prefetch(aba.href);
  }, [router]);

  return (
    <nav aria-label="Navegação principal" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(10px,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto max-w-md rounded-[28px] bg-brasa/95 p-1.5 text-white shadow-[0_20px_44px_-16px_rgba(0,0,0,0.75)] ring-1 ring-inset ring-white/10 backdrop-blur-md">
        <BarraSacola />
        <div className="relative grid h-[54px] grid-cols-4">
          {atual >= 0 && (
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1/4 p-0.5 transition-transform duration-300 ease-[var(--ease-brasa)]"
              style={{ transform: `translateX(${atual * 100}%)` }}
            >
              <span className="block h-full rounded-[20px] bg-white/[0.09] ring-1 ring-inset ring-white/10" />
            </span>
          )}
          {ABAS.map((aba, i) => {
            const Icone = ICONES[aba.href];
            const ativa = i === atual;
            return (
              <a
                key={aba.href}
                href={aba.href}
                aria-current={ativa ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  ir(aba.href, direcaoDaAba(atual, i));
                }}
                className={`relative flex min-h-0 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
                  ativa ? 'text-white' : 'text-white/50 hover:text-white/80'
                }`}
              >
                <Icone className={`size-[21px] transition-colors ${ativa ? 'text-fogo' : ''}`} strokeWidth={ativa ? 2.3 : 1.9} aria-hidden />
                {aba.rotulo}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
