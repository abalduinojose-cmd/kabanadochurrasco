import { Star } from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { StatusLoja } from '@/components/layout/StatusLoja';
import { Badge } from '@/components/ui/Badge';
import { BotaoDetalhes } from './DetalhesLoja';
import { LinhaEntrega } from './LinhaEntrega';
import { SegmentoEntrega } from './SegmentoEntrega';
import { LOJA } from '@/data/loja';
import { formatBRL, toCents } from '@/lib/money';

/**
 * O cartão da loja que sobe por cima da capa, igual ao do iFood: avatar,
 * nome, categoria e cidade, status, a linha "Entrega em {bairro}", pedido
 * mínimo e o segmentado Entrega | Retirada.
 */
export function CartaoLoja() {
  const nota = LOJA.nota;

  return (
    <section className="relative -mt-7 rounded-t-[20px] bg-cartao">
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-cartao bg-carvao shadow-[0_0_0_1px_var(--color-borda)]">
            <BrandMark recorte className="w-[46px]" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold leading-tight tracking-[-0.01em] text-texto">{LOJA.nome}</h1>
            <p className="mt-0.5 truncate text-[13px] text-texto-2">
              {LOJA.tagline} • {LOJA.cidade}
            </p>
          </div>
          <BotaoDetalhes />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-texto-2">
          {nota ? (
            <span className="inline-flex items-center gap-1 font-bold text-texto">
              <Star className="size-4 fill-[#F5A623] text-[#F5A623]" aria-hidden />
              {nota.valor.toFixed(1).replace('.', ',')}
              <span className="font-normal text-texto-2">({nota.total} avaliações)</span>
            </span>
          ) : (
            <Badge tom="fogo">Novo no app</Badge>
          )}
          <span aria-hidden>•</span>
          <StatusLoja />
        </div>

        <div className="mt-3 border-t border-divisor pt-1">
          <LinhaEntrega />
        </div>
        {LOJA.pedidoMinimo > 0 ? (
          <p className="pb-3 text-[13px] text-texto-2">Pedido mínimo {formatBRL(toCents(LOJA.pedidoMinimo))}</p>
        ) : (
          <p className="pb-3 text-[13px] text-texto-2">Sem pedido mínimo</p>
        )}

        <SegmentoEntrega />
      </div>
    </section>
  );
}
