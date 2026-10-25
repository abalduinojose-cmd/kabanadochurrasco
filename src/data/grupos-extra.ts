/**
 * Grupos de opção que o app acrescenta ao cardápio.
 *
 * Ficam aqui, e não dentro do `menu.ts` (gerado do instadelivery), pelo mesmo
 * motivo das fotos: o arquivo gerado é regenerável. `lib/opcoes.ts` junta os
 * dois na leitura, então para o resto do app é como se fosse um só.
 */

import type { OptionGroup } from '@/types/menu';

export const PONTO_DA_CARNE: OptionGroup = {
  id: 'pontoDaCarne',
  nome: 'Ponto da carne',
  type: 'single',
  required: true,
  padrao: 'ao-ponto',
  options: [
    { id: 'mal-passado', nome: 'Mal passado', preco: 0 },
    { id: 'ao-ponto', nome: 'Ao ponto', preco: 0 },
    { id: 'bem-passado', nome: 'Bem passado', preco: 0 },
  ],
};

export const GRUPOS_EXTRA: readonly OptionGroup[] = [PONTO_DA_CARNE];

/** Categorias inteiras com ponto da carne (nenhuma: os burgers de frango, linguiça e vegetais não têm). */
export const CATEGORIAS_COM_PONTO: readonly string[] = [];

/** Itens com carne bovina que pedem o ponto: burgers de carne, X-Churrasco e as tábuas. */
export const ITENS_COM_PONTO: readonly string[] = [
  'costela-burguer',
  'kabana-2-0',
  'kabana-cheddar-e-bacon',
  'big-k-kabana',
  'kabana-burguer-i',
  'kabana-burguer-ii',
  'kabana-burguer-iii',
  'x-churrasco',
  'contra-file-com-fritas-serve-3-pessoas',
  'trio-kabana-serve-4-pessoas',
  'picanha-da-casa-com-fritas-serve-4-pessoas',
];

/** Categorias que somam para o mínimo de espetinhos do pedido (loja.ts). */
export const CATEGORIAS_DE_ESPETO: readonly string[] = ['espetinhos-kabana', 'espetinhos-especiais'];

/** Limite do campo livre de observação por item. */
export const MAX_OBSERVACAO = 140;
