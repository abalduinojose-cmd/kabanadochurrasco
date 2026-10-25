import { SECOES } from './secoes';

/**
 * Sugestões de comentário na página do item (os chips acima do campo).
 * Genéricas de propósito: o ponto da carne tem grupo próprio. Só aparecem nos
 * pratos salgados; bebida, doce e sobremesa ficam só com o campo livre.
 */
export const SUGESTOES_OBSERVACAO: readonly string[] = [
  'Sem cebola',
  'Sem tomate',
  'Sem maionese',
  'Molho à parte',
  'Capricha na farofa',
];

const SECOES_COM_SUGESTAO = new Set(['lanches', 'espetinhos', 'tabuas', 'acompanhamentos']);

const CATEGORIAS_COM_SUGESTAO = new Set(
  SECOES.filter((s) => SECOES_COM_SUGESTAO.has(s.id)).flatMap((s) => s.categorias.map((c) => c.categoriaId)),
);

export function sugestoesDeObservacao(categoriaId: string): readonly string[] {
  return CATEGORIAS_COM_SUGESTAO.has(categoriaId) ? SUGESTOES_OBSERVACAO : [];
}
