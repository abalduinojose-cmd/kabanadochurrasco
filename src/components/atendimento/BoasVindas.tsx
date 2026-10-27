'use client';

import Image from 'next/image';
import { ArrowRight, LayoutGrid, Star } from 'lucide-react';
import { LogoKabana } from '@/components/layout/LogoKabana';
import { LOJA } from '@/data/loja';
import { rotuloMesa } from '@/lib/mensagem-mesa';

/**
 * A tela que o cliente vê quando recebe o tablet: a foto da casa, as
 * boas-vindas, a mesa e um botão grande para abrir o cardápio. Qualquer toque
 * também abre. No canto, "Mesas" leva o garçom de volta à tela das mesas
 * (a mesa continua aberta).
 */
export function BoasVindas({ mesa, aoEntrar, aoVoltar }: { mesa: string; aoEntrar: () => void; aoVoltar: () => void }) {
  const nota = LOJA.nota;
  return (
    <div className="relative h-dvh">
      <button
        type="button"
        onClick={() => aoVoltar()}
        className="absolute right-5 top-6 z-10 inline-flex min-h-11 items-center gap-2 rounded-full bg-black/45 px-4 text-[14px] font-bold text-white ring-1 ring-inset ring-white/20 backdrop-blur-md sm:right-10 sm:top-10"
      >
        <LayoutGrid className="size-[18px]" aria-hidden />
        Mesas
      </button>
      <button type="button" onClick={aoEntrar} className="relative isolate block h-dvh w-full cursor-pointer overflow-hidden bg-carvao text-left text-white">
        {LOJA.capas[0] && <Image src={LOJA.capas[0]} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />}
        <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/55 to-black/20" />

        <span className="absolute left-6 top-6 flex items-center gap-3 sm:left-10 sm:top-10">
          <span className="grid size-14 place-items-center rounded-[18px] bg-black/70 ring-1 ring-white/15 backdrop-blur">
            <LogoKabana sizes="46px" alt="" className="w-[46px]" />
          </span>
          <span className="rounded-full bg-white/15 px-4 py-2 text-[15px] font-extrabold tracking-[0.08em] ring-1 ring-inset ring-white/20 backdrop-blur-md">
            {rotuloMesa(mesa)}
          </span>
        </span>

        <span className="absolute inset-x-6 bottom-10 block sm:inset-x-10 sm:bottom-14">
          <span className="block text-[15px] font-semibold uppercase tracking-[0.16em] text-fogo">Bem-vindo à</span>
          <span className="mt-1 block text-[44px] font-extrabold leading-[0.95] tracking-[-0.03em] sm:text-[68px]">{LOJA.nome}</span>
          <span className="mt-3 block max-w-[34ch] text-[17px] leading-snug text-white/80 sm:text-[20px]">
            Escolha no cardápio e envie o seu pedido direto daqui. O garçom acompanha tudo.
          </span>
          <span className="mt-7 flex flex-wrap items-center gap-4">
            <span className="inline-flex h-16 items-center gap-3 rounded-[20px] bg-fogo px-8 text-[19px] font-extrabold text-carvao shadow-[0_18px_40px_-16px_rgba(255,106,0,0.95)]">
              Ver o cardápio
              <ArrowRight className="size-6" strokeWidth={2.5} aria-hidden />
            </span>
            {nota && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-[15px] font-bold ring-1 ring-inset ring-white/15 backdrop-blur-md">
                <Star className="size-4 fill-[#F5A623] text-[#F5A623]" aria-hidden />
                {nota.valor.toFixed(1).replace('.', ',')} no Google
                <span className="font-medium text-white/65">({nota.total} avaliações)</span>
              </span>
            )}
          </span>
        </span>
      </button>
    </div>
  );
}
