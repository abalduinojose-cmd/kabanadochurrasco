/**
 * Build da prévia pública no GitHub Pages.
 *
 *   npm run build:pages
 *
 * Roda o `next build` em modo prévia (PAGES=1: exportação estática, subcaminho
 * /kabanadochurrasco, imagens como estão) e copia o resultado para `docs/`, a
 * pasta que o Pages serve a partir da branch main. Depois é só commit e push.
 *
 * - `.nojekyll` é obrigatório: sem ele o Jekyll ignora `_next/` (underscore) e
 *   o site sobe sem CSS nem JavaScript.
 * - `docs/superpowers/` e `docs/maquete-ifood.html` são documentação interna:
 *   ficam no lugar (e fora do repositório, pelo .gitignore).
 * - A imagem de compartilhamento sai do export sem extensão e o Pages a serve
 *   como octet-stream; renomeada para .png o WhatsApp mostra a miniatura.
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(fileURLToPath(import.meta.url), '..', '..');
const BASE_PATH = '/kabanadochurrasco';
const URL_PREVIA = `https://abalduinojose-cmd.github.io${BASE_PATH}/`;
const SAIDA = join(RAIZ, 'out');
const DOCS = join(RAIZ, 'docs');
const PRESERVAR = new Set(['superpowers', 'maquete-ifood.html']);

rmSync(SAIDA, { recursive: true, force: true });

const build = spawnSync('npm', ['run', 'build'], {
  cwd: RAIZ,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, PAGES: '1' },
});
if (build.status !== 0) process.exit(build.status ?? 1);
if (!existsSync(join(SAIDA, 'index.html'))) {
  console.error('o build não gerou out/index.html: confira output: export no next.config.ts');
  process.exit(1);
}

mkdirSync(DOCS, { recursive: true });
for (const nome of readdirSync(DOCS)) {
  if (!PRESERVAR.has(nome)) rmSync(join(DOCS, nome), { recursive: true, force: true });
}
cpSync(SAIDA, DOCS, { recursive: true });
rmSync(SAIDA, { recursive: true, force: true });
writeFileSync(join(DOCS, '.nojekyll'), '');

// O Next 16.3 exporta os arquivos de prefetch por segmento em pastas
// (item/__next.item/__PAGE__.txt), mas o cliente pede o nome achatado com pontos
// (item/__next.item.__PAGE__.txt). Sem a cópia achatada cada prefetch dá 404: a
// navegação ainda funciona, mas perde o prefetch e suja o console.
let achatados = 0;
const achata = (pasta) => {
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (!statSync(caminho).isDirectory()) continue;
    if (!nome.startsWith('__next.')) {
      achata(caminho);
      continue;
    }
    const copia = (sub, prefixo) => {
      for (const n of readdirSync(sub)) {
        const c = join(sub, n);
        if (statSync(c).isDirectory()) copia(c, `${prefixo}.${n}`);
        else {
          cpSync(c, join(pasta, `${prefixo}.${n}`));
          achatados += 1;
        }
      }
    };
    copia(caminho, nome);
  }
};
achata(DOCS);
console.log(`prefetch por segmento: ${achatados} arquivos achatados`);

// Imagem de compartilhamento com extensão, e as referências junto.
const og = join(DOCS, 'opengraph-image');
if (existsSync(og) && statSync(og).isFile()) {
  renameSync(og, `${og}.png`);
  let trocas = 0;
  const visita = (pasta) => {
    for (const nome of readdirSync(pasta)) {
      const caminho = join(pasta, nome);
      if (statSync(caminho).isDirectory()) visita(caminho);
      else if (/\.(html|txt|xml|json|webmanifest)$/.test(nome)) {
        const antes = readFileSync(caminho, 'utf-8');
        const depois = antes.replaceAll(`${BASE_PATH}/opengraph-image?`, `${BASE_PATH}/opengraph-image.png?`)
          .replaceAll(`${BASE_PATH}/opengraph-image"`, `${BASE_PATH}/opengraph-image.png"`)
          .replaceAll(`${BASE_PATH}/opengraph-image\\"`, `${BASE_PATH}/opengraph-image.png\\"`);
        if (depois !== antes) {
          writeFileSync(caminho, depois);
          trocas += 1;
        }
      }
    }
  };
  visita(DOCS);
  console.log(`opengraph-image renomeada para .png (${trocas} arquivos reescritos)`);
}

let arquivos = 0;
let bytes = 0;
const soma = (pasta) => {
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    const info = statSync(caminho);
    if (info.isDirectory()) soma(caminho);
    else {
      arquivos += 1;
      bytes += info.size;
    }
  }
};
soma(DOCS);
console.log(`\ndocs/ pronto: ${arquivos} arquivos, ${(bytes / 1024 / 1024).toFixed(1)} MB, servindo em ${URL_PREVIA}`);
