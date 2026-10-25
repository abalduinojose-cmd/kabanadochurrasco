import { ExternalLink } from 'lucide-react';
import { LOJA } from '@/data/loja';
import { mosaico, linkDoMapa, linkDeBusca } from '@/lib/mapa';

/**
 * Onde fica a loja. Com coordenadas: mosaico de peças do OpenStreetMap (sem
 * SDK, sem chave) com o pino em cima do endereço. Sem coordenadas: o endereço
 * escrito e um link que abre no app de mapas.
 */

const ZOOM = 16;

export function MapaLoja() {
  const c = LOJA.coordenadas;
  const enderecoPendente = LOJA.endereco === 'TODO';

  return (
    <div className="mt-3 overflow-hidden rounded-cartao border border-borda">
      {c && (
        <a href={linkDoMapa(c.lat, c.lng)} target="_blank" rel="noopener noreferrer" aria-label="Abrir o endereço no mapa" className="relative block aspect-[2/1] overflow-hidden bg-fundo-2">
          <Mosaico lat={c.lat} lng={c.lng} />
        </a>
      )}
      <div className="p-4">
        {enderecoPendente ? (
          <p className="text-[13px] text-vermelho">Endereço ainda não cadastrado em loja.ts</p>
        ) : (
          <>
            <p className="text-[14px] leading-snug text-texto">
              {LOJA.endereco}, {LOJA.cidade}/{LOJA.uf}
            </p>
            <a
              href={c ? linkDoMapa(c.lat, c.lng) : linkDeBusca(`${LOJA.endereco}, ${LOJA.cidade} ${LOJA.uf}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-[13px] font-bold text-fogo-texto"
            >
              Como chegar
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function Mosaico({ lat, lng }: { lat: number; lng: number }) {
  const m = mosaico(lat, lng, ZOOM, 3, 2);
  return (
    <div
      className="absolute left-1/2 top-1/2 grid grid-cols-3"
      style={{ width: m.largura, height: m.altura, transform: `translate(${-m.pino.x}px, ${-m.pino.y}px)` }}
    >
      {m.pecas.map((p) => (
        // eslint-disable-next-line @next/next/no-img-element -- peça externa de tamanho fixo
        <img key={p.url} src={p.url} alt="" width={256} height={256} loading="lazy" decoding="async" />
      ))}
      <span
        aria-hidden
        className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-fogo shadow-[0_0_0_6px_rgba(255,106,0,0.25)]"
        style={{ left: m.pino.x, top: m.pino.y }}
      />
      <span className="absolute bottom-1 right-1 rounded bg-white/80 px-1.5 py-0.5 text-[9px] text-texto-2">© OpenStreetMap</span>
    </div>
  );
}
