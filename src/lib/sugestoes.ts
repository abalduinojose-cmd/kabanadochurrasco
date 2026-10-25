/**
 * "Peça também" e "Complete seu pedido": itens que combinam com o que a pessoa
 * está vendo ou já tem na sacola. Regra simples e honesta: oferecer primeiro
 * as categorias que ainda não estão no pedido (bebida para quem só tem
 * espeto, guarnição para quem já tem bebida), sem nada inventado. Os ids são
 * os do menu.ts real (bebida sem álcool primeiro, nunca a cerveja).
 * Categoria que não existir no cardápio real só é pulada.
 */

import { MENU } from '@/data/cardapio';
import type { MenuItem } from '@/types/menu';

export type Sugestao = { readonly item: MenuItem; readonly categoriaId: string };

const COMPLEMENTOS: readonly string[] = ['nao-alcoolicos', 'guarnicoes', 'sobremesas'];

export function sugestoesPara(
  categoriasPresentes: readonly string[],
  excluirItens: readonly string[],
  limite = 6,
): readonly Sugestao[] {
  const presentes = new Set(categoriasPresentes);
  const ordem = [...COMPLEMENTOS.filter((c) => !presentes.has(c)), ...COMPLEMENTOS];
  const vistos = new Set(excluirItens);
  const saida: Sugestao[] = [];

  for (const categoriaId of ordem) {
    const categoria = MENU.find((c) => c.id === categoriaId);
    if (!categoria) continue;
    for (const item of categoria.items) {
      if (!item.available || vistos.has(item.id)) continue;
      vistos.add(item.id);
      saida.push({ item, categoriaId });
      if (saida.length >= limite) return saida;
    }
  }
  return saida;
}
