/**
 * Banners do carrossel do Início, como os destaques do topo do iFood.
 *
 * Fotos do Instagram da loja (recortadas em /public/banners). Mensagens da
 * própria casa, sem preço nem desconto inventado. Para uma promoção real,
 * troque título, texto e foto; `imagem` é opcional (sem ela, vale a cor do tom).
 */

export type TomBanner = 'noite' | 'fogo' | 'claro';

export type Banner = {
  readonly id: string;
  readonly tom: TomBanner;
  readonly titulo: string;
  readonly texto: string;
  readonly cta: string;
  /** Âncora ou rota de destino. */
  readonly href?: string;
  /** Em vez de navegar, marca a forma de receber. */
  readonly acao?: 'retirada' | 'entrega';
  /** Foto em /public (ex.: '/banners/tabuas.webp'). */
  readonly imagem?: string;
};

export const BANNERS: readonly Banner[] = [
  {
    id: 'tabuas',
    tom: 'noite',
    titulo: 'Tábuas para dividir',
    texto: 'Contra-filé, picanha e o Trio Kabana com fritas, farofa e vinagrete.',
    cta: 'Ver tábuas',
    href: '/#tabuas-kabana',
    imagem: '/banners/tabuas.webp',
  },
  {
    id: 'burgers',
    tom: 'noite',
    titulo: 'Burgers na brasa',
    texto: 'Blend da casa no pão de brioche, com a maionese Kabana.',
    cta: 'Ver burgers',
    href: '/#especiais',
    imagem: '/banners/burgers.webp',
  },
  {
    id: 'retirada',
    tom: 'noite',
    titulo: 'Peça pelo app, retire sem fila',
    texto: 'Escolha Retirada e a loja avisa pelo WhatsApp quando estiver pronto.',
    cta: 'Pedir para retirar',
    acao: 'retirada',
    imagem: '/banners/espetos.webp',
  },
];
