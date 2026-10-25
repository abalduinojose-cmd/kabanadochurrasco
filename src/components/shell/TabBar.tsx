'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, ReceiptText, CircleUserRound, type LucideIcon } from 'lucide-react';
import { ABAS, direcaoDaAba, indiceDaAba, type HrefAba } from './abas';
import { useTransicaoDeAba } from './useTransicaoDeAba';

/**
 * As quatro abas do iFood no rodapé: Início, Busca, Pedidos, Perfil.
 * Ícone + rótulo; a atual em laranja. Links de verdade (deep link, voltar).
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
    <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-40 border-t border-divisor bg-cartao">
      <div className="pb-seguro mx-auto grid h-[calc(var(--altura-abas)+env(safe-area-inset-bottom))] max-w-2xl grid-cols-4">
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
              className={`flex flex-col items-center justify-center gap-1 pt-1.5 text-[11px] font-semibold transition-colors ${
                ativa ? 'text-fogo-texto' : 'text-texto-2 hover:text-texto'
              }`}
            >
              <Icone className="size-6" strokeWidth={ativa ? 2.2 : 1.8} aria-hidden />
              {aba.rotulo}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
