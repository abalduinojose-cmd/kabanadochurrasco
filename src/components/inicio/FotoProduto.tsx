import Image from 'next/image';
import { BrandMark } from '@/components/layout/BrandMark';

/**
 * Foto do produto. Sem foto, um quadro cinza claro com a marca em marca
 * d'água, como o iFood faz com o logo da loja.
 */

type Props = {
  src?: string;
  alt: string;
  sizes?: string;
  prioridade?: boolean;
  className?: string;
};

export function FotoProduto({ src, alt, sizes = '150px', prioridade = false, className = '' }: Props) {
  if (!src) {
    return (
      <div aria-hidden className={`relative flex aspect-square items-center justify-center overflow-hidden bg-foto ${className}`}>
        <BrandMark className="w-3/5 opacity-30" />
      </div>
    );
  }
  return (
    <div className={`relative aspect-square overflow-hidden bg-foto ${className}`}>
      <Image src={src} alt={alt} fill priority={prioridade} sizes={sizes} className="object-cover" />
    </div>
  );
}
