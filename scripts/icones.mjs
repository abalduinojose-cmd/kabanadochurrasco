/**
 * Gera os ícones do PWA a partir do logo oficial (`assets/logo-kabana.png`,
 * o arquivo que a loja mandou, com fundo transparente), assentado no carvão
 * com uma brasa no alto.
 *
 * Os ícones maskable respeitam a zona segura: o Android recorta o ícone num
 * círculo de 80% do lado, então o logo fica dentro de ~58% do centro e o fundo
 * sangra até a borda. O "any" e o do iOS (que não recorta em círculo) deixam o
 * logo maior.
 *
 *   node scripts/icones.mjs
 */

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const LOGO = 'assets/logo-kabana.png';

const fundo = (lado) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#5a2604"/>
      <stop offset="55%" stop-color="#1d1410"/>
      <stop offset="100%" stop-color="#120e0b"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>`);

const SAIDAS = [
  { arquivo: 'icone-192.png', lado: 192, ocupa: 0.58 },
  { arquivo: 'icone-512.png', lado: 512, ocupa: 0.58 },
  { arquivo: 'icone-any-512.png', lado: 512, ocupa: 0.84 },
  // iOS não recorta em círculo: o logo pode ocupar mais.
  { arquivo: 'apple-touch-icon.png', lado: 180, ocupa: 0.8 },
  { arquivo: 'icone-48.png', lado: 48, ocupa: 0.9 },
];

sharp.cache(false);
await mkdir('public/icones', { recursive: true });

for (const { arquivo, lado, ocupa } of SAIDAS) {
  const largura = Math.round(lado * ocupa);
  const logo = await sharp(LOGO).resize({ width: largura }).toBuffer();
  const { height } = await sharp(logo).metadata();
  await sharp(fundo(lado))
    .composite([{ input: logo, left: Math.round((lado - largura) / 2), top: Math.round((lado - height) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(`public/icones/${arquivo}`);
  console.log(`✓ public/icones/${arquivo} (${lado}px)`);
}
