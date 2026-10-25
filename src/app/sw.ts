import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Service worker.
 *
 * O cardápio é a casca do app e muda pouco; a fonte e o ícone não mudam nunca.
 * Tudo isso fica em cache para o segundo acesso abrir instantâneo, mesmo na
 * rede ruim de quem está na rua. Sem conexão e sem cache, cai na /~offline com
 * a identidade da marca.
 */

/*
 * O service worker vive na raiz do app (…/sw.js), então a pasta dele é o
 * subcaminho em que o app está servido: '' no domínio próprio,
 * '/kabanadochurrasco' na prévia do GitHub Pages. A prévia é exportada com
 * barra final (~offline/index.html); o build com servidor responde em /~offline.
 */
const BASE = self.location.pathname.replace(/\/[^/]*$/, '');
const OFFLINE = BASE ? `${BASE}/~offline/` : '/~offline';

/*
 * Bump quando a página offline mudar de conteúdo.
 *
 * O manifesto do build só traz arquivos com hash no nome; uma rota HTML não
 * tem hash, então o service worker não descobre sozinho que existe versão
 * nova. Sem esta entrada, o fallback aponta para uma página que nunca foi
 * guardada e a abertura fria sem rede cai na tela de erro do navegador.
 */
const REVISAO_OFFLINE = '2';

const serwist = new Serwist({
  precacheEntries: [
    ...(self.__SW_MANIFEST ?? []),
    { url: OFFLINE, revision: REVISAO_OFFLINE },
  ],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: OFFLINE,
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();
