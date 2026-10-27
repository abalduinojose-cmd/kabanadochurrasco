'use client';

import { BellRing, ReceiptText, Send, UtensilsCrossed, X } from 'lucide-react';
import { FotoProduto } from '@/components/inicio/FotoProduto';
import { Stepper } from '@/components/ui/Stepper';
import { useComanda, selContaMesa, selItensComanda, selTotalComanda } from '@/store/comanda';
import { fotoDoItem } from '@/data/fotos';
import { formatBRL } from '@/lib/money';
import { iconeDaCategoria } from '@/lib/icones-categoria';
import { rotuloMesa } from '@/lib/mensagem-mesa';
import { precoLinha, type LinhaCarrinho } from '@/types/carrinho';

/**
 * O pedido da mesa, sempre à vista no tablet deitado (à direita) e numa
 * gaveta no tablet em pé: os itens com miniatura e seletor, o nome de quem
 * pede (opcional), o total e "Enviar pedido". Embaixo, a conta da mesa (os
 * pedidos já enviados) com "Pedir a conta" e "Chamar garçom".
 */

type Props = {
  nome: string;
  aoMudarNome: (nome: string) => void;
  aoEnviar: () => void;
  aoChamarGarcom: () => void;
  aoPedirConta: () => void;
  /** Na gaveta (tablet em pé), o X de fechar fica no cabeçalho, ao lado da contagem. */
  aoFechar?: () => void;
};

function LinhaComanda({ linha }: { linha: LinhaCarrinho }) {
  const alterar = useComanda((s) => s.alterarQuantidade);
  const remover = useComanda((s) => s.remover);
  const detalhes = [
    ...linha.opcoes.filter((o) => o.precoCents === 0).map((o) => `${o.grupoNome}: ${o.nome}`),
    ...linha.opcoes.filter((o) => o.precoCents > 0).map((o) => `+ ${o.nome}`),
    ...(linha.observacao ? [`Obs: ${linha.observacao}`] : []),
  ];
  return (
    <li className="flex gap-3 py-3.5">
      <FotoProduto src={fotoDoItem(linha.itemId)} alt="" sizes="64px" className="size-16 rounded-[14px]" respiro="p-1.5" icone={iconeDaCategoria(linha.categoriaId)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[15px] font-bold leading-tight text-texto">{linha.nome}</p>
          <span className="shrink-0 text-[15px] font-extrabold tabular-nums text-texto">{formatBRL(precoLinha(linha))}</span>
        </div>
        {detalhes.length > 0 && <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-texto-2">{detalhes.join(' • ')}</p>}
        <div className="mt-2 flex justify-end">
          <Stepper compacto valor={linha.quantidade} aoMudar={(q) => alterar(linha.uid, q)} aoRemover={() => remover(linha.uid)} rotulo={linha.nome} />
        </div>
      </div>
    </li>
  );
}

export function PedidoMesa({ nome, aoMudarNome, aoEnviar, aoChamarGarcom, aoPedirConta, aoFechar }: Props) {
  const mesa = useComanda((s) => s.mesa) ?? '';
  const linhas = useComanda((s) => s.linhas);
  const enviados = useComanda((s) => s.enviados);
  const total = useComanda(selTotalComanda);
  const itens = useComanda(selItensComanda);
  const conta = useComanda(selContaMesa);

  return (
    <div data-alvo-pedido className="flex h-full min-h-0 flex-col bg-cartao">
      <header className="flex items-center justify-between gap-3 border-b border-divisor px-5 pb-4 pt-5">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-fogo-texto">{rotuloMesa(mesa)}</p>
          <h2 className="text-[21px] font-extrabold leading-tight tracking-[-0.02em] text-texto">Seu pedido</h2>
        </div>
        <div className="flex items-center gap-2">
          {itens > 0 && (
            <span className="rounded-full bg-fundo-2 px-3 py-1.5 text-[13px] font-bold tabular-nums text-texto">
              {itens} {itens === 1 ? 'item' : 'itens'}
            </span>
          )}
          {aoFechar && (
            <button type="button" onClick={aoFechar} aria-label="Fechar o pedido" className="-mr-1.5 grid size-11 place-items-center rounded-full bg-fundo-2 text-texto">
              <X className="size-5" aria-hidden />
            </button>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
        {linhas.length === 0 ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center py-10 text-center">
            <span className="grid size-20 place-items-center rounded-full bg-fogo-suave">
              <UtensilsCrossed className="size-9 text-fogo-texto" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="mt-4 text-[17px] font-extrabold text-texto">Seu pedido aparece aqui</p>
            <p className="mt-1 max-w-[26ch] text-[14px] leading-snug text-texto-2">Toque em um prato para ver a foto, escolher e adicionar.</p>
          </div>
        ) : (
          <ul className="divide-y divide-divisor">
            {linhas.map((l) => (
              <LinhaComanda key={l.uid} linha={l} />
            ))}
          </ul>
        )}
      </div>

      <div className="pb-seguro border-t border-divisor bg-cartao px-5 pt-4">
        {linhas.length > 0 && (
          <>
            <label className="block">
              <span className="text-[12.5px] font-semibold text-texto-2">Seu nome (opcional)</span>
              <input
                value={nome}
                onChange={(e) => aoMudarNome(e.target.value.slice(0, 30))}
                placeholder="Para o garçom saber de quem é"
                autoComplete="off"
                className="mt-1 h-12 w-full rounded-[14px] border border-borda bg-fundo-2 px-4 text-[16px] text-texto placeholder:text-texto-3 focus:border-fogo focus:bg-cartao focus:outline-none"
              />
            </label>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-[14px] font-semibold text-texto-2">Total deste pedido</span>
              <span className="text-[24px] font-extrabold tabular-nums tracking-[-0.02em] text-texto">{formatBRL(total)}</span>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={aoEnviar}
          disabled={linhas.length === 0}
          className="mt-3 flex h-15 w-full items-center justify-center gap-2.5 rounded-[18px] bg-fogo py-4 text-[17px] font-extrabold text-carvao shadow-[0_14px_30px_-16px_rgba(255,106,0,0.95)] transition-transform duration-150 active:scale-[0.99] disabled:bg-fundo-2 disabled:text-texto-3 disabled:shadow-none"
        >
          <Send className="size-5" strokeWidth={2.5} aria-hidden />
          Enviar pedido
        </button>

        <div className="mt-3 flex items-center gap-2 pb-4">
          <button
            type="button"
            onClick={aoChamarGarcom}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] bg-fundo-2 text-[14px] font-bold text-texto active:brightness-95"
          >
            <BellRing className="size-[18px]" aria-hidden />
            Chamar garçom
          </button>
          <button
            type="button"
            onClick={aoPedirConta}
            disabled={enviados.length === 0}
            className="flex h-12 flex-1 flex-col items-center justify-center rounded-[14px] bg-fundo-2 leading-tight text-texto active:brightness-95 disabled:text-texto-3"
          >
            <span className="inline-flex items-center gap-1.5 text-[14px] font-bold">
              <ReceiptText className="size-[18px]" aria-hidden />
              Pedir a conta
            </span>
            {enviados.length > 0 && <span className="text-[11.5px] font-semibold tabular-nums text-texto-2">{formatBRL(conta)} na mesa</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
