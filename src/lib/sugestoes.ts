/**
 * "Peça também" e "Complete seu pedido": itens que combinam com o que a pessoa
 * está vendo ou já tem na sacola. Regra simples e honesta: oferecer primeiro
 * as categorias que ainda não estão no pedido (bebida sem álcool para quem só
 * tem comida, sobremesa para quem já tem bebida), sem nada inventado, e os
 * itens com foto antes dos sem foto. Os ids são os do menu.ts real; categoria
 * que não existir no cardápio só é pulada.
 */

import { MENU } from '@/data/cardapio';
import { fotoDoItem } from '@/data/fotos';
import type { MenuItem } from '@/types/menu';

export type Sugestao = { readonly item: MenuItem; readonly categoriaId: string };

const COMPLEMENTOS: readonly string[] = ['nao-alcoolicos', 'sobremesas', 'guarnicoes'];

export function sugestoesPara(
  categoriasPresentes: readonly string[],
  excluirItens: readonly string[],
  limite = 6,
): readonly Sugestao[] {
  const presentes = new Set(categoriasPresentes);
  const ordem = [...COMPLEMENTOS.filter((c) => !presentes.has(c)), ...COMPLEMENTOS.filter((c) => presentes.has(c))];
  const candidatos: Sugestao[] = [];
  const vistos = new Set(excluirItens);

  for (const categoriaId of ordem) {
    const categoria = MENU.find((c) => c.id === categoriaId);
    if (!categoria) continue;
    for (const item of categoria.items) {
      if (!item.available || vistos.has(item.id)) continue;
      vistos.add(item.id);
      candidatos.push({ item, categoriaId });
    }
  }

  // Com foto primeiro, mantendo a ordem das categorias dentro de cada grupo.
  const comFoto = candidatos.filter((s) => fotoDoItem(s.item.id, s.item.imageUrl));
  const semFoto = candidatos.filter((s) => !fotoDoItem(s.item.id, s.item.imageUrl));
  return [...comFoto, ...semFoto].slice(0, limite);
}
