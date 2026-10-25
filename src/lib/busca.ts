/**
 * Busca no cardápio, no cliente, sem acento e sem caixa.
 *
 * Todas as palavras digitadas precisam aparecer no nome ou na descrição
 * ("picanha fritas" acha "Tábua de picanha com fritas"). Item esgotado entra
 * no resultado: é melhor ver "esgotado" do que achar que não existe.
 */

import type { MenuCategoria, MenuItem } from '@/types/menu';

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export type ItemIndexado = {
  readonly item: MenuItem;
  readonly categoria: MenuCategoria;
  /** nome + descrição já normalizados, para comparar sem refazer a conta */
  readonly chave: string;
};

export function indexar(menu: readonly MenuCategoria[]): readonly ItemIndexado[] {
  return menu.flatMap((categoria) =>
    categoria.items.map((item) => ({
      item,
      categoria,
      chave: normalizar(`${item.nome} ${item.descricao ?? ''} ${categoria.nome}`),
    })),
  );
}

export function buscar(indice: readonly ItemIndexado[], termo: string): readonly ItemIndexado[] {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return [];
  return indice.filter((e) => palavras.every((p) => e.chave.includes(p)));
}
