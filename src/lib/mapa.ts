/**
 * Mapa com peças do OpenStreetMap, sem SDK.
 *
 * Projeção Web Mercator padrão dos "slippy maps": a longitude vira a coluna
 * e a latitude vira a linha da peça num zoom dado. Com isso dá para montar um
 * mosaico de 3×2 peças de 256px e pôr o pino exatamente em cima do endereço.
 */

export type Peca = { x: number; y: number; url: string };

const TAMANHO = 256;

/** Coordenada contínua da peça (sem arredondar) para lat/lng num zoom. */
export function coordenadaDaPeca(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = 2 ** zoom;
  const latRad = (lat * Math.PI) / 180;
  const x = ((lng + 180) / 360) * n;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

export function urlDaPeca(x: number, y: number, zoom: number): string {
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

/**
 * Mosaico de `colunas` × `linhas` peças centrado no ponto, mais a posição do
 * pino em pixels dentro do mosaico.
 */
export function mosaico(lat: number, lng: number, zoom: number, colunas = 3, linhas = 2) {
  const c = coordenadaDaPeca(lat, lng, zoom);
  const centroX = Math.floor(c.x);
  const centroY = Math.floor(c.y);
  const x0 = centroX - Math.floor(colunas / 2);
  const y0 = centroY - Math.floor(linhas / 2);

  const pecas: Peca[] = [];
  for (let l = 0; l < linhas; l++) {
    for (let col = 0; col < colunas; col++) {
      const x = x0 + col;
      const y = y0 + l;
      pecas.push({ x, y, url: urlDaPeca(x, y, zoom) });
    }
  }

  return {
    pecas,
    largura: colunas * TAMANHO,
    altura: linhas * TAMANHO,
    pino: { x: (c.x - x0) * TAMANHO, y: (c.y - y0) * TAMANHO },
  };
}

/** Link para abrir no app de mapas do aparelho (OSM, que redireciona bem). */
export function linkDoMapa(lat: number, lng: number, zoom = 17): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
}

/** Sem coordenadas, uma busca pelo endereço escrito. */
export function linkDeBusca(endereco: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
}
