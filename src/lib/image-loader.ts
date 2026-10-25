/**
 * Loader do next/image na prévia estática (GitHub Pages).
 *
 * Sem servidor não há otimização sob demanda, e com `src` em texto o
 * next/image não prefixa o subcaminho sozinho. As fotos já são WebP de até
 * 1200px, então vão como estão, só no caminho certo. Fora da prévia este
 * arquivo não é usado (ver next.config.ts).
 */
export default function carregador({ src }: { src: string; width: number; quality?: number }): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  return src.startsWith('/') ? `${base}${src}` : src;
}
