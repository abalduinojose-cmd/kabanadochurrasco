'use client';

import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Check, Ticket, X } from 'lucide-react';
import { useCupom } from '@/store/cupom';
import { useAgora } from '@/lib/use-agora';
import { avaliarCupom, cuponsNaVitrine, type Avaliacao, type ContextoCupom } from '@/lib/cupom';
import { formatBRL } from '@/lib/money';

/**
 * O cupom no checkout. Fechado, é uma linha "Cupom de desconto"
 * que diz quantos cupons estão disponíveis; aberto, o campo do código com
 * "Aplicar" e os cupons da vitrine para um toque. Aplicado, vira um canhoto:
 * verde com o valor descontado, laranja quando ainda falta uma condição (o
 * mínimo, por exemplo) e com o motivo quando o código deixou de valer.
 */

type Props = {
  avaliacao: Avaliacao | null;
  ctx: Omit<ContextoCupom, 'agora'>;
  className?: string;
};

export function CampoCupom({ avaliacao, ctx, className = '' }: Props) {
  const codigo = useCupom((s) => (s.hidratado ? s.codigo : null));
  const aplicar = useCupom((s) => s.aplicar);
  const remover = useCupom((s) => s.remover);
  const agora = useAgora();
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const campo = useRef<HTMLInputElement>(null);
  const disponiveis = cuponsNaVitrine(agora);

  function tentar(c: string) {
    const av = avaliarCupom(c, { ...ctx, agora: agora ?? new Date() });
    if (av.status === 'invalido') {
      setErro(av.motivo);
      return;
    }
    aplicar(c);
    setAberto(false);
    setTexto('');
    setErro(null);
  }

  if (codigo && avaliacao) {
    const valido = avaliacao.status === 'valido';
    return (
      <section aria-label="Cupom de desconto" className={`mx-4 ${className}`}>
        <div
          className={`flex items-center gap-3 rounded-[20px] border border-dashed py-3 pl-3 pr-1.5 ${
            valido ? 'border-verde/45 bg-verde-suave' : 'border-fogo/50 bg-fogo-suave'
          }`}
        >
          <span className={`grid size-11 shrink-0 place-items-center rounded-[14px] ${valido ? 'bg-verde text-white' : 'bg-fogo text-carvao'}`}>
            {valido ? <Check className="size-5" strokeWidth={3} aria-hidden /> : <Ticket className="size-5" aria-hidden />}
          </span>
          <div className="min-w-0 flex-1" role="status">
            <p className="flex items-baseline gap-2">
              <span className="text-[14px] font-extrabold tracking-[0.06em] text-texto">{codigo}</span>
              {valido && <span className="text-[14px] font-extrabold tabular-nums text-verde">−{formatBRL(avaliacao.descontoCents)}</span>}
            </p>
            <p className={`mt-0.5 text-[12.5px] leading-snug ${valido ? 'text-texto-2' : 'font-semibold text-fogo-texto'}`}>
              {avaliacao.status === 'invalido' ? avaliacao.motivo : avaliacao.status === 'pendente' ? avaliacao.motivo : avaliacao.cupom.titulo}
            </p>
          </div>
          <button type="button" onClick={remover} aria-label={`Remover o cupom ${codigo}`} className="grid size-11 shrink-0 place-items-center rounded-full text-texto-2 hover:bg-black/5">
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </section>
    );
  }

  if (!aberto) {
    return (
      <section aria-label="Cupom de desconto" className={`mx-4 ${className}`}>
        <button
          type="button"
          onClick={() => {
            flushSync(() => setAberto(true));
            campo.current?.focus();
          }}
          className="flex w-full items-center gap-3 rounded-[20px] bg-fundo-2 p-3 text-left active:brightness-95"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-cartao text-fogo-texto shadow-[0_0_0_1px_var(--color-borda)]">
            <Ticket className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold text-texto">Cupom de desconto</span>
            <span className="block text-[12.5px] text-texto-2">
              {disponiveis.length > 0
                ? `${disponiveis.length} ${disponiveis.length === 1 ? 'cupom disponível' : 'cupons disponíveis'} para você`
                : 'Tem um código? Aplique aqui'}
            </span>
          </span>
          <span className="pr-1 text-[14px] font-bold text-fogo-texto">Adicionar</span>
        </button>
      </section>
    );
  }

  return (
    <section aria-label="Cupom de desconto" className={`mx-4 rounded-[20px] bg-fundo-2 p-3 ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          tentar(texto);
        }}
        className="flex gap-2"
      >
        <label htmlFor="cupom" className="sr-only">
          Código do cupom
        </label>
        <input
          ref={campo}
          id="cupom"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value.toUpperCase().slice(0, 24));
            setErro(null);
          }}
          placeholder="Código do cupom"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? 'cupom-erro' : undefined}
          className="h-12 min-w-0 flex-1 rounded-[14px] border border-borda bg-cartao px-4 text-[16px] font-bold tracking-[0.06em] text-texto placeholder:font-medium placeholder:tracking-normal placeholder:text-texto-3 focus:border-fogo focus:outline-none aria-[invalid]:border-vermelho"
        />
        <button
          type="submit"
          disabled={!texto.trim()}
          className="h-12 shrink-0 rounded-[14px] bg-carvao px-5 text-[15px] font-bold text-white transition-colors disabled:bg-borda disabled:text-texto-3"
        >
          Aplicar
        </button>
        <button
          type="button"
          onClick={() => {
            setAberto(false);
            setErro(null);
          }}
          aria-label="Fechar o campo do cupom"
          className="grid size-12 shrink-0 place-items-center rounded-[14px] text-texto-2 hover:bg-black/5"
        >
          <X className="size-5" aria-hidden />
        </button>
      </form>
      {erro && (
        <p id="cupom-erro" role="alert" className="mt-2 px-1 text-[13px] font-semibold text-vermelho">
          {erro}
        </p>
      )}
      {disponiveis.length > 0 && (
        <div className="mt-3 px-1">
          <p className="text-[12.5px] font-semibold text-texto-2">Disponíveis para você</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {disponiveis.map((c) => (
              <button
                key={c.codigo}
                type="button"
                onClick={() => tentar(c.codigo)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-dashed border-fogo bg-cartao px-3.5 text-left text-[13px] font-bold text-fogo-texto active:brightness-95"
              >
                <Ticket className="size-4 shrink-0" aria-hidden />
                <span className="tracking-[0.06em]">{c.codigo}</span>
                <span className="font-medium text-texto-2">{c.titulo}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
