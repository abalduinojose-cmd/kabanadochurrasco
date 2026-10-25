// Fotos do cardápio a partir do Instagram da loja.
//
// Baixa a versão grande de cada post escolhido (instagram.com/p/<código>/media/?size=l,
// 1080px, sem login), recorta o que tem texto ou logo por cima, converte em WebP e
// grava public/fotos/<id>.webp + src/data/fotos.ts e as duas fotos da capa.
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
sharp.cache(false); // no Windows o cache segura o arquivo aberto e impede regravar a capa
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36';
const cache = path.join(projeto, 'scripts', '.cache-fotos');
mkdirSync(cache, { recursive: true });

// item do menu.ts -> [post do Instagram, recorte [left, top, width, height] no original, como foi conferido].
// 'legenda' = a legenda do post nomeia o prato; 'descricao' = a foto bate com a descrição do item no instadelivery.
const MAPA = {
  'porcao-de-peixes': ['Dd9f5KVx3Yl', [0, 0, 1080, 1080], 'legenda'],
  'batata-frita-com-carne-seca-com-catupiry': ['DbMFcnERDo4', [60, 400, 933, 700], 'legenda'],
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
// Fotos dos atalhos do Início que não são de um item (data/secoes.ts).
const EXTRAS = {
  'atalho-acompanhamentos': ['DYU1VPnRBik', [540, 660, 460, 460]], // farofa e vinagrete da tábua
};
// Capa do Início: duas fotos que se alternam (LOJA.capas). Recorte largo, sem texto.
const CAPAS = {
  'capa-1': ['DYU1VPnRBik', [0, 400, 1080, 760]],
  'capa-2': ['DTvxSGHkdgv', [0, 300, 1080, 760]],
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
// Só os arquivos da raiz de public/fotos (as subpastas produtos/ e bebidas/ são do fotos-bebidas.mjs).
for (const f of readdirSync(pastaFotos)) if (f.endsWith('.webp')) unlinkSync(path.join(pastaFotos, f));

const linhas = [];
let total = 0;
for (const [id, [code, recorte, como]] of Object.entries(MAPA)) {
  const { saida, kb } = await gera(code, recorte, path.join(pastaFotos, `${id}.webp`), 1200);
  total += kb;
  linhas.push(`  '${id}': '/fotos/${id}.webp', // instagram.com/p/${code} (${como === 'legenda' ? 'legenda nomeia o prato' : 'bate com a descrição do item'})`);
  console.log(id.padEnd(44), code, `${saida.width}x${saida.height}`, kb + ' kB');
}
for (const [nome, [code, recorte]] of Object.entries(CAPAS)) {
  const capa = await gera(code, recorte, path.join(pastaFotos, `${nome}.webp`), 1600, 80);
  // As fotos da casa são noturnas: a capa ganha luz e um pouco de cor para não pesar sob os véus.
  const arqCapa = path.join(pastaFotos, `${nome}.webp`);
  const clara = await sharp(arqCapa).modulate({ brightness: 1.22, saturation: 1.08 }).linear(1.04, -3).webp({ quality: 80 }).toBuffer();
  writeFileSync(arqCapa, clara);
  console.log(nome.padEnd(44), code, `${capa.saida.width}x${capa.saida.height}`, capa.kb + ' kB');
}
for (const [nome, [code, recorte]] of Object.entries(EXTRAS)) {
  const e = await gera(code, recorte, path.join(pastaFotos, `${nome}.webp`), 600, 80);
  console.log(nome.padEnd(44), code, `${e.saida.width}x${e.saida.height}`, e.kb + ' kB');
}
console.log('total das fotos de itens:', total, 'kB em', linhas.length, 'itens');

writeFileSync(path.join(projeto, 'src', 'data', 'fotos.ts'), `/**
 * Mapa de fotos: id do item (menu.ts) -> arquivo em /public/fotos.
 *
 * GERADO por scripts/fotos-instagram.mjs (edite o MAPA de lá e rode de novo).
 * Pratos: fotos do Instagram da loja (@kabana_do_churrasco), escolhidas pela
 * legenda do post (ou, quando a legenda não nomeia o prato, pela descrição do
 * item no instadelivery), recortadas para tirar textos e logos sobrepostos.
 * Bebidas e bomboniere: data/fotos-bebidas.ts (scripts/fotos-bebidas.mjs).
 * Para uma foto nova fora desses scripts: salve em public/fotos/ e escreva a
 * linha aqui com o id EXATO do item.
 *
 * Ficaram SEM foto (nenhum post limpo, só arte com texto por cima): Kafta,
 * Frango e Medalhão bovino (espetinhos), BIG K, Kabana Burguer I e III,
 * Toscano, Cheddar e Bacon, Kombo Kids, Trio Kabana e parte das porções.
 */

import { FOTOS_BEBIDAS } from './fotos-bebidas';

export const FOTOS: Readonly<Record<string, string>> = {
${linhas.join('\n')}
};

/** Foto do item, se houver. O \`imageUrl\` do próprio menu.ts tem preferência. */
export function fotoDoItem(id: string, imageUrl?: string): string | undefined {
  return imageUrl ?? FOTOS[id] ?? FOTOS_BEBIDAS[id];
}

/**
 * Foto de produto em fundo branco (lata, garrafa, embalagem): mostrada inteira
 * (contain) e mesclada ao cinza do cartão, nunca cortada.
 */
export function ehFotoDeProduto(src: string | undefined): boolean {
  return src?.startsWith('/fotos/produtos/') ?? false;
}
`);
console.log('fotos.ts com', linhas.length, 'itens');

// Miniaturas de 384px para os espaços pequenos (ver src/lib/image-loader.ts).
execFileSync('node', [path.join(projeto, 'scripts', 'miniaturas.mjs')], { stdio: 'inherit' });
