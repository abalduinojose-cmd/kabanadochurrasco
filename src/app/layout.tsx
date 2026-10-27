import type { Metadata, Viewport } from 'next';
import { Anton, Figtree } from 'next/font/google';
import { SerwistProvider } from '@serwist/next/react';
import { JsonLd } from '@/components/layout/JsonLd';
import { LOJA } from '@/data/loja';
import { SITE } from '@/data/site';
import { comBase } from '@/lib/base-path';
import './globals.css';

/* Anton só no logo e no selo da marca. */
const anton = Anton({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  variable: '--fonte-anton',
  display: 'swap',
});

/* Figtree em toda a interface: a mais próxima da fonte do iFood, legível em 13px. */
const figtree = Figtree({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--fonte-figtree',
  display: 'swap',
});

const DESCRICAO = `Espetos na brasa, hambúrguer artesanal e porções em ${LOJA.cidade}/${LOJA.uf}. Monte o pedido no app e envie direto pelo WhatsApp.`;

export const metadata: Metadata = {
  // Só a origem: com a subpasta aqui o Next prefixaria o og:image duas vezes na prévia.
  metadataBase: new URL(new URL(SITE.url).origin),
  title: {
    default: `${LOJA.nome} ─ ${LOJA.tagline}`,
    template: `%s · ${LOJA.nome}`,
  },
  description: DESCRICAO,
  applicationName: 'Kabana',
  keywords: ['espetinho', 'churrasco', 'hambúrguer artesanal', 'delivery', LOJA.cidade, `espetaria ${LOJA.cidade}`],
  alternates: { canonical: `${SITE.url}/` },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: `${SITE.url}/`,
    siteName: LOJA.nome,
    title: `${LOJA.nome} ─ ${LOJA.tagline}`,
    description: DESCRICAO,
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: comBase('/icones/icone-48.png'), sizes: '48x48', type: 'image/png' },
      { url: comBase('/icones/icone-any-512.png'), sizes: '512x512', type: 'image/png' },
    ],
    apple: comBase('/icones/apple-touch-icon.png'),
  },
  appleWebApp: { capable: true, title: 'Kabana', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  other: { 'apple-mobile-web-app-capable': 'yes' },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${figtree.variable}`}>
      <body className="min-h-dvh antialiased">
        <SerwistProvider swUrl={comBase('/sw.js')} disable={process.env.NODE_ENV !== 'production'} reloadOnOnline />
        {children}
        <JsonLd />
      </body>
    </html>
  );
}
