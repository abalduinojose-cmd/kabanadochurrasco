// Fotos das bebidas (e da bomboniere).
//
// Duas fontes, as duas registradas em JSON ao lado deste script:
//  - fotos-produtos.json: foto de produto (lata, garrafa, embalagem) do catálogo
//    público de supermercados do Rio, para itens de marca. Sai recortada no
//    produto, centrada num quadrado branco: public/fotos/produtos/<id>.webp.
//  - fotos-livres.json: foto genérica com licença Creative Commons (Flickr, via
//    Openverse), para itens sem marca definida (caipirinha, doses, vinho da casa,
//    água). Sai em quadrado: public/fotos/bebidas/<id>.webp, com o crédito em
//    src/data/fotos-bebidas.ts (a página Sobre lista os créditos).
//
// Como usar (na pasta do projeto):  node scripts/fotos-bebidas.mjs
// Os originais ficam em scripts/.cache-fotos/bebidas/ (pode apagar; baixa de novo).
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projeto = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(projeto, 'package.json'));
const sharp = require('sharp');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

const produtos = JSON.parse(readFileSync(path.join(projeto, 'scripts', 'fotos-produtos.json'), 'utf-8'));
const livres = JSON.parse(readFileSync(path.join(projeto, 'scripts', 'fotos-livres.json'), 'utf-8'));
const cache = path.join(projeto, 'scripts', '.cache-fotos', 'bebidas');
mkdirSync(cache, { recursive: true });

const menu = readFileSync(path.join(projeto, 'src/data/menu.ts'), 'utf-8');
for (const id of [...Object.keys(produtos), ...Object.keys(livres)]) {
  if (!menu.includes(`id: '${id}'`)) console.log('AVISO: id fora do menu.ts:', id);
}

function baixa(id, url) {
  const arq = path.join(cache, `${id}.jpg`);
  if (existsSync(arq) && statSync(arq).size > 4000) return arq;
  execFileSync('curl', ['-s', '-L', '-m', '60', '-A', UA, '-o', arq, url], { stdio: 'ignore' });
  if (!existsSync(arq) || statSync(arq).size < 4000) throw new Error(`não consegui baixar ${id}: ${url}`);
  return arq;
}

// Algumas fotos de catálogo trazem, ao lado do produto, uma etiqueta da loja
// (faixa colorida com "CERVEJA PURO MALTE 473 ml"). O produto fica no centro da
// foto e a etiqueta numa borda, separados por branco: corta-se na faixa de
// colunas (e depois de linhas) com tinta que contém o centro, ou a mais próxima.
async function semEtiqueta(origem) {
  const { data, info } = await sharp(origem).flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const tinta = (x, y) => {
    const i = (y * w + x) * c;
    return data[i] < 232 || data[i + 1] < 232 || data[i + 2] < 232;
  };
  const faixas = (n, conta) => {
    const marcado = Array.from({ length: n }, (_, i) => conta(i) > 3);
    const lista = [];
    let ini = -1;
    let branco = 0;
    for (let i = 0; i <= n; i++) {
      if (i < n && marcado[i]) {
        if (ini < 0) ini = i;
        branco = 0;
      } else if (ini >= 0) {
        branco += 1;
        if (branco > 10 || i === n) {
          lista.push([ini, i - branco]);
          ini = -1;
          branco = 0;
        }
      }
    }
    return lista;
  };
  const escolhe = (lista, centro) =>
    lista.find(([a, b]) => a <= centro && centro <= b) ??
    lista.reduce((m, f) => (Math.abs((f[0] + f[1]) / 2 - centro) < Math.abs((m[0] + m[1]) / 2 - centro) ? f : m));
  const colunas = faixas(w, (x) => {
    let t = 0;
    for (let y = 0; y < h; y += 2) if (tinta(x, y)) t += 1;
    return t;
  });
  const [x0, x1] = escolhe(colunas, Math.floor(w / 2));
  const linhas = faixas(h, (y) => {
    let t = 0;
    for (let x = x0; x <= x1; x += 2) if (tinta(x, y)) t += 1;
    return t;
  });
  const [y0, y1] = escolhe(linhas, Math.floor(h / 2));
  return sharp(origem)
    .flatten({ background: '#ffffff' })
    .extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 })
    .toBuffer();
}

// Fundo quase branco (cinza 91% ou mais) vira branco puro: sem isso o recorte
// deixa uma caixa cinza-clara em volta do produto.
async function branqueia(entrada) {
  const { data, info } = await sharp(entrada).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i] > 231 && data[i + 1] > 231 && data[i + 2] > 231) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } }).png().toBuffer();
}

function limpa(pasta) {
  mkdirSync(pasta, { recursive: true });
  for (const f of readdirSync(pasta)) if (f.endsWith('.webp')) unlinkSync(path.join(pasta, f));
}

