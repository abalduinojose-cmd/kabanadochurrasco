'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { BotaoCompartilhar } from './BotaoCompartilhar';
import { BotaoBusca } from '@/components/busca/BotaoBusca';
import { LOJA } from '@/data/loja';
import { querMovimento } from '@/lib/motion/reduce';

/**
 * O alto da fachada do Início: as fotos de `LOJA.capas` se alternando e se
 * dissolvendo no carvão, onde o logo assenta (o logo e os dados da loja vêm
 * logo abaixo, em `CartaoLoja`).
 *
 * Roteiro de cada foto (6,3 s): entra em 1,1 s de fusão enquanto a câmera já
 * avança devagar (escala 1 para 1,06, linear, como um push contínuo); fica
 * 5,2 s; sai fundindo enquanto continua avançando, então o movimento nunca
 * para no corte. As barrinhas no alto à esquerda enchem no tempo da foto
 * ("quanto falta para a próxima"), em laranja. Com "reduzir movimento"
 * a troca continua (foi pedida), com o avanço contido em 1,025.
 *
 * A opacidade é estado + transição de CSS (não animação por JS): a primeira
 * foto nasce visível sem depender de nada rodar, e uma aba em segundo plano,
 * onde o navegador congela animações, nunca deixa a capa preta.
 */

const FICA_MS = 5200;
const FUNDE_MS = 1100;
const VIDRO = 'grid size-10 min-h-10 place-items-center rounded-full bg-black/35 text-white ring-1 ring-inset ring-white/20 backdrop-blur-md';

type Estado = { atual: number; ciclos: readonly number[] };

export function Capa() {
  const capas = LOJA.capas;
  const [estado, setEstado] = useState<Estado>(() => ({ atual: 0, ciclos: capas.map(() => 0) }));
  const [pleno, setPleno] = useState<boolean | null>(null);

  useEffect(() => {
    // Lê a preferência só no cliente (no servidor ela não existe).
    const t = window.setTimeout(() => setPleno(querMovimento()), 0);
    return () => window.clearTimeout(t);
  }, []);

  // Troca a cada FICA_MS, só com a aba visível. O ciclo da foto que entra sobe,
  // o que recria o seu quadro e recomeça o push do zero.
  useEffect(() => {
    if (capas.length < 2) return;
    const t = window.setInterval(() => {
      if (document.hidden) return;
      setEstado((e) => {
        const atual = (e.atual + 1) % capas.length;
        return { atual, ciclos: e.ciclos.map((c, i) => (i === atual ? c + 1 : c)) };
      });
    }, FICA_MS);
    return () => window.clearInterval(t);
  }, [capas.length]);

  const { atual, ciclos } = estado;

  return (
    <div id="capa" className="relative h-[256px] overflow-hidden bg-brasa">
      {capas.map((src, i) => {
        const ativa = i === atual;
        return (
          <div
            key={src}
            className="absolute inset-0"
            style={{
              opacity: ativa ? 1 : 0,
              transition: `opacity ${FUNDE_MS}ms ${ativa ? 'cubic-bezier(0.215, 0.61, 0.355, 1)' : 'cubic-bezier(0.55, 0.055, 0.675, 0.19)'}`,
            }}
          >
            <div
              key={`${src}-${ciclos[i]}`}
              className="absolute inset-0 will-change-transform"
              style={pleno === null ? undefined : { animation: `${pleno ? 'capa-push' : 'capa-push-leve'} ${FICA_MS + FUNDE_MS * 2}ms linear forwards` }}
            >
              <Image src={src} alt={i === 0 ? `Pratos da ${LOJA.nome}` : ''} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </div>
          </div>
        );
      })}

      {/* Brasa no fundo: sem foto, é ela que esquenta a fachada. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_100%,rgba(255,106,0,0.28),transparent_70%)]" />
      {/* Véus: em cima para os ícones lerem; embaixo a foto se dissolve no carvão, onde o logo assenta. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[74%] bg-gradient-to-t from-brasa via-brasa/85 to-transparent" />

      {capas.length > 1 && (
        <div aria-hidden className="absolute left-4 top-[max(30px,calc(env(safe-area-inset-top)+30px))] flex gap-1.5">
          {capas.map((src, i) => (
            <span key={src} className="h-[3px] w-7 overflow-hidden rounded-full bg-white/30">
              {i === atual && (
                <span
                  key={`${src}-${ciclos[i]}`}
                  className="block h-full origin-left rounded-full bg-fogo"
                  style={{ animation: `capa-progresso ${FICA_MS}ms linear forwards` }}
                />
              )}
              {i < atual && <span className="block h-full rounded-full bg-fogo" />}
            </span>
          ))}
        </div>
      )}

      <div className="pt-seguro absolute inset-x-3 top-0 flex justify-end gap-2 pt-3">
        <BotaoBusca className={VIDRO} />
        <BotaoCompartilhar className={VIDRO} />
      </div>
    </div>
  );
}
