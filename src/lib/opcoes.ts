/**
 * Resolução dos grupos de opção de um item.
 *
 * Junta os grupos que vêm do cardápio com os que o app acrescenta
 * (`grupos-extra.ts`), aplica o ponto da carne a quem tem direito e devolve
 * uma lista pronta para a tela. Componente não decide regra: só desenha.
 */

import { MENU, OPTION_GROUPS, EXCLUIDOS_DO_DELIVERY } from '@/data/cardapio';
import {
  GRUPOS_EXTRA,
  PONTO_DA_CARNE,
  CATEGORIAS_COM_PONTO,
  ITENS_COM_PONTO,
} from '@/data/grupos-extra';
import { toCents, type Cents } from './money';
import type { MenuCategoria, MenuItem, OptionGroup } from '@/types/menu';
import type { OpcaoEscolhida } from '@/types/carrinho';

const TODOS_OS_GRUPOS: readonly OptionGroup[] = [...OPTION_GROUPS, ...GRUPOS_EXTRA];

const POR_ID = new Map(TODOS_OS_GRUPOS.map((g) => [g.id, g]));

/** Item + a categoria em que ele vive, indexado por id. */
export type ItemComCategoria = { item: MenuItem; categoria: MenuCategoria };

const INDICE: ReadonlyMap<string, ItemComCategoria> = new Map(
  MENU.flatMap((categoria) =>
    categoria.items.map((item) => [item.id, { item, categoria }] as const),
  ),
);

export function acharItem(id: string): ItemComCategoria | undefined {
  return INDICE.get(id);
}

export function itemSaiParaEntrega(id: string): boolean {
  return !EXCLUIDOS_DO_DELIVERY.includes(id);
}

/** O item recebe o seletor de ponto da carne? */
export function pedePonto(item: MenuItem, categoriaId: string): boolean {
  return CATEGORIAS_COM_PONTO.includes(categoriaId) || ITENS_COM_PONTO.includes(item.id);
}

/**
 * Grupos que a tela do item deve mostrar, na ordem: ponto da carne primeiro
 * (é o obrigatório), depois os do cardápio.
 */
export function gruposDoItem(item: MenuItem, categoriaId: string): readonly OptionGroup[] {
  const doCardapio = (item.optionGroups ?? [])
    .map((id) => POR_ID.get(id))
    .filter((g): g is OptionGroup => g !== undefined);

  return pedePonto(item, categoriaId) ? [PONTO_DA_CARNE, ...doCardapio] : doCardapio;
}

/** Escolhas iniciais: o padrão de cada grupo de escolha única já vem marcado. */
export function escolhasIniciais(grupos: readonly OptionGroup[]): OpcaoEscolhida[] {
  const iniciais: OpcaoEscolhida[] = [];
  for (const g of grupos) {
    if (g.type !== 'single') continue;
    const padrao = g.padrao ?? (g.required ? g.options[0]?.id : undefined);
    if (!padrao) continue;
    const op = g.options.find((o) => o.id === padrao);
    if (!op) continue;
    iniciais.push({
      grupoId: g.id,
      grupoNome: g.nome,
      opcaoId: op.id,
      nome: op.nome,
      precoCents: toCents(op.preco),
    });
  }
  return iniciais;
}

/** Falta escolher algum grupo obrigatório? Devolve os nomes que faltam. */
export function obrigatoriosFaltando(
  grupos: readonly OptionGroup[],
  escolhas: readonly OpcaoEscolhida[],
): readonly string[] {
  return grupos
    .filter((g) => g.required && !escolhas.some((e) => e.grupoId === g.id))
    .map((g) => g.nome);
}

/** Preço de uma unidade com as opções marcadas. */
export function precoComOpcoes(item: MenuItem, escolhas: readonly OpcaoEscolhida[]): Cents {
  return toCents(item.preco) + escolhas.reduce((s, e) => s + e.precoCents, 0);
}

export function ehAlcoolico(item: MenuItem): boolean {
  return item.badges?.includes('alcoolico') === true;
}

/** Entra na sacola com um toque: nenhum grupo obrigatório para decidir. */
export function ehDireto(item: MenuItem, categoriaId: string): boolean {
  return gruposDoItem(item, categoriaId).every((g) => !g.required);
}

/** "A partir de": algum grupo obrigatório tem opção que muda o preço. */
export function precoVaria(item: MenuItem, categoriaId: string): boolean {
  return gruposDoItem(item, categoriaId).some((g) => g.required && g.options.some((o) => o.preco > 0));
}
