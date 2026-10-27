/**
 * O cardápio montado para a tela: as seções de data/secoes.ts com as
 * categorias e os itens reais do menu.ts. Categoria do menu que nenhuma seção
 * cita vai para "Mais itens", para nada sumir.
 */

import { MENU } from '@/data/cardapio';
import { SECOES, type Secao } from '@/data/secoes';
import { fotoDoItem } from '@/data/fotos';
import { toCents, type Cents } from '@/lib/money';
import type { MenuCategoria, MenuItem } from '@/types/menu';

export type BlocoMontado = { readonly categoria: MenuCategoria; readonly titulo: string; readonly cartoes: boolean };
export type SecaoMontada = Omit<Secao, 'categorias'> & {
  readonly blocos: readonly BlocoMontado[];
  readonly total: number;
  /** Menor preço disponível da seção ("a partir de"). */
  readonly aPartirDe: Cents | null;
};

function menorPreco(blocos: readonly BlocoMontado[]): Cents | null {
  const precos = blocos.flatMap((b) => b.categoria.items.filter((i) => i.available).map((i) => toCents(i.preco)));
  return precos.length > 0 ? Math.min(...precos) : null;
}

export function montarCardapio(): readonly SecaoMontada[] {
  const usadas = new Set<string>();
  const secoes: SecaoMontada[] = [];

  for (const s of SECOES) {
    const blocos: BlocoMontado[] = [];
    for (const sub of s.categorias) {
      const categoria = MENU.find((c) => c.id === sub.categoriaId);
      if (!categoria || categoria.items.length === 0) continue;
      usadas.add(categoria.id);
      blocos.push({ categoria, titulo: sub.titulo ?? categoria.nome, cartoes: sub.cartoes === true });
    }
    if (blocos.length === 0) continue;
    secoes.push({
      id: s.id,
      nome: s.nome,
      rotulo: s.rotulo,
      chamada: s.chamada,
      formato: s.formato,
      foto: s.foto,
      destaques: s.destaques,
      blocos,
      total: blocos.reduce((t, b) => t + b.categoria.items.length, 0),
      aPartirDe: menorPreco(blocos),
    });
  }

  const sobras = MENU.filter((c) => !usadas.has(c.id) && c.items.length > 0);
  if (sobras.length > 0) {
    secoes.push({
      id: 'mais-itens',
      nome: 'Mais itens',
      formato: 'lista',
      chamada: '',
      foto: '',
      destaques: false,
      blocos: sobras.map((categoria) => ({ categoria, titulo: categoria.nome, cartoes: false })),
      total: sobras.reduce((t, c) => t + c.items.length, 0),
      aPartirDe: null,
    });
  }
  return secoes;
}

const ehDestaque = (i: MenuItem) => i.available && (i.destaque === true || Boolean(fotoDoItem(i.id, i.imageUrl)));

/** Itens de "Destaques": os pratos com foto das seções marcadas (bebida não entra). */
export function destaquesDoCardapio(): readonly { item: MenuItem; categoriaId: string }[] {
  return montarCardapio()
    .filter((s) => s.destaques)
    .flatMap((s) => s.blocos.flatMap((b) => b.categoria.items.filter(ehDestaque).map((item) => ({ item, categoriaId: b.categoria.id }))));
}

const NOME_DA_SECAO = new Map(SECOES.flatMap((s) => s.categorias.map((c) => [c.categoriaId, s.nome] as const)));

/** Nome da seção (Lanches, Espetinhos...) de uma categoria do menu.ts. */
export function secaoDaCategoria(categoriaId: string): string | undefined {
  return NOME_DA_SECAO.get(categoriaId);
}
