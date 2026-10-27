'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, UserRound } from 'lucide-react';
import { LogoKabana } from '@/components/layout/LogoKabana';
import { useComanda } from '@/store/comanda';
import { LOJA } from '@/data/loja';

/**
 * Abertura do atendimento, feita pelo garçom: escolhe a mesa (as 10 da
 * casa), escreve o próprio nome (fica lembrado no tablet) e entrega o
 * aparelho ao cliente.
 */

const MESAS = Array.from({ length: 10 }, (_, i) => String(i + 1));

export function InicioMesa() {
  const garcomSalvo = useComanda((s) => s.garcom);
  const abrirMesa = useComanda((s) => s.abrirMesa);
  const [mesa, setMesa] = useState<string | null>(null);
  const [garcom, setGarcom] = useState(garcomSalvo);
  const escolhida = mesa;

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-carvao text-white">
      {LOJA.capas[0] && <Image src={LOJA.capas[0]} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-40" />}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(11,11,11,0.55),rgba(11,11,11,0.95)_70%)]" />

      <div className="mx-auto flex min-h-dvh max-w-[760px] flex-col justify-center px-5 py-10 sm:px-8">
        <div className="flex items-center gap-3.5">
          <LogoKabana sizes="72px" alt="" className="w-[72px] shrink-0" />
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-fogo">Atendimento na mesa</p>
            <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[30px]">{LOJA.nome}</h1>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] bg-white/[0.06] p-5 ring-1 ring-inset ring-white/10 backdrop-blur-md sm:p-7">
          <h2 className="text-[19px] font-extrabold">Qual é a mesa?</h2>
          <p className="mt-1 text-[14px] text-white/65">Escolha a mesa, escreva seu nome e entregue o tablet ao cliente.</p>

          <div role="radiogroup" aria-label="Número da mesa" className="mt-5 grid grid-cols-5 gap-2.5 sm:gap-3">
            {MESAS.map((n) => {
              const ativa = mesa === n;
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={ativa}
                  onClick={() => setMesa(n)}
                  className={`h-16 min-h-16 rounded-[18px] text-[22px] font-extrabold sm:h-20 sm:text-[26px] tabular-nums transition-[background-color,color,transform] duration-150 active:scale-95 ${
                    ativa ? 'bg-fogo text-carvao shadow-[0_10px_24px_-10px_rgba(255,106,0,0.9)]' : 'bg-white/[0.08] text-white hover:bg-white/[0.14]'
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <label className="block">
              <span className="text-[13px] font-semibold text-white/70">Seu nome (atendente)</span>
              <span className="relative mt-1.5 block">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-white/40" aria-hidden />
                <input
                  value={garcom}
                  onChange={(e) => setGarcom(e.target.value.slice(0, 30))}
                  placeholder="Ex.: Paulo"
                  autoComplete="off"
                  className="h-13 w-full rounded-[14px] border border-white/10 bg-white/[0.08] py-3 pl-11 pr-4 text-[16px] text-white placeholder:text-white/35 focus:border-fogo focus:outline-none"
                />
              </span>
            </label>
          </div>

          <button
            type="button"
            disabled={!escolhida}
            onClick={() => escolhida && abrirMesa(escolhida, garcom)}
            className="mt-6 flex h-15 w-full items-center justify-center gap-2 rounded-[18px] bg-fogo py-4 text-[17px] font-extrabold text-carvao shadow-[0_14px_30px_-14px_rgba(255,106,0,0.95)] transition-transform duration-150 active:scale-[0.99] disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
          >
            {escolhida ? `Começar atendimento na mesa ${escolhida}` : 'Escolha a mesa para começar'}
            {escolhida && <ArrowRight className="size-5" strokeWidth={2.5} aria-hidden />}
          </button>
        </div>
        <p className="mt-5 text-center text-[12.5px] text-white/45">Para trocar de mesa ou encerrar depois, segure o selo da mesa por 1 segundo.</p>
      </div>
    </div>
  );
}
