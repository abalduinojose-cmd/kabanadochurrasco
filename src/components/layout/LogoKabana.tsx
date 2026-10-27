import Image from 'next/image';

/**
 * O logo oficial da Kabana, o arquivo que a loja mandou (telhado, chama e o
 * letreiro com contorno preto, fundo transparente). O contorno faz o logo ler
 * tanto no carvão quanto no branco. A versão de 360px entra sozinha nos
 * lugares pequenos (ver `lib/image-loader.ts`); o original fica em
 * `assets/logo-kabana.png` e gera os ícones (`scripts/icones.mjs`).
 */

type Props = {
  /** Largura (ex.: 'w-[188px]'); a altura acompanha. */
  className?: string;
  /** Cabe inteiro dentro da caixa de quem chama (que precisa ser `relative`). */
  preencher?: boolean;
  sizes: string;
  prioridade?: boolean;
  /** Vazio quando o nome da loja já está escrito ao lado. */
  alt?: string;
};

export function LogoKabana({ className = '', sizes, prioridade = false, alt = 'Kabana do Churrasco, espetaria e hamburgueria', preencher = false }: Props) {
  const tamanho = preencher ? ({ fill: true } as const) : ({ width: 720, height: 695 } as const);
  return (
    <Image
      src="/marca/logo-kabana.webp"
      alt={alt}
      {...tamanho}
      sizes={sizes}
      priority={prioridade}
      className={`select-none ${preencher ? 'object-contain' : 'h-auto'} ${className}`}
      draggable={false}
    />
  );
}