const pastaProdutos = path.join(projeto, 'public', 'fotos', 'produtos');
const pastaBebidas = path.join(projeto, 'public', 'fotos', 'bebidas');
limpa(pastaProdutos);
limpa(pastaBebidas);

const LADO = 600; // quadrado final da foto de produto
const OCUPA = 0.84; // o produto ocupa 84% do lado maior, com respiro em volta

const linhas = [];
let kb = 0;
for (const [id, p] of Object.entries(produtos)) {
  const origem = baixa(id, p.url);
  // Recorta o branco em volta do produto (e a etiqueta do supermercado, quando
  // a foto tem uma) e centraliza num quadrado branco.
  let base = p.etiqueta ? await semEtiqueta(origem) : await sharp(origem).flatten({ background: '#ffffff' }).toBuffer();
  // Ajustes à mão registrados no JSON: recorte fixo e áreas pintadas de branco.
  if (p.recorte) {
    const [left, top, width, height] = p.recorte;
    base = await sharp(base).extract({ left, top, width, height }).toBuffer();
  }
  if (p.apagar) {
    const brancos = p.apagar.map(([left, top, width, height]) => ({
      input: { create: { width, height, channels: 3, background: '#ffffff' } },
      left,
      top,
    }));
    base = await sharp(base).composite(brancos).toBuffer();
  }
  base = await branqueia(base);
  const recortado = await sharp(base).trim({ background: '#ffffff', threshold: 18 }).toBuffer();
  const alvo = Math.round(LADO * OCUPA);
  const encaixado = await sharp(recortado).resize(alvo, alvo, { fit: 'inside', withoutEnlargement: false }).toBuffer();
  const m = await sharp(encaixado).metadata();
  const destino = path.join(pastaProdutos, `${id}.webp`);
  await sharp({ create: { width: LADO, height: LADO, channels: 3, background: '#ffffff' } })
    .composite([{ input: encaixado, left: Math.round((LADO - m.width) / 2), top: Math.round((LADO - m.height) / 2) }])
    .webp({ quality: 82 })
    .toFile(destino);
  kb += statSync(destino).size / 1024;
  linhas.push(`  '${id}': '/fotos/produtos/${id}.webp', // ${p.produto} (${p.loja})`);
}

const creditos = [];
for (const [id, l] of Object.entries(livres)) {
  const origem = baixa(id, l.url);
  const destino = path.join(pastaBebidas, `${id}.webp`);
  await sharp(origem).rotate().resize(800, 800, { fit: 'cover', position: sharp.strategy.attention }).webp({ quality: 80 }).toFile(destino);
  kb += statSync(destino).size / 1024;
  linhas.push(`  '${id}': '/fotos/bebidas/${id}.webp', // foto ilustrativa (${l.licenca.toUpperCase()})`);
  creditos.push({ itemId: id, titulo: l.titulo, autor: l.autor, licenca: `CC ${l.licenca.toUpperCase()}`, pagina: l.pagina });
}

const esc = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
writeFileSync(
  path.join(projeto, 'src', 'data', 'fotos-bebidas.ts'),
  `/**
 * Fotos das bebidas e da bomboniere. GERADO por scripts/fotos-bebidas.mjs.
 *
 * /fotos/produtos/ = foto do produto de marca (lata, garrafa, embalagem) em
 * fundo branco: o app mostra inteira, sem cortar, sobre o cinza do cartão.
 * /fotos/bebidas/ = foto ilustrativa com licença Creative Commons, para item
 * sem marca definida (caipirinha, doses, vinho da casa, água); o crédito de
 * cada uma está em CREDITOS_FOTOS e aparece na página Sobre.
 */

export const FOTOS_BEBIDAS: Readonly<Record<string, string>> = {
${linhas.join('\n')}
};

export type CreditoFoto = { readonly itemId: string; readonly titulo: string; readonly autor: string; readonly licenca: string; readonly pagina: string };

export const CREDITOS_FOTOS: readonly CreditoFoto[] = [
${creditos.map((c) => `  { itemId: '${esc(c.itemId)}', titulo: '${esc(c.titulo)}', autor: '${esc(c.autor)}', licenca: '${esc(c.licenca)}', pagina: '${esc(c.pagina)}' },`).join('\n')}
];
`,
);
console.log(`${Object.keys(produtos).length} fotos de produto + ${Object.keys(livres).length} ilustrativas, ${Math.round(kb)} kB no total`);

// Miniaturas de 384px para os espaços pequenos (ver src/lib/image-loader.ts).
execFileSync('node', [path.join(projeto, 'scripts', 'miniaturas.mjs')], { stdio: 'inherit' });
