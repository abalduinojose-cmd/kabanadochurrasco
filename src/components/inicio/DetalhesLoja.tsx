'use client';

import Image from 'next/image';
import { create } from 'zustand';
import { BadgeCheck, Clock, CreditCard, ExternalLink, Instagram, MapPin, MessageCircle, Navigation, Star } from 'lucide-react';
import { Folha } from '@/components/ui/Folha';
import { BrandMark } from '@/components/layout/BrandMark';
import { StatusLoja } from '@/components/layout/StatusLoja';
import { HorarioSemana } from '@/components/perfil/HorarioSemana';
import { FormasPagamento } from '@/components/perfil/FormasPagamento';
import { MapaLoja } from '@/components/perfil/MapaLoja';
import { AVALIACOES, GOOGLE, type Avaliacao } from '@/data/avaliacoes';
import { LOJA } from '@/data/loja';

/**
 * A folha da loja: atalhos (WhatsApp, Instagram, rotas), a nota do Google com
 * as barras por estrela e as 10 avaliações reais com foto em carrossel, o
 * Instagram em grade, os horários com o dia de hoje, o mapa e as formas de
 * pagamento. Abre pelo cartão da loja (seta e pílula da nota).
 */

export const useDetalhes = create<{ aberto: boolean; abrir: () => void; fechar: () => void }>((set) => ({
  aberto: false,
  abrir: () => set({ aberto: true }),
  fechar: () => set({ aberto: false }),
}));

/** Botão que abre a folha da loja (a seta e a pílula da nota no cartão). */
export function AbrirDetalhes({ rotulo, className, children }: { rotulo: string; className: string; children: React.ReactNode }) {
  const abrir = useDetalhes((s) => s.abrir);
  return (
    <button type="button" onClick={abrir} aria-label={rotulo} className={className}>
      {children}
    </button>
  );
}

const FOTOS_INSTAGRAM = [
  '/fotos/picanha-da-casa-com-fritas-serve-4-pessoas.webp',
  '/fotos/costela-burguer.webp',
  '/fotos/drinks-kabana.webp',
  '/fotos/tulipa-de-frango.webp',
  '/fotos/morango-com-chocolate.webp',
  '/fotos/porcao-de-peixes.webp',
] as const;

const virgula = (n: number) => n.toFixed(1).replace('.', ',');

function haQuanto(data: string): string {
  const dias = Math.max(0, Math.round((Date.now() - new Date(`${data}T12:00:00`).getTime()) / 86_400_000));
  if (dias < 1) return 'hoje';
  if (dias < 7) return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
  if (dias < 30) return `há ${Math.round(dias / 7)} ${Math.round(dias / 7) === 1 ? 'semana' : 'semanas'}`;
  if (dias < 365) return `há ${Math.round(dias / 30)} ${Math.round(dias / 30) === 1 ? 'mês' : 'meses'}`;
  const anos = Math.floor(dias / 365);
  return `há ${anos} ${anos === 1 ? 'ano' : 'anos'}`;
}

