import { LOJA, type DiaSemana } from '@/data/loja';
import { MENU } from '@/data/cardapio';
import { SITE } from '@/data/site';

/**
 * JSON-LD do tipo Restaurant.
 *
 * Negócio de bairro vive de busca local: é isto que faz o Google mostrar
 * horário, faixa de preço e cardápio direto no resultado. Tudo é derivado de
 * `loja.ts` e do cardápio, então nunca fica dessincronizado do site.
 */

const DIAS: Record<DiaSemana, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

function horarios() {
  const spec: Array<Record<string, string>> = [];
  for (const [dia, janelas] of Object.entries(LOJA.horarios)) {
    if (!janelas) continue;
    for (const j of janelas) {
      spec.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${DIAS[Number(dia) as DiaSemana]}`,
        opens: j.abre,
        closes: j.fecha,
      });
    }
  }
  return spec;
}

/** Faixa de preço no padrão do schema.org, derivada do próprio cardápio. */
function faixaDePreco(): string {
  const precos = MENU.flatMap((c) => c.items.map((i) => i.preco));
  if (precos.length === 0) return '$$';
  const medio = precos.reduce((a, b) => a + b, 0) / precos.length;
  return medio < 20 ? '$' : medio < 60 ? '$$' : '$$$';
}

export function JsonLd() {
  const dados = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE.url}#restaurante`,
    name: LOJA.nome,
    description: `${LOJA.tagline} em ${LOJA.cidade}/${LOJA.uf}.`,
    url: SITE.url,
    servesCuisine: ['Churrasco', 'Hambúrguer', 'Brasileira'],
    priceRange: faixaDePreco(),
    currenciesAccepted: 'BRL',
    paymentAccepted: LOJA.pagamentos.map((p) => p.label).join(', '),
    telephone: `+${LOJA.whatsapp}`,
    image: `${SITE.url}/icones/icone-512.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: LOJA.endereco,
      addressLocality: LOJA.cidade,
      addressRegion: LOJA.uf,
      addressCountry: 'BR',
    },
    sameAs: [`https://instagram.com/${LOJA.instagram}`],
    openingHoursSpecification: horarios(),
    hasMenu: {
      '@type': 'Menu',
      name: `Cardápio ${LOJA.nome}`,
      hasMenuSection: MENU.map((categoria) => ({
        '@type': 'MenuSection',
        name: categoria.nome,
        hasMenuItem: categoria.items
          .filter((i) => i.available)
          .map((item) => ({
            '@type': 'MenuItem',
            name: item.nome,
            ...(item.descricao ? { description: item.descricao } : {}),
            offers: {
              '@type': 'Offer',
              price: item.preco.toFixed(2),
              priceCurrency: 'BRL',
            },
          })),
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      // Conteúdo é nosso, vindo de loja.ts e do cardápio: não há entrada de usuário aqui.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}
