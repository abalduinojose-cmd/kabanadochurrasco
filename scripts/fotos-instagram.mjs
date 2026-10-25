// Fotos do cardápio a partir do Instagram da loja.
//
// Baixa a versão grande de cada post escolhido (instagram.com/p/<código>/media/?size=l,
// 1080px, sem login), recorta o que tem texto ou logo por cima, converte em WebP e
// grava public/fotos/<id>.webp + src/data/fotos.ts, a capa e os banners.
//
// Como usar (na pasta do projeto):  node scripts/fotos-instagram.mjs
// Os originais ficam em scripts/.cache-fotos/ (pode apagar; baixa de novo).
//
// Para trocar uma foto: ache o código do post (a parte depois de /p/ na URL),
// confira a legenda (scripts/instagram-posts-2026-10-25.json tem todas as legendas
// indexadas por código) e escreva a linha no MAPA abaixo: id do item em menu.ts,
// código, recorte [esquerda, topo, largura, altura] em pixels do original (ou null
// para a foto inteira) e como foi conferida ('legenda' ou 'descricao').
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, statSync, readFileSync, readdirSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projeto = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(projeto, 'package.json'));
const sharp = require('sharp');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36';
const cache = path.join(projeto, 'scripts', '.cache-fotos');
mkdirSync(cache, { recursive: true });

// item do menu.ts -> [post do Instagram, recorte [left, top, width, height] no original, como foi conferido].
// 'legenda' = a legenda do post nomeia o prato; 'descricao' = a foto bate com a descrição do item no instadelivery.
const MAPA = {
  'porcao-de-peixes': ['Dd9f5KVx3Yl', [0, 0, 1080, 1080], 'legenda'],
  'batata-frita-com-carne-seca-com-catupiry': ['DbMFcnERDo4', [60, 400, 933, 700], 'legenda'],
  'caipirinha-kabana': ['DRAClsykXWc', [345, 300, 430, 800], 'legenda'],
  'drinks-kabana': ['DWJvrThEVUr', [0, 250, 1080, 1080], 'legenda'],
  'burguer-de-coracao': ['DMtEwI3xwvd', null, 'legenda'],
  'morango-com-chocolate': ['DMi7eBMR9uS', [0, 80, 1080, 1080], 'legenda'],
  'banana-na-brasa': ['DI669U7R9Xy', [0, 300, 1080, 810], 'legenda'],
  'gelado-de-brownie': ['DIowqeOxXCR', [0, 300, 1080, 810], 'legenda'],
  'queijo-coalho-e-melado-de-cana': ['DDiGfIIxiFB', [210, 310, 693, 520], 'legenda'],
  'costela-burguer': ['Cxx0MT1LdwR', null, 'legenda'],
  'x-frango-bacon': ['Cxxzl7Jr-2h', null, 'legenda'],
  'kabana-2-0': ['Dd9fcLTx1wQ', [0, 120, 1080, 1080], 'descricao'],
  'kabana-burguer-ii': ['Db_KgHeRV5w', [66, 200, 947, 710], 'descricao'],
  'x-churrasco': ['DLqIlkpxEsZ', [0, 350, 560, 560], 'legenda'],
  'pao-com-linguica-kabana': ['DDccVTGR3p8', [330, 430, 660, 650], 'legenda'],
  'medalhao-de-frango': ['C6PPdtggsA4', [0, 310, 870, 380], 'legenda'],
  'tulipa-de-frango': ['DF-sgUnRjHy', [120, 470, 840, 610], 'legenda'],
  'coracao': ['CYpLNrALTxl', [0, 180, 706, 526], 'legenda'],
  'contra-file-com-fritas-serve-3-pessoas': ['DP6sL43kfvq', [0, 0, 1080, 1080], 'descricao'],
  'picanha-da-casa-com-fritas-serve-4-pessoas': ['DIT1USRR2c9', [0, 330, 1080, 730], 'legenda'],
  'aneis-de-cebola': ['CupZPCtLzFl', [520, 60, 560, 560], 'legenda'],
};
const CAPA = ['DTgXzHBkSds', [0, 260, 1080, 760]];
const BANNERS = {
  tabuas: ['DMgCg5pRQg_', [0, 40, 1080, 720]],
  burgers: ['DTvxSGHkdgv', [0, 250, 1080, 720]],
  espetos: ['DdKSc21Nmcx', [0, 300, 1080, 720]],
};

