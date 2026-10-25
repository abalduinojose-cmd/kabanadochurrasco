'use client';

import Link from 'next/link';
import { FotoProduto } from '@/components/inicio/FotoProduto';
import { Stepper } from '@/components/ui/Stepper';
import { useCarrinho } from '@/store/cart';
import { fotoDoItem } from '@/data/fotos';
import { formatBRL } from '@/lib/money';
import { precoLinha, type LinhaCarrinho } from '@/types/carrinho';

/**
 * Um item da sacola: miniatura (foto, produto ou a marca), nome, as opções
 * com o mesmo detalhamento da mensagem do WhatsApp, "Editar", o preço da
 * linha e o seletor em pílula, com a lixeira quando está em 1.
 */
export function LinhaSacola({ linha }: { linha: LinhaCarrinho }) {
  const alterar = useCarrinho((s) => s.alterarQuantidade);
  const remover = useCarrinho((s) => s.remover);

  const inclusos = linha.opcoes.filter((o) => o.precoCents === 0);
  const pagos = linha.opcoes.filter((o) => o.precoCents > 0);
  const detalhes = inclusos.length > 0 || pagos.length > 0 || Boolean(linha.observacao);

  return (
    <li className="flex gap-3.5 py-4">
      <FotoProduto src={fotoDoItem(linha.itemId)} alt="" sizes="72px" className="size-[72px] rounded-[14px]" respiro="p-1.5" />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[15px] font-bold leading-tight text-texto">{linha.nome}</p>
          <span className="shrink-0 text-[15px] font-extrabold tabular-nums text-texto">{formatBRL(precoLinha(linha))}</span>
        </div>
        {detalhes && (
          <ul className="mt-1 space-y-0.5 text-[12.5px] leading-snug text-texto-2">
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
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <Link href={`/item?id=${encodeURIComponent(linha.itemId)}`} className="inline-flex min-h-10 items-center text-[13px] font-bold text-fogo-texto">
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
      </div>
    </li>
  );
}
