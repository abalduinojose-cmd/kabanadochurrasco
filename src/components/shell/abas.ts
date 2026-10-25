/**
 * As quatro abas do app. Módulo puro, sem React: a direção da transição é
 * derivada daqui e testada sem navegador.
 */

export type HrefAba = '/' | '/busca' | '/pedidos' | '/perfil';

/** As quatro abas do iFood, no que faz sentido para uma loja só. */
export const ABAS: readonly { href: HrefAba; rotulo: string }[] = [
  { href: '/', rotulo: 'Início' },
  { href: '/busca', rotulo: 'Busca' },
  { href: '/pedidos', rotulo: 'Pedidos' },
  { href: '/perfil', rotulo: 'Perfil' },
];

/** Índice da aba para um caminho; -1 fora das abas (carrinho, checkout). */
export function indiceDaAba(pathname: string): number {
  const limpo = pathname.replace(/\/+$/, '') || '/';
  return ABAS.findIndex((a) => a.href === limpo);
}

/**
 * Direção da troca: ir para uma aba à direita faz tudo andar para a esquerda
 * ("dir" = destino à direita). Sem direção quando não há movimento a fazer.
 */
export function direcaoDaAba(de: number, para: number): 'dir' | 'esq' | null {
  if (de < 0 || para < 0 || de === para) return null;
  return para > de ? 'dir' : 'esq';
}
