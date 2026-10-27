/**
 * Carregador do next/image, em todos os ambientes.
 *
 * O app não usa o otimizador do Next: a prévia do GitHub Pages é estática, e
 * no desenvolvimento ele travava com as mais de cem fotos do cardápio pedidas
 * de uma vez. As fotos já saem prontas dos scripts (WebP), em dois tamanhos:
 * a miniatura de 384px (public/fotos/mini/, scripts/miniaturas.mjs) para os
 * espaços pequenos e a foto inteira para os grandes. O navegador escolhe pelo
 * `sizes` de cada imagem. Também põe o subcaminho da prévia (/kabanadochurrasco).
 */

const MINI = 384;

export default function carregador({ src, width }: { src: string; width: number; quality?: number }): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  if (!src.startsWith('/')) return src;
  if (src.startsWith('/fotos/') && !src.startsWith('/fotos/mini/') && width <= MINI) {
    return `${base}/fotos/mini/${src.slice('/fotos/'.length)}`;
  }
  // O logo tem uma versão de 360px para os lugares pequenos (avatar, barra fixa).
  if (src === '/marca/logo-kabana.webp' && width <= 360) return `${base}/marca/logo-kabana-360.webp`;
  // `?g` marca a versão grande (e evita o aviso do Next de carregador que ignora a largura).
  return `${base}${src}?g`;
}
