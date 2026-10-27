import type { MetadataRoute } from 'next';
import { LOJA } from '@/data/loja';
import { comBase } from '@/lib/base-path';

// Exigido pela exportação estática da prévia (output: export).
export const dynamic = 'force-static';

/** Manifest do PWA, gerado pelo Next a partir da configuração da loja. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${LOJA.nome} ─ ${LOJA.tagline}`,
    short_name: 'Kabana',
    description: `Espetos na brasa, hambúrguer artesanal e porções em ${LOJA.cidade}/${LOJA.uf}. Monte o pedido e envie pelo WhatsApp.`,
    id: comBase('/'),
    start_url: comBase('/'),
    scope: comBase('/'),
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: 'pt-BR',
    dir: 'ltr',
    categories: ['food', 'shopping'],
    // Atalhos ao segurar o ícone: as abas que valem um toque a menos.
    shortcuts: [
      {
        name: 'Pedir de novo',
        short_name: 'Pedidos',
        url: comBase('/pedidos'),
        icons: [{ src: comBase('/icones/icone-192.png'), sizes: '192x192' }],
      },
      {
        name: 'Atendimento na mesa (tablet)',
        short_name: 'Mesa',
        url: comBase('/atendimento'),
        icons: [{ src: comBase('/icones/icone-192.png'), sizes: '192x192' }],
      },
      {
        name: 'Horários e endereço',
        short_name: 'Loja',
        url: comBase('/perfil'),
        icons: [{ src: comBase('/icones/icone-192.png'), sizes: '192x192' }],
      },
    ],
    icons: [
      {
        src: comBase('/icones/icone-192.png'),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: comBase('/icones/icone-512.png'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      { src: comBase('/icones/icone-any-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
