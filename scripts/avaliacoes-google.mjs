// Avaliações do Google para a folha da loja.
//
// Lê scripts/avaliacoes-google.json (nota, total, distribuição e as 10 avaliações
// escolhidas, coletadas do Google Maps pelo Apify), baixa a foto de perfil de
// cada pessoa e as fotos que ela postou, converte em WebP em public/avaliacoes/
// e grava src/data/avaliacoes.ts. As fotos ficam no próprio app porque o link do
// Google expira.
//
// Como usar (na pasta do projeto):  node scripts/avaliacoes-google.mjs
// Para trocar as avaliações: colete de novo (ver memória "Avaliações do Google
// via Apify"), edite o JSON e rode este script.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projeto = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(projeto, 'package.json'));
const sharp = require('sharp');
sharp.cache(false);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

const dados = JSON.parse(readFileSync(path.join(projeto, 'scripts', 'avaliacoes-google.json'), 'utf-8'));
const cache = path.join(projeto, 'scripts', '.cache-fotos', 'avaliacoes');
const destino = path.join(projeto, 'public', 'avaliacoes');
mkdirSync(cache, { recursive: true });
rmSync(destino, { recursive: true, force: true });
mkdirSync(destino, { recursive: true });

function baixa(nome, url) {
  const arq = path.join(cache, nome);
  if (existsSync(arq) && statSync(arq).size > 500) return arq;
  execFileSync('curl', ['-s', '-L', '-m', '60', '-A', UA, '-o', arq, url], { stdio: 'ignore' });
  if (!existsSync(arq) || statSync(arq).size < 500) throw new Error(`não consegui baixar ${nome}`);
  return arq;
}

const lista = [];
for (const r of dados.selecao) {
  // Foto de perfil em 160px (o Google aceita o tamanho no fim do endereço).
  // Sem o selo de Guia Local que o Google desenha na foto ("-ba12"): o app mostra a etiqueta.
  const avatarUrl = r.foto.replace(/=s\d+-/, '=s160-').replace('-ba12', '');
  const avatar = baixa(`${r.id}.img`, avatarUrl);
  await sharp(avatar).resize(96, 96, { fit: 'cover' }).webp({ quality: 82 }).toFile(path.join(destino, `${r.id}.webp`));

  const fotos = [];
  for (const [i, u] of r.fotosDaAvaliacao.entries()) {
    const grande = u.replace(/=k-no$/, '=w900-h900-k-no');
    const arq = baixa(`${r.id}-${i}.img`, grande);
    const nome = `${r.id}-${i + 1}.webp`;
    await sharp(arq).rotate().resize({ width: 720, height: 720, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(destino, nome));
    fotos.push(`/avaliacoes/${nome}`);
  }
  lista.push({ ...r, foto: `/avaliacoes/${r.id}.webp`, fotos });
}

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
const linhas = lista
  .map(
    (r) => `  {
    id: '${r.id}',
    nome: '${esc(r.nome)}',
    estrelas: ${r.estrelas},
    quando: '${r.quando}',
    guiaLocal: ${r.guiaLocal},
    texto: '${esc(r.texto)}',
    foto: '${r.foto}',
    fotos: [${r.fotos.map((f) => `'${f}'`).join(', ')}],
  },`,
  )
  .join('\n');

writeFileSync(
  path.join(projeto, 'src', 'data', 'avaliacoes.ts'),
  `/**
 * Avaliações do Google. GERADO por scripts/avaliacoes-google.mjs a partir de
 * scripts/avaliacoes-google.json (coletado em ${dados.coletadoEm}).
 *
 * Nota, total e distribuição são os do perfil no Google Maps. As 10 avaliações
 * mostradas são reais e escolhidas entre as mais relevantes (4 e 5 estrelas com
 * texto); o texto está como a pessoa escreveu. Fotos baixadas para o app.
 */

export type Avaliacao = {
  readonly id: string;
  readonly nome: string;
  readonly estrelas: number;
  /** Data da avaliação (AAAA-MM-DD). */
  readonly quando: string;
  readonly guiaLocal: boolean;
  readonly texto: string;
  readonly foto: string;
  readonly fotos: readonly string[];
};

export const GOOGLE = {
  nota: ${dados.nota},
  total: ${dados.total},
  distribuicao: { 5: ${dados.distribuicao['5']}, 4: ${dados.distribuicao['4']}, 3: ${dados.distribuicao['3']}, 2: ${dados.distribuicao['2']}, 1: ${dados.distribuicao['1']} },
  url: 'https://www.google.com/maps/search/?api=1&query=Kabana%20do%20Churrasco&query_place_id=${dados.placeId}',
  rotas: 'https://www.google.com/maps/dir/?api=1&destination=Kabana%20do%20Churrasco&destination_place_id=${dados.placeId}',
} as const;

export const AVALIACOES: readonly Avaliacao[] = [
${linhas}
];
`,
);
const kb = readdirSync(destino).reduce((t, f) => t + statSync(path.join(destino, f)).size, 0) / 1024;
console.log(`${lista.length} avaliações, ${readdirSync(destino).length} fotos, ${Math.round(kb)} kB`);