function Estrelas({ n, tamanho = 'size-3.5' }: { n: number; tamanho?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${tamanho} ${i <= Math.round(n) ? 'fill-[#F5A623] text-[#F5A623]' : 'fill-borda text-borda'}`} aria-hidden />
      ))}
    </span>
  );
}

function CartaoAvaliacao({ a }: { a: Avaliacao }) {
  return (
    <li className="flex w-[280px] flex-col rounded-[20px] bg-cartao p-4 shadow-[0_0_0_1px_var(--color-borda)]">
      <div className="flex items-center gap-3">
        <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-fundo-2">
          <Image src={a.foto} alt="" fill sizes="40px" className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-texto">{a.nome}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-texto-2">
            {haQuanto(a.quando)}
            {a.guiaLocal && (
              <span className="inline-flex items-center gap-0.5 font-semibold text-[#1a73e8]">
                <BadgeCheck className="size-3.5" aria-hidden /> Guia Local
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="mt-2.5">
        <Estrelas n={a.estrelas} />
      </div>
      <p className="mt-1.5 line-clamp-6 text-[13.5px] leading-relaxed text-texto">{a.texto}</p>
      {a.fotos.length > 0 && (
        <ul className="mt-auto flex gap-1.5 pt-3">
          {a.fotos.slice(0, 4).map((f) => (
            <li key={f} className="relative size-14 overflow-hidden rounded-[10px] bg-fundo-2">
              <Image src={f} alt={`Foto de ${a.nome} na ${LOJA.nome}`} fill sizes="56px" className="object-cover" />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function Titulo({ icone, children }: { icone: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-[16px] font-extrabold tracking-[-0.01em] text-texto">
      <span className="grid size-7 place-items-center rounded-full bg-fogo-suave text-fogo-texto">{icone}</span>
      {children}
    </h3>
  );
}

export function DetalhesLoja() {
  const aberto = useDetalhes((s) => s.aberto);
  const fechar = useDetalhes((s) => s.fechar);
  if (!aberto) return null;

  const saudacao = encodeURIComponent(`Olá! Vim pelo app da ${LOJA.nome}.`);
  const maxDist = Math.max(...Object.values(GOOGLE.distribuicao));
  const acoes = [
    { href: `https://wa.me/${LOJA.whatsapp}?text=${saudacao}`, rotulo: 'WhatsApp', icone: <MessageCircle className="size-5" aria-hidden />, cor: 'bg-verde-suave text-verde' },
    { href: `https://instagram.com/${LOJA.instagram}`, rotulo: 'Instagram', icone: <Instagram className="size-5" aria-hidden />, cor: 'bg-[#fdeef4] text-[#c13584]' },
    { href: GOOGLE.rotas, rotulo: 'Como chegar', icone: <Navigation className="size-5" aria-hidden />, cor: 'bg-[#e8f0fe] text-[#1a73e8]' },
  ];

  return (
    <Folha aoFechar={fechar} titulo="Sobre a loja">
      <div className="flex items-center gap-3.5">
        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-[18px] bg-carvao">
          <BrandMark recorte className="w-11" />
        </span>
        <div className="min-w-0">
          <p className="text-[19px] font-extrabold leading-tight tracking-[-0.02em] text-texto">{LOJA.nome}</p>
          <p className="text-[13px] text-texto-2">
            {LOJA.tagline} • {LOJA.cidade}/{LOJA.uf}
          </p>
          <StatusLoja pilula className="mt-1.5" />
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-2">
        {acoes.map((a) => (
          <li key={a.rotulo}>
            <a
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-[18px] bg-fundo-2 text-[12.5px] font-bold text-texto transition-transform duration-150 active:scale-[0.97]"
            >
              <span className={`grid size-9 place-items-center rounded-full ${a.cor}`}>{a.icone}</span>
              {a.rotulo}
            </a>
          </li>
        ))}
      </ul>

      {/* Avaliações do Google */}
      <section aria-labelledby="titulo-avaliacoes" className="mt-7">
        <div className="flex items-center justify-between gap-3">
          <Titulo icone={<Star className="size-4" aria-hidden />}>
            <span id="titulo-avaliacoes">Avaliações no Google</span>
          </Titulo>
          <a href={GOOGLE.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 text-[13px] font-bold text-fogo-texto">
            Ver todas <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>

        <div className="mt-3 flex items-center gap-4 rounded-[20px] bg-fundo-2 p-4">
          <div className="shrink-0 text-center">
            <p className="text-[40px] font-extrabold leading-none tracking-[-0.03em] text-texto">{virgula(GOOGLE.nota)}</p>
            <div className="mt-1.5">
              <Estrelas n={GOOGLE.nota} />
            </div>
            <p className="mt-1 text-[12px] text-texto-2">{GOOGLE.total} avaliações</p>
          </div>
          <ul className="min-w-0 flex-1 space-y-1" aria-label="Avaliações por estrela">
            {([5, 4, 3, 2, 1] as const).map((n) => (
              <li key={n} className="flex items-center gap-2 text-[11.5px] tabular-nums text-texto-2">
                <span className="w-2 text-right font-semibold">{n}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-borda">
                  <span className="block h-full rounded-full bg-[#F5A623]" style={{ width: `${(GOOGLE.distribuicao[n] / maxDist) * 100}%` }} />
                </span>
                <span className="w-5 text-right">{GOOGLE.distribuicao[n]}</span>
              </li>
            ))}
          </ul>
        </div>

        <ul className="trilho -mx-4 mt-3 items-stretch pb-1">
          {AVALIACOES.map((a) => (
            <CartaoAvaliacao key={a.id} a={a} />
          ))}
        </ul>
      </section>

      {/* Instagram */}
      <section aria-labelledby="titulo-instagram" className="mt-7">
        <div className="flex items-center justify-between gap-3">
          <Titulo icone={<Instagram className="size-4" aria-hidden />}>
            <span id="titulo-instagram">@{LOJA.instagram}</span>
          </Titulo>
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-1.5">
          {FOTOS_INSTAGRAM.map((f) => (
            <li key={f}>
              <a href={`https://instagram.com/${LOJA.instagram}`} target="_blank" rel="noopener noreferrer" className="relative block aspect-square overflow-hidden rounded-[12px] bg-fundo-2">
                <Image src={f} alt="" fill sizes="(max-width: 672px) 31vw, 200px" className="object-cover" />
              </a>
            </li>
          ))}
        </ul>
        <a
          href={`https://instagram.com/${LOJA.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex h-12 items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-[14px] font-bold text-white active:brightness-95"
        >
          <Instagram className="size-4" aria-hidden />
          Seguir no Instagram
        </a>
      </section>

      <section aria-labelledby="titulo-horarios" className="mt-7">
        <Titulo icone={<Clock className="size-4" aria-hidden />}>
          <span id="titulo-horarios">Horário de funcionamento</span>
        </Titulo>
        <HorarioSemana />
      </section>

      <section aria-labelledby="titulo-onde" className="mt-7">
        <Titulo icone={<MapPin className="size-4" aria-hidden />}>
          <span id="titulo-onde">Onde fica</span>
        </Titulo>
        <MapaLoja />
      </section>

      <section aria-labelledby="titulo-pagamento" className="mt-7 pb-2">
        <Titulo icone={<CreditCard className="size-4" aria-hidden />}>
          <span id="titulo-pagamento">Formas de pagamento</span>
        </Titulo>
        <FormasPagamento />
      </section>
    </Folha>
  );
}
