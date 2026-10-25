import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { ehFotoDeProduto } from '@/data/fotos';

/**
 * Foto do item, em qualquer tamanho (o quadro vem de `className`).
 *
 * - Prato: foto inteira cobrindo o quadro.
 * - Produto de marca (lata, garrafa, embalagem em fundo branco): mostrado
 *   inteiro, com respiro, e mesclado ao cinza-quente do quadro, então o branco
 *   da foto some e todas as latas ficam do mesmo jeito, como numa gôndola.
 * - Sem foto: com `icone`, o quadro quente da marca com o ícone da seção (as
 *   linhas ficam alinhadas sem fingir foto); sem ícone, a marca em marca d'água.
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
  /** Ícone do quadro quando não há foto. */
  icone?: LucideIcon;
};

export function FotoProduto({ src, alt, sizes, prioridade = false, className = 'aspect-square', respiro = 'p-[12%]', icone: Icone }: Props) {
  if (!src) {
    if (Icone) {
      return (
        <div
          aria-hidden
          className={`relative grid shrink-0 place-items-center overflow-hidden bg-[radial-gradient(120%_120%_at_30%_20%,#fff4ec_0%,#ffe2cc_60%,#ffd3b3_100%)] ${className}`}
        >
          <Icone className="size-[38%] text-fogo-texto/80" strokeWidth={1.5} />
        </div>
      );
    }
    return (
      <div aria-hidden className={`relative grid shrink-0 place-items-center overflow-hidden bg-foto ${className}`}>
        <BrandMark className="w-3/5 opacity-25" />
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
