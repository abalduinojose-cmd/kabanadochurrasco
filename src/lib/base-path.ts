/**
 * Subcaminho em que o app é servido: '' no domínio próprio e
 * '/kabanadochurrasco' na prévia do GitHub Pages (definido em next.config.ts).
 *
 * `next/link`, `next/image` e o roteador já põem o subcaminho sozinhos. Use
 * `comBase()` só onde a URL é montada à mão: manifest, service worker,
 * ícones do <head> e links para compartilhar.
 */
export const BASE_PATH: string = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function comBase(caminho: string): string {
  return `${BASE_PATH}${caminho}`;
}
