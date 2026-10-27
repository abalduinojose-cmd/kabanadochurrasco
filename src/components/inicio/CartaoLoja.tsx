import { ChevronRight, MapPin, Star, Store } from 'lucide-react';
import { LogoKabana } from '@/components/layout/LogoKabana';
import { StatusLoja } from '@/components/layout/StatusLoja';
import { AbrirDetalhes } from './DetalhesLoja';
import { LOJA } from '@/data/loja';
import { formatBRL, toCents } from '@/lib/money';
import { FAIXA_ENTREGA_CURTA } from '@/lib/delivery';

/**
 * A fachada da loja, no carvão logo abaixo das fotos: o logo oficial grande no
 * centro (sobe por cima do fim das fotos), o status e a nota do Google em
 * pílulas, o painel com o que importa antes de pedir (tempo, taxa a partir de,
 * pedido mínimo) e o atalho para endereço, horários e avaliações (a nota
 * também abre a folha da loja). O cardápio entra por baixo, numa folha clara
 * de cantos redondos que cobre o pé da fachada. Como receber se escolhe no
 * fim, na sacola.
 */

const menorTaxa = Math.min(...LOJA.fretes.map((f) => toCents(f.taxa)));
const nota = LOJA.nota;

function Numero({ valor, rotulo }: { valor: React.ReactNode; rotulo: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5 px-1 text-center">
      <dt className="text-[11.5px] font-medium text-white/55">{rotulo}</dt>
      <dd className="order-first truncate text-[15px] font-extrabold tabular-nums tracking-[-0.01em] text-white">{valor}</dd>
    </div>
  );
}

export function CartaoLoja() {
  return (
    <section
      aria-label="A loja"
      className="relative -mt-[146px] bg-[linear-gradient(to_bottom,transparent_146px,var(--color-brasa)_146px)] px-4 pb-10 text-center text-white"
    >
      <h1 className="relative mx-auto w-[180px]">
        <LogoKabana prioridade sizes="180px" className="w-full drop-shadow-[0_18px_26px_rgba(0,0,0,0.6)]" alt={`${LOJA.nome}, ${LOJA.tagline.toLowerCase()}`} />
      </h1>

      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
        <StatusLoja escuro />
        {nota && (
          <AbrirDetalhes
            rotulo={`Nota ${nota.valor.toFixed(1).replace('.', ',')} no Google, ${nota.total} avaliações. Ver avaliações`}
            className="inline-flex h-7 min-h-7 items-center gap-1 rounded-full bg-white/10 px-2.5 text-[13px] font-bold text-white active:bg-white/15"
          >
            <Star className="size-3.5 fill-[#F5A623] text-[#F5A623]" aria-hidden />
            {nota.valor.toFixed(1).replace('.', ',')}
            <span className="font-medium text-white/60">({nota.total})</span>
          </AbrirDetalhes>
        )}
      </div>

      <dl className="mx-auto mt-4 grid max-w-md grid-cols-3 divide-x divide-white/10 rounded-[20px] bg-white/[0.06] py-3 ring-1 ring-inset ring-white/10">
        <Numero valor={FAIXA_ENTREGA_CURTA} rotulo="entrega" />
        <Numero valor={<span className="text-[#6fe0a0]">{formatBRL(menorTaxa)}</span>} rotulo="taxa a partir de" />
        <Numero valor={LOJA.pedidoMinimo > 0 ? formatBRL(toCents(LOJA.pedidoMinimo)) : 'Sem mínimo'} rotulo="pedido mínimo" />
      </dl>

      {LOJA.retiradaNoLocal && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] text-white/60">
          <Store className="size-3.5" aria-hidden />
          Retirada grátis na loja • {LOJA.pagamentos.length > 2 ? 'dinheiro, Pix e cartão' : LOJA.pagamentos.map((p) => p.label).join(', ')}
        </p>
      )}

      <AbrirDetalhes
        rotulo="Ver endereço, horários e avaliações da loja"
        className="mx-auto mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-white/80 active:bg-white/10"
      >
        <MapPin className="size-4 text-fogo" aria-hidden />
        Posse, {LOJA.cidade}
        <span aria-hidden className="text-white/30">•</span>
        <span className="text-[#ff9a52]">Endereço e horários</span>
        <ChevronRight className="-ml-0.5 size-4 text-[#ff9a52]" aria-hidden />
      </AbrirDetalhes>
    </section>
  );
}
