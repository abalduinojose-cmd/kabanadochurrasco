import type { Metadata } from 'next';
import { Clock, Instagram, MapPin, MessageCircle } from 'lucide-react';
import { BarraTopo } from '@/components/layout/BarraTopo';
import { BrandMark } from '@/components/layout/BrandMark';
import { StatusLoja } from '@/components/layout/StatusLoja';
import { Horarios } from '@/components/perfil/Horarios';
import { MapaLoja } from '@/components/perfil/MapaLoja';
import { LOJA } from '@/data/loja';

export const metadata: Metadata = { title: 'Sobre a loja' };

const saudacao = encodeURIComponent(`Olá! Vim pelo app da ${LOJA.nome}.`);

/** Sobre a Kabana: a loja, horários, onde fica e contatos. Tudo de loja.ts. */
export default function SobrePage() {
  return (
    <>
      <BarraTopo titulo="Sobre a loja" voltarPara="/perfil" />
      <main className="mx-auto max-w-2xl pb-12">
        <header className="flex items-center gap-3 px-4 py-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-carvao">
            <BrandMark recorte className="w-[46px]" />
          </span>
          <div className="min-w-0">
            <h1 className="text-[20px] font-extrabold leading-tight text-texto">{LOJA.nome}</h1>
            <p className="text-[13px] text-texto-2">
              {LOJA.tagline} • {LOJA.cidade}/{LOJA.uf}
            </p>
            <StatusLoja className="mt-1" />
          </div>
        </header>

        <div className="separador" />

        <section className="px-4 py-5" aria-labelledby="horarios">
          <h2 id="horarios" className="flex items-center gap-2 text-[15px] font-bold text-texto">
            <Clock className="size-4 text-texto-2" aria-hidden /> Horário de funcionamento
          </h2>
          <Horarios />
        </section>

        <div className="separador" />

        <section className="px-4 py-5" aria-labelledby="onde">
          <h2 id="onde" className="flex items-center gap-2 text-[15px] font-bold text-texto">
            <MapPin className="size-4 text-texto-2" aria-hidden /> Onde fica
          </h2>
          <MapaLoja />
        </section>

        <div className="separador" />

        <section className="px-4 py-5" aria-labelledby="contato">
          <h2 id="contato" className="text-[15px] font-bold text-texto">
            Fale com a gente
          </h2>
          <ul className="mt-2 divide-y divide-divisor">
            <li>
              <a href={`https://wa.me/${LOJA.whatsapp}?text=${saudacao}`} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center gap-3 py-3">
                <MessageCircle className="size-5 text-verde" aria-hidden />
                <span className="flex-1">
                  <span className="block text-[14px] font-semibold text-texto">WhatsApp</span>
                  <span className="block text-legenda text-texto-2">Falar com a loja</span>
                </span>
              </a>
            </li>
            <li>
              <a href={`https://instagram.com/${LOJA.instagram}`} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center gap-3 py-3">
                <Instagram className="size-5 text-texto-2" aria-hidden />
                <span className="flex-1">
                  <span className="block text-[14px] font-semibold text-texto">Instagram</span>
                  <span className="block text-legenda text-texto-2">@{LOJA.instagram}</span>
                </span>
              </a>
            </li>
          </ul>
        </section>

        <p className="px-4 pb-4 pt-2 text-center text-[13px] italic text-texto-2">{LOJA.fraseCasa}</p>
      </main>
    </>
  );
}
