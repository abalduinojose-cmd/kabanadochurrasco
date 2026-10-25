import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

/**
 * `PAGES=1` liga o modo prévia: exportação estática para o GitHub Pages, que
 * serve o app em /kabanadochurrasco e não tem servidor para otimizar imagem.
 * O build normal (Vercel, Node, qualquer host com domínio próprio) fica como
 * está. Quem roda esse modo é `npm run build:pages` (scripts/pages.mjs).
 */
const isPages = process.env.PAGES === '1';
const basePath = isPages ? '/kabanadochurrasco' : '';
const siteUrl = isPages ? `https://abalduinojose-cmd.github.io${basePath}` : process.env.NEXT_PUBLIC_SITE_URL;

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // Em desenvolvimento o service worker atrapalha mais do que ajuda: serve
  // versão em cache no meio da edição e mascara o que acabou de mudar.
  // Só é ligado em produção, onde o build roda com webpack (ver package.json:
  // o @serwist/next injeta configuração de webpack e o Turbopack a recusa).
  disable: process.env.NODE_ENV !== 'production',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Sem o botão "N" do Next no canto da tela em desenvolvimento.
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    ...(siteUrl ? { NEXT_PUBLIC_SITE_URL: siteUrl } : {}),
  },
  ...(isPages
    ? {
        output: 'export' as const,
        basePath,
        // Gera item/index.html em vez de item.html: o Pages serve o índice da
        // pasta, então a página abre com ou sem barra final.
        trailingSlash: true,
        // Sem servidor, as fotos vão como estão (já são WebP de até 1200px).
        images: { loader: 'custom' as const, loaderFile: './src/lib/image-loader.ts' },
      }
    : {}),
};

export default withSerwist(nextConfig);
