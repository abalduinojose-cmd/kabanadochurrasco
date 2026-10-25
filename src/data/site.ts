/**
 * Endereço público do app.
 *
 * TODO ─ trocar pelo domínio real antes de publicar. O sitemap, o JSON-LD e a
 * imagem de compartilhamento usam este valor para montar URL absoluta.
 */
export const SITE = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kabanadochurrasco.com.br',
} as const;
