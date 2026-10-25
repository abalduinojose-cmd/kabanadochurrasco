import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { BotaoCompartilhar } from './BotaoCompartilhar';
import { LOJA } from '@/data/loja';

/**
 * A capa da loja, como no iFood: foto da fachada ou do salão, com os ícones
 * de busca e compartilhar por cima. Sem foto cadastrada, a marca ocupa o
 * lugar (telhado e chama sobre o preto com a brasa).
 */
export function Capa() {
  return (
    <div id="capa" className="relative h-[172px] overflow-hidden bg-carvao">
      {LOJA.capa ? (
        <Image src={LOJA.capa} alt={`Fachada da ${LOJA.nome}`} fill priority sizes="100vw" className="object-cover" />
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(255,106,0,.55), transparent 65%)',
            }}
          />
          <BrandMark className="absolute bottom-9 left-1/2 w-[250px] -translate-x-1/2" />
        </>
      )}

      <div className="pt-seguro absolute inset-x-3 top-0 flex justify-end gap-2 pt-3">
        <Link
          href="/busca"
          aria-label="Buscar no cardápio"
          className="grid size-10 place-items-center rounded-full bg-white/92 text-texto shadow-sm"
        >
          <Search className="size-5" aria-hidden />
        </Link>
        <BotaoCompartilhar />
      </div>
    </div>
  );
}
