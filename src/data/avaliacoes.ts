/**
 * Avaliações do Google. GERADO por scripts/avaliacoes-google.mjs a partir de
 * scripts/avaliacoes-google.json (coletado em 2026-10-25).
 *
 * Nota, total e distribuição são os do perfil no Google Maps. As 10 avaliações
 * mostradas são reais e escolhidas entre as mais relevantes (4 e 5 estrelas com
 * texto); o texto está como a pessoa escreveu. Fotos baixadas para o app.
 */

export type Avaliacao = {
  readonly id: string;
  readonly nome: string;
  readonly estrelas: number;
  /** Data da avaliação (AAAA-MM-DD). */
  readonly quando: string;
  readonly guiaLocal: boolean;
  readonly texto: string;
  readonly foto: string;
  readonly fotos: readonly string[];
};

export const GOOGLE = {
  nota: 4.8,
  total: 49,
  distribuicao: { 5: 43, 4: 4, 3: 1, 2: 0, 1: 1 },
  url: 'https://www.google.com/maps/search/?api=1&query=Kabana%20do%20Churrasco&query_place_id=ChIJMyQwyxRRmAARhvMZVdASx74',
  rotas: 'https://www.google.com/maps/dir/?api=1&destination=Kabana%20do%20Churrasco&destination_place_id=ChIJMyQwyxRRmAARhvMZVdASx74',
} as const;

export const AVALIACOES: readonly Avaliacao[] = [
  {
    id: 'daniela-ferreira',
    nome: 'Daniela Ferreira',
    estrelas: 5,
    quando: '2025-07-24',
    guiaLocal: true,
    texto: 'O espaço fica um pouquinho longe do centro de Itaipava mas vale super a pena ir conhecer. Tem um espaço que você pode aproveitar com os amigos e além de ter uma excelente comida, o hambúrguer é simplesmente sensacional, uma verdadeira delícia. O atendimento foi maravilhoso tanto no dia que só fomos buscar o lanche, como no dia que comemos no lugar, fale super a pena conhecer.',
    foto: '/avaliacoes/daniela-ferreira.webp',
    fotos: ['/avaliacoes/daniela-ferreira-1.webp', '/avaliacoes/daniela-ferreira-2.webp', '/avaliacoes/daniela-ferreira-3.webp', '/avaliacoes/daniela-ferreira-4.webp'],
  },
  {
    id: 'carlos-felipe',
    nome: 'Carlos Felipe Oliveira Zimbrao',
    estrelas: 5,
    quando: '2026-08-01',
    guiaLocal: false,
    texto: 'Excelente opção para um bom churrasco e hambúrgueres na brasa. Atendimento excelente, com destaque para o garçom Paulo. Boa diversidade de espetos, tábuas e petiscos e bebida sempre gelada.',
    foto: '/avaliacoes/carlos-felipe.webp',
    fotos: [],
  },
  {
    id: 'luciana-maria',
    nome: 'Luciana Maria de Souza',
    estrelas: 5,
    quando: '2026-10-10',
    guiaLocal: false,
    texto: 'Tudo bom demais! E os atendentes são nota 10!',
    foto: '/avaliacoes/luciana-maria.webp',
    fotos: ['/avaliacoes/luciana-maria-1.webp'],
  },
  {
    id: 'rosane-marcelo',
    nome: 'Rosane Marcelo',
    estrelas: 5,
    quando: '2023-10-14',
    guiaLocal: true,
    texto: 'Fui pela primeira vez e Amei o lugar, simples porém aconchegante, comida MARAVILHOSA! Comi 3 tipos diferentes de espetinhos e todos estavam deliciosos, muito bem temperados, no ponto e muito macios. O Hambúrguer não ficou atrás, Perfeito, o ponto, a carne os temperos. Vou virar cliente com certeza.',
    foto: '/avaliacoes/rosane-marcelo.webp',
    fotos: [],
  },
  {
    id: 'peter-claussen',
    nome: 'Peter Claussen',
    estrelas: 5,
    quando: '2025-03-05',
    guiaLocal: true,
    texto: 'Excelente opção de petiscos e carnes em Posse. Comida saborosa, porções generosas e preço bem honesto. Parabéns!',
    foto: '/avaliacoes/peter-claussen.webp',
    fotos: [],
  },
  {
    id: 'rafaela',
    nome: 'Rafaela',
    estrelas: 5,
    quando: '2026-06-17',
    guiaLocal: false,
    texto: 'Adorei, foi uma grata surpresa pois estava de passagem pela cidade. Comida gostosa, fresquinha e quantidade justa.',
    foto: '/avaliacoes/rafaela.webp',
    fotos: [],
  },
  {
    id: 'junior-naval',
    nome: 'Junior Naval',
    estrelas: 5,
    quando: '2025-05-26',
    guiaLocal: true,
    texto: 'Atendimento top, espetinho e hambúrgueres excelentes. Parabéns pelo bom atendimento e pelo local que até tem espaço kids.',
    foto: '/avaliacoes/junior-naval.webp',
    fotos: [],
  },
  {
    id: 'patricia-nogueira',
    nome: 'Patricia de Sousa Nogueira',
    estrelas: 5,
    quando: '2025-01-26',
    guiaLocal: true,
    texto: 'Ambiente famíliar, descontraído',
    foto: '/avaliacoes/patricia-nogueira.webp',
    fotos: [],
  },
  {
    id: 'leonardo-meirelles',
    nome: 'Leonardo Meirelles',
    estrelas: 5,
    quando: '2026-08-13',
    guiaLocal: true,
    texto: 'Lanche perfeito e atendimento nota 10',
    foto: '/avaliacoes/leonardo-meirelles.webp',
    fotos: [],
  },
  {
    id: 'livia-magrani',
    nome: 'Livia Magrani',
    estrelas: 5,
    quando: '2025-04-03',
    guiaLocal: false,
    texto: 'Eu literalmente sou apaixonada nesses lanches impecáveis!',
    foto: '/avaliacoes/livia-magrani.webp',
    fotos: [],
  },
];
