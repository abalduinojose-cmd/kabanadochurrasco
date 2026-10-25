'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useCarrinho } from '@/store/cart';
import { toCents } from '@/lib/money';
import { adicionarComToque } from '@/lib/motion/toque';
import { acharItem, ehAlcoolico, ehDireto, escolhasIniciais, gruposDoItem } from '@/lib/opcoes';

/**
 * O [+] de adicionar com um toque, como no Rappi e nas lojas do iFood.
 * Item sem grupo obrigatório entra na sacola na hora, com o contador do
 * quanto já tem; item que exige escolha (ponto, bebida do combo) leva à
 * página do item. Fica por cima do link da linha ou do card (z-10).
 */

type Props = { itemId: string; tamanho?: 'sm' | 'md'; className?: string };

export function BotaoMais({ itemId, tamanho = 'md', className = '' }: Props) {
  const achado = acharItem(itemId);
  const adicionar = useCarrinho((s) => s.adicionar);
  const quantidade = useCarrinho((s) => s.linhas.reduce((t, l) => (l.itemId === itemId ? t + l.quantidade : t), 0));
  const mostrar = useToast((s) => s.mostrar);

  if (!achado || !achado.item.available) return null;
  const { item, categoria } = achado;
  const direto = ehDireto(item, categoria.id);

  // Sem `relative` aqui: quem chama decide a posição (`absolute ...`), e o
  // contador se ancora no próprio botão, que já é posicionado por isso.
  const classes = `z-10 grid ${
    tamanho === 'sm' ? 'size-9' : 'size-11'
  } min-h-0 place-items-center rounded-full bg-fogo text-carvao shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:brightness-95 active:brightness-90 ${className || 'relative'}`;
  const icone = <Plus className={tamanho === 'sm' ? 'size-[18px]' : 'size-5'} strokeWidth={2.75} aria-hidden />;
  const contador = quantidade > 0 && (
    <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-carvao px-1 text-[10px] font-extrabold tabular-nums text-fogo">
      {quantidade}
    </span>
  );

  if (!direto) {
    return (
      <Link href={`/item?id=${encodeURIComponent(item.id)}`} aria-label={`Escolher opções de ${item.nome}`} className={classes}>
        {icone}
        {contador}
      </Link>
    );
  }

  async function aoTocar(e: React.MouseEvent<HTMLButtonElement>) {
    const botao = e.currentTarget;
    adicionar({
      itemId: item.id,
      categoriaId: categoria.id,
      nome: item.nome,
      precoBaseCents: toCents(item.preco),
      quantidade: 1,
      opcoes: escolhasIniciais(gruposDoItem(item, categoria.id)),
      alcoolico: ehAlcoolico(item),
    });
    mostrar('Adicionado à sacola');
    await adicionarComToque(botao);
  }

  return (
    <button type="button" onClick={(e) => void aoTocar(e)} aria-label={`Adicionar ${item.nome}`} className={classes}>
      {icone}
      {contador}
    </button>
  );
}
