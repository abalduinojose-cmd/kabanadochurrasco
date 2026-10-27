'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, Smartphone, UserRound } from 'lucide-react';
import { LogoKabana } from '@/components/layout/LogoKabana';
import { useComanda, resumoDaComanda, type ComandaGuardada } from '@/store/comanda';
import { useAgora } from '@/lib/use-agora';
import { LOJA } from '@/data/loja';

/**
 * A tela das mesas, onde o /atendimento sempre começa. As 10 mesas da casa:
 * LIVRE (selo verde), ou EM ATENDIMENTO (laranja) com o atendente, há quanto
 * tempo está aberta e o andamento (pedidos enviados ou itens em montagem),
 * sem valores: preço não aparece nesta tela (a conta fica no menu do garçom). O garçom toca na mesa:
 * livre pede o nome dele e começa o atendimento (entrega o tablet ao cliente
 * nas boas-vindas); em atendimento retoma de onde parou, direto no cardápio.
 * São as mesas deste tablet (sem servidor, um tablet não vê o outro).
 */

const MESAS = Array.from({ length: 10 }, (_, i) => String(i + 1));

function haQuanto(desde: number, agora: Date | null): string | null {
  if (!agora) return null;
  const min = Math.max(0, Math.round((agora.getTime() - desde) / 60_000));
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  return `há ${h} h${min % 60 ? ` ${String(min % 60).padStart(2, '0')}` : ''}`;
}

const textoDosEnviados = (n: number) => (n === 0 ? 'Nenhum pedido enviado' : n === 1 ? '1 pedido enviado' : `${n} pedidos enviados`);

/** O que a mesa tem, sem valores (preço não aparece na tela das mesas): pedidos enviados ou itens em montagem. */
function andamento(enviados: number, noPedido: number): string {
  if (enviados > 0) return enviados === 1 ? '1 pedido enviado' : `${enviados} pedidos enviados`;
  if (noPedido > 0) return noPedido === 1 ? '1 item no pedido' : `${noPedido} itens no pedido`;
  return 'Sem pedidos';
}

type Props = {
  /** `nova`: mesa que começou agora (vai às boas-vindas); retomada vai direto ao cardápio. */
  aoAbrir: (nova: boolean) => void;
};

