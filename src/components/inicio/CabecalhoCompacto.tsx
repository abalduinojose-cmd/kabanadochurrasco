'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { BotaoCompartilhar } from './BotaoCompartilhar';
import { LOJA } from '@/data/loja';

/**
 * A barra que o iFood mostra quando a capa sai da tela: nome da loja, busca e
 * compartilhar, fixa no topo. Entra em fade curto; as abas de categoria
 * grudam logo abaixo dela (top-14).
 */
export function CabecalhoCompacto() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const capa = document.getElementById('capa');
    if (!capa) return;
    const obs = new IntersectionObserver(
      ([e]) => setVisivel(!(e?.isIntersecting ?? true)),
      { threshold: 0, rootMargin: '-56px 0px 0px 0px' },
    );
    obs.observe(capa);
    return () => obs.disconnect();
  }, []);

  return (
    <header
      inert={!visivel}
      className={`fixed inset-x-0 top-0 z-30 border-b border-divisor bg-cartao transition-[opacity,transform] duration-200 ease-out ${
        visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-1 pl-4 pr-2">
        <p className="min-w-0 flex-1 truncate text-[17px] font-bold text-texto">{LOJA.nome}</p>
        <Link href="/busca" aria-label="Buscar no cardápio" className="grid size-11 place-items-center rounded-full text-texto hover:bg-fundo-2">
          <Search className="size-5" aria-hidden />
        </Link>
        <BotaoCompartilhar className="grid size-11 place-items-center rounded-full text-texto hover:bg-fundo-2" />
      </div>
    </header>
  );
}
