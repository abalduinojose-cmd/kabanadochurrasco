'use client';

import { useRouter } from 'next/navigation';
import { Plus, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { usePedidos, selUltimoPedido } from '@/store/pedidos';
import { useCarrinho } from '@/store/cart';
import { formatBRL } from '@/lib/money';
import { adicionarComToque } from '@/lib/motion/toque';
import { acharItem } from '@/lib/opcoes';
import { precoUnitario, type LinhaCarrinho } from '@/types/carrinho';

/**
 * "Peça de novo", como no iFood: os itens do último pedido em cards, cada um
 * volta para a sacola com um toque (com as mesmas opções), e o atalho para
 * repetir o pedido inteiro. Só aparece com a sacola vazia.
 */
export function PecaDeNovo() {
  const router = useRouter();
  const ultimo = usePedidos(selUltimoPedido);
  const hidratado = useCarrinho((s) => s.hidratado);
  const temItens = useCarrinho((s) => s.linhas.length > 0);
  const adicionar = useCarrinho((s) => s.adicionar);
  const restaurar = useCarrinho((s) => s.restaurar);
  const mostrar = useToast((s) => s.mostrar);

  if (!hidratado || !ultimo || temItens) return null;
  const linhas = ultimo.linhas.filter((l) => acharItem(l.itemId)?.item.available);
  if (linhas.length === 0) return null;

  async function deNovo(linha: LinhaCarrinho, botao: HTMLButtonElement) {
    adicionar({
      itemId: linha.itemId,
      categoriaId: linha.categoriaId,
      nome: linha.nome,
      precoBaseCents: linha.precoBaseCents,
      quantidade: 1,
      opcoes: linha.opcoes,
      observacao: linha.observacao,
      alcoolico: linha.alcoolico,
    });
    mostrar('Adicionado à sacola');
    await adicionarComToque(botao);
  }

  return (
    <section className="pt-6">
      <div className="flex items-center justify-between pl-4 pr-2">
        <h2 className="text-secao font-extrabold tracking-[-0.01em]">Peça de novo</h2>
        <button
          type="button"
          onClick={() => {
            restaurar(ultimo.linhas);
            router.push('/sacola');
          }}
          className="inline-flex min-h-11 items-center gap-1.5 px-2 text-[13px] font-bold text-fogo-texto"
        >
          <RotateCcw className="size-4" aria-hidden />
          Repetir pedido
        </button>
      </div>
      <ul className="trilho mt-2 pb-1">
        {linhas.map((l) => (
          <li key={l.uid} className="w-[190px]">
            <button
              type="button"
              onClick={(e) => void deNovo(l, e.currentTarget)}
              className="flex min-h-[76px] w-full items-center gap-3 rounded-cartao border border-borda bg-cartao p-3 text-left active:bg-fundo-2"
            >
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[14px] font-semibold leading-tight text-texto">{l.nome}</span>
                <span className="mt-1 block text-[13px] text-texto-2">
                  {l.quantidade}x da última vez • {formatBRL(precoUnitario(l))}
                </span>
              </span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-fogo-suave text-fogo-texto">
                <Plus className="size-4" strokeWidth={2.75} aria-hidden />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
