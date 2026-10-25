import { formatBRL, type Cents } from '@/lib/money';
import { precoLinha, type LinhaCarrinho } from '@/types/carrinho';
import type { ModoEntrega } from '@/lib/delivery';

/**
 * A revisão final, como o resumo do iFood. O mesmo detalhamento que sai na
 * mensagem sai aqui, na mesma ordem, para conferir contra o que o atendente
 * vai ler.
 */

type Props = {
  linhas: readonly LinhaCarrinho[];
  subtotal: Cents;
  taxa: Cents;
  total: Cents;
  modo: ModoEntrega;
  bairro: string | null;
  titulo?: string;
};

export function OrderReview({ linhas, subtotal, taxa, total, modo, bairro, titulo = 'Resumo do pedido' }: Props) {
  return (
    <section className="px-4 pt-4" aria-label={titulo}>
      <h2 className="text-[15px] font-bold text-texto">{titulo}</h2>

      <ul className="mt-3 divide-y divide-divisor">
        {linhas.map((l) => (
          <li key={l.uid} className="py-2.5 first:pt-0">
            <div className="flex items-start justify-between gap-3 text-[14px]">
              <span className="text-texto">
                <span className="font-semibold">{l.quantidade}x</span> {l.nome}
              </span>
              <span className="shrink-0 tabular-nums text-texto">{formatBRL(precoLinha(l))}</span>
            </div>
            {(l.opcoes.length > 0 || l.observacao) && (
              <ul className="mt-0.5 text-[12px] leading-snug text-texto-2">
                {l.opcoes.map((o) => (
                  <li key={`${o.grupoId}-${o.opcaoId}`}>
                    {o.precoCents > 0 ? `+ ${o.nome} (${formatBRL(o.precoCents)})` : `${o.grupoNome}: ${o.nome}`}
                  </li>
                ))}
                {l.observacao && <li className="italic">Obs: {l.observacao}</li>}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <dl className="mt-3 space-y-2 border-t border-divisor pt-3 text-[14px]">
        <div className="flex justify-between">
          <dt className="text-texto-2">Subtotal</dt>
          <dd className="tabular-nums text-texto">{formatBRL(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-texto-2">{modo === 'retirada' ? 'Retirada no local' : `Taxa de entrega${bairro ? `, ${bairro}` : ''}`}</dt>
          <dd className={taxa === 0 ? 'font-semibold text-verde' : 'tabular-nums text-texto'}>{taxa === 0 ? 'Grátis' : formatBRL(taxa)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-divisor pt-2 text-[15px] font-extrabold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatBRL(total)}</dd>
        </div>
      </dl>
    </section>
  );
}
