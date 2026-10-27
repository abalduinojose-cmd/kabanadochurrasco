/**
 * Como o cardápio aparece: 7 seções no lugar das 17 categorias soltas do
 * instadelivery. Cada seção junta categorias do menu.ts (que continuam valendo
 * para a sacola, os adicionais e a mensagem do WhatsApp) e dá um nome mais
 * claro a cada uma.
 *
 * - `lista`: linhas com nome, descrição, preço e foto (os pratos).
 * - `vitrine`: cartões com a foto do produto em trilho, com "Ver todos" que
 *   abre a grade (bebidas e doces, como no mercado do iFood).
 *
 * Categoria nova no menu.ts que não estiver aqui cai em "Mais itens" no fim,
 * para nada sumir do cardápio (o teste secoes.test.ts avisa).
 */

export type SubSecao = {
  readonly categoriaId: string;
  readonly titulo?: string;
  /** Mostra a categoria em cartões grandes (2 por linha) em vez de linhas. */
  readonly cartoes?: boolean;
};

export type Secao = {
  readonly id: string;
  readonly nome: string;
  /** Rótulo do atalho com foto, quando o nome não cabe em 76px (\u00AD = hífen opcional). */
  readonly rotulo?: string;
  readonly formato: 'lista' | 'vitrine';
  /** Frase curta do cartão de atalho (só fatos do cardápio). */
  readonly chamada: string;
  /** Foto do atalho no topo do Início. */
  readonly foto: string;
  /** Os itens com foto desta seção entram em "Destaques". */
  readonly destaques: boolean;
  readonly categorias: readonly SubSecao[];
};

export const SECOES: readonly Secao[] = [
  {
    id: 'lanches',
    nome: 'Lanches',
    formato: 'lista',
    chamada: 'Burgers no pão brioche',
    foto: '/fotos/kabana-burguer-ii.webp',
    destaques: true,
    categorias: [
      { categoriaId: 'especiais', titulo: 'Burgers especiais', cartoes: true },
      { categoriaId: 'burgueres-tradicionais', titulo: 'Burgers tradicionais' },
      { categoriaId: 'sandubao-kabana', titulo: 'Sandubão Kabana' },
      { categoriaId: 'kombo-kids', titulo: 'Kombo Kids' },
    ],
  },
  {
    id: 'espetinhos',
    nome: 'Espetinhos',
    formato: 'lista',
    chamada: 'Direto da brasa',
    foto: '/fotos/tulipa-de-frango.webp',
    destaques: true,
    categorias: [
      { categoriaId: 'espetinhos-kabana', titulo: 'Tradicionais' },
      { categoriaId: 'espetinhos-especiais', titulo: 'Especiais' },
    ],
  },
  {
    id: 'tabuas',
    nome: 'Tábuas e porções',
    formato: 'lista',
    chamada: 'Para dividir com a galera',
    foto: '/fotos/picanha-da-casa-com-fritas-serve-4-pessoas.webp',
    destaques: true,
    categorias: [
      { categoriaId: 'tabuas-kabana', titulo: 'Tábuas para dividir' },
      { categoriaId: 'porcoes-kabana', titulo: 'Porções' },
    ],
  },
  {
    id: 'acompanhamentos',
    nome: 'Acompanhamentos',
    rotulo: 'Acompanha\u00ADmentos',
    formato: 'lista',
    chamada: 'Arroz, farofa, vinagrete e extras',
    foto: '/fotos/atalho-acompanhamentos.webp',
    destaques: false,
    categorias: [
      { categoriaId: 'guarnicoes', titulo: 'Guarnições' },
      { categoriaId: 'adicionais', titulo: 'Adicionais avulsos' },
    ],
  },
  {
    id: 'sobremesas',
    nome: 'Sobremesas',
    formato: 'lista',
    chamada: 'Banana na brasa, brownie e mais',
    foto: '/fotos/gelado-de-brownie.webp',
    destaques: true,
    categorias: [{ categoriaId: 'sobremesas' }],
  },
  {
    id: 'bebidas',
    nome: 'Bebidas',
    formato: 'vitrine',
    chamada: 'Refri, suco, cerveja, drinks e doses',
    foto: '/fotos/drinks-kabana.webp',
    destaques: false,
    categorias: [
      { categoriaId: 'nao-alcoolicos', titulo: 'Refrigerantes, sucos e água' },
      { categoriaId: 'cervejas', titulo: 'Cervejas' },
      { categoriaId: 'bebidas', titulo: 'Drinks e energéticos' },
      { categoriaId: 'bebidas-quentes', titulo: 'Doses' },
      { categoriaId: 'vinhos', titulo: 'Vinhos' },
    ],
  },
  {
    id: 'doces',
    nome: 'Doces',
    formato: 'vitrine',
    chamada: 'Bomboniere',
    foto: '/fotos/bebidas/brownie.webp',
    destaques: false,
    categorias: [{ categoriaId: 'bomboniere', titulo: 'Bomboniere' }],
  },
];