export function InicioMesa({ aoAbrir }: Props) {
  const garcomSalvo = useComanda((s) => s.garcom);
  const emAtendimento = useComanda((s) => s.emAtendimento);
  const abrirMesa = useComanda((s) => s.abrirMesa);
  const agora = useAgora();
  const [mesa, setMesa] = useState<string | null>(null);
  const [garcom, setGarcom] = useState(garcomSalvo);

  const abertas = MESAS.filter((n) => emAtendimento[n]);
  const escolhida: ComandaGuardada | undefined = mesa ? emAtendimento[mesa] : undefined;

  function comecar() {
    if (!mesa) return;
    abrirMesa(mesa, garcom);
    aoAbrir(!escolhida);
  }

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-carvao text-white">
      {LOJA.capas[0] && <Image src={LOJA.capas[0]} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-40" />}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(11,11,11,0.55),rgba(11,11,11,0.95)_70%)]" />

      <div className="mx-auto flex min-h-dvh max-w-[860px] flex-col justify-center px-5 py-10 sm:px-8">
        <div className="flex items-center gap-3.5">
          <LogoKabana sizes="72px" alt="" className="w-[72px] shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-fogo">Atendimento na mesa</p>
            <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[30px]">{LOJA.nome}</h1>
          </div>
          <Link
            href="/"
            className="hidden min-h-11 shrink-0 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-[13px] font-bold text-white/80 ring-1 ring-inset ring-white/10 hover:bg-white/[0.14] sm:inline-flex"
          >
            <Smartphone className="size-4" aria-hidden />
            App de delivery
          </Link>
        </div>

        <div className="mt-8 rounded-[28px] bg-white/[0.06] p-5 ring-1 ring-inset ring-white/10 backdrop-blur-md sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            <div>
              <h2 className="text-[19px] font-extrabold">Mesas</h2>
              <p className="mt-1 text-[14px] text-white/65">Toque numa mesa livre para abrir, ou numa em atendimento para continuar.</p>
            </div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-1.5 text-[13px] font-bold">
              <i aria-hidden className={`size-2 rounded-full ${abertas.length ? 'bg-fogo' : 'bg-white/35'}`} />
              {abertas.length === 0 ? 'Nenhuma mesa em atendimento' : `${abertas.length} ${abertas.length === 1 ? 'mesa em atendimento' : 'mesas em atendimento'}`}
            </p>
          </div>

          <div role="radiogroup" aria-label="Mesas" className="mt-5 grid grid-cols-2 gap-2.5 min-[480px]:grid-cols-3 sm:grid-cols-5 sm:gap-3">
            {MESAS.map((n) => {
              const c = emAtendimento[n];
              const r = c ? resumoDaComanda(c) : null;
              const ativa = mesa === n;
              const quando = c ? haQuanto(c.abertaEm, agora) : null;
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={ativa}
                  aria-label={c ? `Mesa ${n}, em atendimento${c.garcom ? ` com ${c.garcom}` : ''}` : `Mesa ${n}, livre`}
                  onClick={() => setMesa(n)}
                  className={`relative flex min-h-[112px] flex-col justify-between rounded-[20px] p-3 text-left transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.97] ${
                    c ? 'bg-fogo/[0.16] ring-1 ring-inset ring-fogo/45' : 'bg-white/[0.07] hover:bg-white/[0.12]'
                  } ${ativa ? '!ring-2 !ring-fogo shadow-[0_12px_28px_-12px_rgba(255,106,0,0.9)]' : ''}`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[30px] font-extrabold leading-none tabular-nums">{n}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-[0.06em] ${
                        c ? 'bg-fogo text-carvao' : 'bg-[#1e8e4b] text-white'
                      }`}
                    >
                      {c ? 'Aberta' : 'Livre'}
                    </span>
                  </span>
                  {c && r ? (
                    <span className="mt-2 block leading-tight">
                      <span className="block truncate text-[12.5px] font-bold text-white">{c.garcom || 'Sem atendente'}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-[11.5px] text-white/60">
                        <Clock className="size-3 shrink-0" aria-hidden />
                        {quando ?? ' '}
                      </span>
                      <span className="mt-1 block text-[13px] font-extrabold tabular-nums text-[#ff9a52]">
                        {andamento(r.pedidosEnviados, r.itensNoPedido)}
                      </span>
                    </span>
                  ) : (
                    <span className="mt-2 block text-[12px] text-white/40">Toque para abrir</span>
                  )}
                </button>
              );
            })}
          </div>

          {mesa && !escolhida && (
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
          )}

          {mesa && escolhida && (
            <p className="mt-5 rounded-[16px] bg-white/[0.06] px-4 py-3 text-[14px] text-white/75">
              Mesa {mesa} aberta {haQuanto(escolhida.abertaEm, agora) ?? ''}
              {escolhida.garcom ? ` por ${escolhida.garcom}` : ''}. {textoDosEnviados(resumoDaComanda(escolhida).pedidosEnviados)}.
            </p>
          )}

          <button
            type="button"
            disabled={!mesa}
            onClick={comecar}
            className="mt-5 flex h-15 w-full items-center justify-center gap-2 rounded-[18px] bg-fogo py-4 text-[17px] font-extrabold text-carvao shadow-[0_14px_30px_-14px_rgba(255,106,0,0.95)] transition-transform duration-150 active:scale-[0.99] disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
          >
            {!mesa ? 'Escolha uma mesa' : escolhida ? `Continuar o atendimento da mesa ${mesa}` : `Começar atendimento na mesa ${mesa}`}
            {mesa && <ArrowRight className="size-5" strokeWidth={2.5} aria-hidden />}
          </button>
        </div>
        <p className="mt-5 text-center text-[12.5px] text-white/45">
          No cardápio, o botão Mesas volta para cá sem fechar a mesa. Para encerrar, segure o selo da mesa por 1 segundo.
        </p>
      </div>
    </div>
  );
}
