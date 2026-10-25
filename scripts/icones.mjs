/**
 * Gera os ícones do PWA a partir do conceito da cabana.
 *
 * Nada de foto: o telhado e a chama são o mesmo desenho do app, em SVG, então
 * o ícone nunca sai de sintonia com a marca e não pesa nada no repositório.
 *
 * Os ícones maskable respeitam a zona segura: o Android recorta o ícone num
 * círculo de 80% do lado, então a marca fica dentro de ~60% do centro e o
 * fundo sangra até a borda.
 *
 *   node scripts/icones.mjs
 */

import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const CARVAO = '#0B0B0B';
const FOGO = '#FF6A00';
const FOGO_CLARO = '#FF9D3D';
const FOGO_FUNDO = '#D94A00';

const AGUA = 'M30 266 C235 195, 410 100, 578 32 L594 88 C425 152, 245 245, 30 266 Z';

const CHAMA = `
  <path fill="url(#chama)" d="M0 0 C6 42, 34 56, 44 80 C48 68, 48 56, 45 46
    C68 74, 78 108, 68 138 C56 174, 30 196, 0 196
    C-30 196, -56 174, -68 138 C-78 108, -68 74, -45 46
    C-48 56, -48 68, -44 80 C-34 56, -6 42, 0 0 Z"/>
  <path fill="${FOGO}" opacity="0.92" d="M-92 62 C-84 92, -104 106, -104 132
    C-104 162, -86 186, -62 192 C-84 176, -92 156, -88 134 C-84 112, -96 86, -92 62 Z"/>
  <path fill="${FOGO}" opacity="0.92" d="M92 62 C84 92, 104 106, 104 132
    C104 162, 86 186, 62 192 C84 176, 92 156, 88 134 C84 112, 96 86, 92 62 Z"/>
  <path fill="url(#nucleo)" d="M0 74 C7 104, 26 118, 26 144 C26 168, 14 184, 0 184
    C-14 184, -26 168, -26 144 C-26 118, -7 104, 0 74 Z"/>
`;

/*
 * Recorte no miolo do telhado.
 *
 * A marca inteira tem proporção 4:1 e, num canvas quadrado, viraria um risco
 * fino no meio de muito vazio. O recorte pega a parte mais inclinada das duas
 * águas mais a chama inteira, que é o que lê bem em 48px na tela inicial.
 */
const RECORTE = { x: 395, y: 0, largura: 410, altura: 290 };

/**
 * @param lado    tamanho do canvas
 * @param ocupa   fração do lado ocupada pela LARGURA da marca
 * @param brasa   desenha o brilho de brasa por trás
 */
function svg(lado, ocupa, brasa = true) {
  const larguraMarca = lado * ocupa;
  const escala = larguraMarca / RECORTE.largura;
  const alturaMarca = RECORTE.altura * escala;
  const x = (lado - larguraMarca) / 2;
  const y = (lado - alturaMarca) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">
  <defs>
    <linearGradient id="chama" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${FOGO_FUNDO}"/>
      <stop offset="55%" stop-color="${FOGO}"/>
      <stop offset="100%" stop-color="${FOGO_CLARO}"/>
    </linearGradient>
    <linearGradient id="nucleo" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${FOGO}"/>
      <stop offset="100%" stop-color="#FFD08A"/>
    </linearGradient>
    <radialGradient id="brasa" cx="50%" cy="62%" r="55%">
      <stop offset="0%" stop-color="${FOGO}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${FOGO}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${lado}" height="${lado}" fill="${CARVAO}"/>
  ${brasa ? `<rect width="${lado}" height="${lado}" fill="url(#brasa)"/>` : ''}

  <g transform="translate(${x} ${y}) scale(${escala}) translate(${-RECORTE.x} ${-RECORTE.y})">
    <g fill="${FOGO}">
      <path d="${AGUA}"/>
      <path d="${AGUA}" transform="translate(1200,0) scale(-1,1)"/>
    </g>
    <g transform="translate(600,4) scale(1.42)">${CHAMA}</g>
  </g>
</svg>`;
}

/*
 * Maskable: o Android recorta num círculo de 80% do lado. Com a proporção
 * 1,41:1 do recorte, a maior marca que cabe inteira nesse círculo tem 65% da
 * largura ─ daí o 0.64, com uma folga de segurança.
 */
const SAIDAS = [
  { arquivo: 'icone-192.png', lado: 192, ocupa: 0.64 },
  { arquivo: 'icone-512.png', lado: 512, ocupa: 0.64 },
  // iOS não recorta em círculo: a marca pode ocupar mais.
  { arquivo: 'apple-touch-icon.png', lado: 180, ocupa: 0.78 },
];

await mkdir('public/icones', { recursive: true });

for (const { arquivo, lado, ocupa } of SAIDAS) {
  const buffer = Buffer.from(svg(lado, ocupa));
  await sharp(buffer).png({ compressionLevel: 9 }).toFile(`public/icones/${arquivo}`);
  console.log(`✓ public/icones/${arquivo} (${lado}px)`);
}

// Um SVG solto serve de favicon vetorial, que fica nítido em qualquer tamanho.
await writeFile('public/icones/icone.svg', svg(512, 0.7), 'utf8');
console.log('✓ public/icones/icone.svg');
