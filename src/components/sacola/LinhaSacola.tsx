'use client';

import Link from 'next/link';
import { Stepper } from '@/components/ui/Stepper';
import { useCarrinho } from '@/store/cart';
import { formatBRL } from '@/lib/money';
import { precoLinha, type LinhaCarrinho } from '@/types/carrinho';

/**
 * Uma linha da sacola, como no iFood: nome, opções discriminadas, preço da
 * linha, e o seletor com a lixeira quando está em 1. As opções aparecem com o
 * mesmo detalhamento que vai na mensagem do WhatsApp.
 */
export function LinhaSacola({ linha }: { linha: LinhaCarrinho }) {
  const alterar = useCarrinho((s) => s.alterarQuantidade);
  const remover = useCarrinho((s) => s.remover);

  const inclusos = linha.opcoes.filter((o) => o.precoCents === 0);
  const pagos = linha.opcoes.filter((o) => o.precoCents > 0);

  return (
    <li className="border-b border-divisor py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-item font-semibold leading-tight text-texto">{linha.nome}</p>
          {(inclusos.length > 0 || pagos.length > 0 || linha.observacao) && (
            <ul className="mt-1 space-y-0.5 text-[13px] leading-snug text-texto-2">
              {inclusos.map((o) => (
                <li key={`${o.grupoId}-${o.opcaoId}`}>
                  {o.grupoNome}: {o.nome}
                </li>
              ))}
              {pagos.map((o) => (
                <li key={`${o.grupoId}-${o.opcaoId}`}>
                  + {o.nome} ({formatBRL(o.precoCents)})
                </li>
              ))}
              {linha.observacao && <li className="italic">Obs: {linha.observacao}</li>}
            </ul>
          )}
        </div>
        <span className="shrink-0 text-[15px] font-extrabold tabular-nums text-texto">{formatBRL(precoLinha(linha))}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <Link href={`/item?id=${encodeURIComponent(linha.itemId)}`} className="text-[13px] font-semibold text-fogo-texto">
          Editar
        </Link>
        <Stepper
          compacto
          valor={linha.quantidade}
          aoMudar={(q) => alterar(linha.uid, q)}
          aoRemover={() => remover(linha.uid)}
          rotulo={linha.nome}
        />
      </div>
    </li>
  );
}
