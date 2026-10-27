import { MapPin } from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { AcoesEndereco } from './AcoesEndereco';
import { GOOGLE } from '@/data/avaliacoes';
import { LOJA } from '@/data/loja';
import { mosaico, linkDeBusca } from '@/lib/mapa';

/**
 * Onde fica a loja: mosaico de peças do OpenStreetMap (sem SDK, sem chave) em
 * tons de cinza, para o pino da marca saltar: o logo num quadrado escuro com a
 * ponta no endereço e o halo laranja no chão. Embaixo, o endereço e os botões
 * de rota. Sem coordenadas, só o endereço e a busca no mapa.
 */

const ZOOM = 16;

export function MapaLoja() {
  const c = LOJA.coordenadas;
  const enderecoCompleto = `${LOJA.endereco}, ${LOJA.cidade}/${LOJA.uf}`;
  const rotaGoogle = c ? GOOGLE.rotas : linkDeBusca(enderecoCompleto);
  const rotaWaze = c ? `https://waze.com/ul?ll=${c.lat},${c.lng}&navigate=yes` : null;

  return (
    <div className="mt-3 overflow-hidden rounded-[22px] bg-cartao shadow-[0_0_0_1px_var(--color-borda),0_14px_30px_-22px_rgba(0,0,0,0.4)]">
      {c && (
        <a href={rotaGoogle} target="_blank" rel="noopener noreferrer" aria-label="Abrir a rota no Google Maps" className="relative block aspect-[16/10] overflow-hidden bg-[#eceef0]">
          <Mosaico lat={c.lat} lng={c.lng} />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-bold text-texto shadow-sm backdrop-blur">
            <MapPin className="size-3.5 text-fogo-texto" aria-hidden />
            Posse • {LOJA.cidade}
          </span>
        </a>
      )}
      <div className="p-4">
        <p className="text-[15px] font-bold leading-snug text-texto">{LOJA.endereco}</p>
        <p className="mt-0.5 text-[13px] text-texto-2">
          {LOJA.cidade}/{LOJA.uf}
        </p>
        <AcoesEndereco rotaGoogle={rotaGoogle} rotaWaze={rotaWaze} endereco={enderecoCompleto} />
      </div>
    </div>
  );
}

function Mosaico({ lat, lng }: { lat: number; lng: number }) {
  const m = mosaico(lat, lng, ZOOM, 3, 2);
  return (
    <>
      <div
        className="absolute left-1/2 top-[56%] grid grid-cols-3 [filter:grayscale(0.92)_contrast(1.04)_brightness(1.05)]"
        style={{ width: m.largura, height: m.altura, transform: `translate(${-m.pino.x}px, ${-m.pino.y}px)` }}
      >
        {m.pecas.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element -- peça externa de tamanho fixo
          <img key={p.url} src={p.url} alt="" width={256} height={256} loading="lazy" decoding="async" />
        ))}
      </div>
      {/* O pino: halo no chão, o logo num quadrado escuro e a ponta no endereço. */}
      <span aria-hidden className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2">
        <span className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fogo/20" />
        <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-fogo" />
      </span>
      <span aria-hidden className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-[calc(100%+10px)]">
        <span className="relative grid size-12 place-items-center rounded-[15px] bg-carvao shadow-[0_10px_20px_-8px_rgba(0,0,0,0.6)] ring-[3px] ring-white">
          <BrandMark recorte className="w-9" />
          <span className="absolute -bottom-[7px] left-1/2 size-3.5 -translate-x-1/2 rotate-45 rounded-[3px] bg-carvao" />
        </span>
      </span>
      <span className="absolute bottom-1.5 right-1.5 rounded bg-white/85 px-1.5 py-0.5 text-[9px] text-texto-2">© OpenStreetMap</span>
    </>
  );
}
