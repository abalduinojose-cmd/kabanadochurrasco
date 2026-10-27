import Image from 'next/image';
import { LogoKabana } from '@/components/layout/LogoKabana';
import { ehFotoDeProduto } from '@/data/fotos';

/**
 * Foto do item, em qualquer tamanho (o quadro vem de `className`).
 *
 * - Prato: foto inteira cobrindo o quadro.
 * - Produto de marca (lata, garrafa, embalagem em fundo branco): mostrado
 *   inteiro, com respiro, e mesclado ao cinza-quente do quadro, então o branco
 *   da foto some e todas as latas ficam do mesmo jeito, como numa gôndola.
 * - Sem foto: o logo da casa no carvão com uma brasa por trás, como a
 *   fachada do Início (as linhas ficam alinhadas sem fingir foto).
 */

type Props = {
  src?: string;
  alt: string;
  sizes: string;
  prioridade?: boolean;
  /** Quadro e cantos (ex.: 'aspect-square rounded-[16px]', 'size-24 rounded-[14px]'). */
  className?: string;
  /** Respiro em volta do produto de marca. */
  respiro?: string;
};

export function FotoProduto({ src, alt, sizes, prioridade = false, className = 'aspect-square', respiro = 'p-[12%]' }: Props) {
  if (!src) {
    return (
      <div
        aria-hidden
        className={`relative shrink-0 overflow-hidden bg-[radial-gradient(90%_75%_at_50%_100%,#4a1f04_0%,#1d1410_58%,#120e0b_100%)] ${className}`}
      >
        <div className="absolute inset-[18%]">
          <LogoKabana preencher sizes={sizes} alt="" />
        </div>
      </div>
    );
  }
  const produto = ehFotoDeProduto(src);
  return (
    <div className={`relative shrink-0 overflow-hidden ${produto ? 'bg-vitrine' : 'bg-foto'} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={prioridade}
        sizes={sizes}
        className={produto ? `object-contain mix-blend-multiply ${respiro}` : 'object-cover'}
      />
    </div>
  );
}
