'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, ReceiptText, CircleUserRound, type LucideIcon } from 'lucide-react';
import { ABAS, direcaoDaAba, indiceDaAba, type HrefAba } from './abas';
import { useTransicaoDeAba } from './useTransicaoDeAba';

/**
 * As quatro abas (Início, Busca, Pedidos, Perfil) numa barra flutuante de
 * cantos redondos, solta das bordas. Ícone + rótulo; a atual ganha uma cápsula
 * laranja-clara. Links de verdade (deep link, voltar).
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
      <div className="pointer-events-auto mx-auto grid h-[var(--altura-abas)] max-w-md grid-cols-4 gap-1 rounded-[24px] bg-cartao/95 p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_14px_34px_-14px_rgba(0,0,0,0.4)] backdrop-blur-md">
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
              className={`flex min-h-0 flex-col items-center justify-center gap-0.5 rounded-[18px] text-[11px] font-bold transition-colors ${
                ativa ? 'bg-fogo-suave text-fogo-texto' : 'text-texto-2 hover:text-texto'
              }`}
            >
              <Icone className="size-[22px]" strokeWidth={ativa ? 2.3 : 1.8} aria-hidden />
              {aba.rotulo}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