const menu = readFileSync(path.join(projeto, 'src/data/menu.ts'), 'utf-8');
for (const id of Object.keys(MAPA)) if (!menu.includes(`id: '${id}'`)) console.log('AVISO: id fora do menu.ts:', id);

function baixa(code) {
  const arq = path.join(cache, code + '.jpg');
  if (existsSync(arq) && statSync(arq).size > 20000) return arq;
  execFileSync('curl', ['-s', '-L', '-m', '60', '-A', UA, '-o', arq, `https://www.instagram.com/p/${code}/media/?size=l`], { stdio: 'ignore' });
  if (!existsSync(arq) || statSync(arq).size < 20000) throw new Error(`não consegui baixar o post ${code}`);
  return arq;
}

async function gera(code, recorte, destino, largura, qualidade = 80) {
  const origem = baixa(code);
  let img = sharp(origem).rotate();
  const meta = await img.metadata();
  if (recorte) {
    const [left, top, width, height] = recorte;
    img = img.extract({ left, top, width: Math.min(width, meta.width - left), height: Math.min(height, meta.height - top) });
  }
  await img.resize({ width: largura, withoutEnlargement: true }).webp({ quality: qualidade }).toFile(destino);
  const saida = await sharp(destino).metadata();
  return { saida, kb: Math.round(statSync(destino).size / 1024) };
}

const pastaFotos = path.join(projeto, 'public', 'fotos');
mkdirSync(pastaFotos, { recursive: true });
for (const f of readdirSync(pastaFotos)) if (f.endsWith('.webp')) unlinkSync(path.join(pastaFotos, f));
const pastaBanners = path.join(projeto, 'public', 'banners');
mkdirSync(pastaBanners, { recursive: true });
for (const f of readdirSync(pastaBanners)) if (f.endsWith('.webp')) unlinkSync(path.join(pastaBanners, f));

const linhas = [];
let total = 0;
for (const [id, [code, recorte, como]] of Object.entries(MAPA)) {
  const { saida, kb } = await gera(code, recorte, path.join(pastaFotos, `${id}.webp`), 1200);
  total += kb;
  linhas.push(`  '${id}': '/fotos/${id}.webp', // instagram.com/p/${code} (${como === 'legenda' ? 'legenda nomeia o prato' : 'bate com a descrição do item'})`);
  console.log(id.padEnd(44), code, `${saida.width}x${saida.height}`, kb + ' kB');
}
const capa = await gera(CAPA[0], CAPA[1], path.join(pastaFotos, 'capa.webp'), 1600, 78);
console.log('capa'.padEnd(44), CAPA[0], `${capa.saida.width}x${capa.saida.height}`, capa.kb + ' kB');
for (const [nome, [code, recorte]] of Object.entries(BANNERS)) {
  const b = await gera(code, recorte, path.join(pastaBanners, `${nome}.webp`), 1200, 78);
  console.log(('banner ' + nome).padEnd(44), code, `${b.saida.width}x${b.saida.height}`, b.kb + ' kB');
}
console.log('total das fotos de itens:', total, 'kB em', linhas.length, 'itens');

writeFileSync(path.join(projeto, 'src', 'data', 'fotos.ts'), `/**
 * Mapa de fotos: id do item (menu.ts) -> arquivo em /public/fotos.
 *
 * GERADO por scripts/fotos-instagram.mjs (edite o MAPA de lá e rode de novo).
 * Fotos do Instagram da loja (@kabana_do_churrasco), escolhidas pela legenda
 * do post (ou, quando a legenda não nomeia o prato, pela descrição do item no
 * instadelivery), conferidas uma a uma e recortadas para tirar textos e logos
 * sobrepostos; WebP de até 1200px, quadradas ou perto de 4:3. Para uma foto
 * nova fora do Instagram: salve em public/fotos/ e escreva a linha aqui com o
 * id EXATO do item. Item com foto vira destaque e ganha miniatura na lista.
 *
 * Ficaram SEM foto (nenhum post limpo, só arte com texto por cima): Kafta,
 * Frango e Medalhão bovino (espetinhos), BIG K, Kabana Burguer I e III,
 * Toscano, Cheddar e Bacon, Kombo Kids, Trio Kabana e o resto do cardápio.
 */

export const FOTOS: Readonly<Record<string, string>> = {
${linhas.join('\n')}
};

/** Foto do item, se houver. O \`imageUrl\` do próprio menu.ts tem preferência. */
export function fotoDoItem(id: string, imageUrl?: string): string | undefined {
  return imageUrl ?? FOTOS[id];
}
`);
console.log('fotos.ts com', linhas.length, 'itens');
