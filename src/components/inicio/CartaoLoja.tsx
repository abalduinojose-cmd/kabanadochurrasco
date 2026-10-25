import { ChevronRight, Star, Store } from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { StatusLoja } from '@/components/layout/StatusLoja';
import { Badge } from '@/components/ui/Badge';
import { AbrirDetalhes } from './DetalhesLoja';
import { LOJA } from '@/data/loja';
import { formatBRL, toCents } from '@/lib/money';
import { FAIXA_ENTREGA_CURTA } from '@/lib/delivery';

/**
 * O cartão da loja, flutuando sobre a capa: o logo salta para fora do cartão,
 * nome e bairro, status e a nota do Google em pílulas (a nota e "Detalhes"
 * abrem a folha da loja) e a faixa com o que importa antes de pedir: tempo, taxa a partir de
 * e pedido mínimo. Como receber se escolhe no fim, na sacola.
 */

const menorTaxa = Math.min(...LOJA.fretes.map((f) => toCents(f.taxa)));
const nota = LOJA.nota;

function Numero({ valor, rotulo }: { valor: React.ReactNode; rotulo: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5 px-1 text-center">
      <dt className="text-[11.5px] font-medium text-texto-2">{rotulo}</dt>
      <dd className="order-first truncate text-[15px] font-extrabold tabular-nums tracking-[-0.01em] text-texto">{valor}</dd>
    </div>
  );
}

export function CartaoLoja() {
  return (
    <section className="relative z-10 -mt-9 px-3">
      <div className="mx-auto max-w-2xl rounded-[26px] bg-cartao px-4 pb-4 pt-3 shadow-[0_0_0_1px_var(--color-borda),0_18px_40px_-20px_rgba(0,0,0,0.35)]">
        <div className="flex items-start gap-3.5">
          <div className="-mt-9 grid size-[68px] shrink-0 place-items-center overflow-hidden rounded-[22px] bg-carvao shadow-[0_10px_22px_-10px_rgba(0,0,0,0.6)] ring-4 ring-cartao">
            <BrandMark recorte className="w-[54px]" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="text-[21px] font-extrabold leading-tight tracking-[-0.02em] text-texto">{LOJA.nome}</h1>
            <p className="mt-0.5 text-[13px] leading-snug text-texto-2">
              {LOJA.tagline} • Posse, {LOJA.cidade}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusLoja pilula />
          {nota ? (
            <AbrirDetalhes
              rotulo={`Nota ${nota.valor.toFixed(1).replace('.', ',')} no Google, ${nota.total} avaliações. Ver avaliações`}
              className="inline-flex h-7 min-h-7 items-center gap-1 rounded-full bg-[#fff6e5] px-2.5 text-[13px] font-bold text-texto active:brightness-95"
            >
              <Star className="size-3.5 fill-[#F5A623] text-[#F5A623]" aria-hidden />
              {nota.valor.toFixed(1).replace('.', ',')}
              <span className="font-medium text-texto-2">({nota.total})</span>
            </AbrirDetalhes>
          ) : (
            <Badge tom="fogo">Novo no app</Badge>
          )}
          <AbrirDetalhes
            rotulo="Ver detalhes da loja"
            className="-mr-1 ml-auto inline-flex min-h-10 items-center gap-0.5 rounded-full pl-2 pr-1 text-[13px] font-bold text-fogo-texto active:bg-fogo-suave"
          >
            Detalhes
            <ChevronRight className="size-4" aria-hidden />
          </AbrirDetalhes>
        </div>

        <dl className="mt-3.5 grid grid-cols-3 divide-x divide-borda rounded-[18px] bg-fundo-2 py-3">
          <Numero valor={FAIXA_ENTREGA_CURTA} rotulo="entrega" />
          <Numero valor={<span className="text-verde">{formatBRL(menorTaxa)}</span>} rotulo="taxa a partir de" />
          <Numero valor={LOJA.pedidoMinimo > 0 ? formatBRL(toCents(LOJA.pedidoMinimo)) : 'Sem mínimo'} rotulo="pedido mínimo" />
        </dl>

        {LOJA.retiradaNoLocal && (
          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[12.5px] text-texto-2">
            <Store className="size-3.5" aria-hidden />
            Retirada grátis na loja • {LOJA.pagamentos.length > 2 ? 'dinheiro, Pix e cartão' : LOJA.pagamentos.map((p) => p.label).join(', ')}
          </p>
        )}
      </div>
    </section>
  );
}
