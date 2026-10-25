import type { MetadataRoute } from 'next';
import { SITE } from '@/data/site';

// Exigido pela exportação estática da prévia (output: export).
export const dynamic = 'force-static';

/** Só o cardápio entra: carrinho, checkout e pedido são privados do aparelho. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
