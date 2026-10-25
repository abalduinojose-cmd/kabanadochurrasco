// Miniaturas prontas de todas as fotos: public/fotos/mini/<mesmo caminho>.webp, 384px.
//
// O app não usa o otimizador de imagens do Next (a prévia no GitHub Pages é
// estática e não tem servidor). O carregador de src/lib/image-loader.ts serve
// a miniatura quando o espaço da foto é pequeno (linhas, cartões, atalhos) e a
// foto inteira quando é grande (capa, página do item).
//
// Roda sozinho no fim de fotos-instagram.mjs e fotos-bebidas.mjs; à mão:
//   node scripts/miniaturas.mjs
import { createRequire } from 'node:module';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projeto = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(projeto, 'package.json'));
const sharp = require('sharp');

const LARGURA = 384;
const raiz = path.join(projeto, 'public', 'fotos');
const destino = path.join(raiz, 'mini');
rmSync(destino, { recursive: true, force: true });

const arquivos = [];
const varre = (pasta) => {
  for (const nome of readdirSync(pasta)) {
    const caminho = path.join(pasta, nome);
    if (caminho === destino) continue;
    if (statSync(caminho).isDirectory()) varre(caminho);
    else if (nome.endsWith('.webp')) arquivos.push(caminho);
  }
};
varre(raiz);

let kb = 0;
for (const arq of arquivos) {
  const saida = path.join(destino, path.relative(raiz, arq));
  mkdirSync(path.dirname(saida), { recursive: true });
  await sharp(arq).resize({ width: LARGURA, height: LARGURA, fit: 'inside', withoutEnlargement: true }).webp({ quality: 76 }).toFile(saida);
  kb += statSync(saida).size / 1024;
}
console.log(`${arquivos.length} miniaturas de ${LARGURA}px, ${Math.round(kb)} kB no total`);
