'use client';

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock3, Search, SearchX, X } from 'lucide-react';
import { LinhaProduto } from '@/components/inicio/LinhaProduto';
import { useBusca, selBuscando } from '@/store/busca';
import { MENU } from '@/data/cardapio';
import { indexar, buscar, type ItemIndexado } from '@/lib/busca';

/**
 * A aba Busca do iFood: campo no topo, buscas recentes enquanto está vazio,
 * resultados agrupados por categoria quando se digita. O termo fica na store
 * para sobreviver à troca de aba; as recentes ficam no localStorage, lidas
 * como store externa (sem setState em efeito, sem divergência de hidratação).
 * Com `aoFechar`, é a camada aberta pela lupa da página inicial: ganha a seta
 * de voltar e fecha ao levar a uma categoria.
 */

const CHAVE_RECENTES = 'kabana:buscas-recentes';
const MAX_RECENTES = 6;

const ouvintes = new Set<() => void>();
function assinar(aoMudar: () => void) {
  ouvintes.add(aoMudar);
  window.addEventListener('storage', aoMudar);
  return () => {
    ouvintes.delete(aoMudar);
    window.removeEventListener('storage', aoMudar);
  };
}

/* O snapshot só troca de referência quando o texto guardado muda. */
let bruto = '';
let lista: readonly string[] = [];
function lerRecentes(): readonly string[] {
  try {
    const atual = localStorage.getItem(CHAVE_RECENTES) ?? '[]';
    if (atual !== bruto) {
      bruto = atual;
      const lido: unknown = JSON.parse(atual);
      lista = Array.isArray(lido) ? lido.filter((x): x is string => typeof x === 'string').slice(0, MAX_RECENTES) : [];
    }
  } catch {
    // sem storage (ou JSON quebrado): fica a última lista boa
  }
  return lista;
}
const NO_SERVIDOR: readonly string[] = [];

function gravarRecentes(nova: readonly string[]) {
  try {
    localStorage.setItem(CHAVE_RECENTES, JSON.stringify(nova));
  } catch {
    // sem storage as recentes só não persistem
  }
  ouvintes.forEach((cb) => cb());
}

const CHIP =
  'inline-flex h-9 items-center rounded-pilula border border-borda bg-cartao px-3.5 text-[13px] font-semibold text-texto-2 hover:bg-fundo-2';

export function PaginaBusca({ aoFechar }: { aoFechar?: () => void } = {}) {
  const termo = useBusca((s) => s.termo);
  const definir = useBusca((s) => s.definir);
  const limpar = useBusca((s) => s.limpar);
  const buscando = useBusca(selBuscando);
  const indice = useMemo(() => indexar(MENU), []);
  const recentes = useSyncExternalStore(assinar, lerRecentes, () => NO_SERVIDOR);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!useBusca.getState().termo) campo.current?.focus();
  }, []);

  function lembrar(t: string) {
    const limpo = t.trim();
    if (!limpo) return;
    gravarRecentes([limpo, ...recentes.filter((r) => r.toLowerCase() !== limpo.toLowerCase())].slice(0, MAX_RECENTES));
  }

  function esquecer(t: string) {
    gravarRecentes(recentes.filter((r) => r !== t));
  }

  const achados = buscando ? buscar(indice, termo) : [];
  const porCategoria = new Map<string, { nome: string; itens: ItemIndexado[] }>();
  for (const a of achados) {
    const grupo = porCategoria.get(a.categoria.id) ?? { nome: a.categoria.nome, itens: [] };
    grupo.itens.push(a);
    porCategoria.set(a.categoria.id, grupo);
  }

  return (
    <div className={`mx-auto max-w-2xl ${aoFechar ? 'pb-10' : 'min-h-dvh'}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          lembrar(termo);
          campo.current?.blur();
        }}
        className="sticky top-0 z-30 bg-cartao px-4 pb-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <label htmlFor="busca" className="sr-only">
          Buscar no cardápio
        </label>
        <div className="flex items-center gap-1.5">
          {aoFechar && (
            <button type="button" onClick={aoFechar} aria-label="Fechar a busca" className="-ml-2 grid size-11 shrink-0 place-items-center rounded-full text-texto hover:bg-fundo-2">
              <ArrowLeft className="size-[22px]" aria-hidden />
            </button>
          )}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-texto-2" aria-hidden />
          <input
            ref={campo}
            id="busca"
            type="search"
            inputMode="search"
            autoComplete="off"
            enterKeyHint="search"
            value={termo}
            onChange={(e) => definir(e.target.value)}
            placeholder="Buscar no cardápio"
            className="h-12 w-full rounded-botao border border-transparent bg-fundo-2 pl-11 pr-11 text-[16px] text-texto placeholder:text-texto-3 focus:border-fogo focus:bg-cartao focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {termo && (
            <button
              type="button"
              onClick={() => {
                limpar();
                campo.current?.focus();
              }}
              aria-label="Limpar busca"
              className="absolute right-1 top-1/2 grid size-10 min-h-10 -translate-y-1/2 place-items-center rounded-full text-texto-2 hover:text-texto"
            >
              <X className="size-5" aria-hidden />
            </button>
          )}
          </div>
        </div>
      </form>

      {!buscando && (
        <div className="px-4 pt-2">
          {recentes.length > 0 && (
            <section>
              <h2 className="text-[15px] font-bold text-texto">Buscas recentes</h2>
              <ul className="mt-1">
                {recentes.map((r) => (
                  <li key={r} className="flex items-center border-b border-divisor last:border-b-0">
                    <button type="button" onClick={() => definir(r)} className="flex min-h-12 flex-1 items-center gap-3 text-left text-[14px] text-texto">
                      <Clock3 className="size-[18px] text-texto-3" aria-hidden />
                      {r}
                    </button>
                    <button
                      type="button"
                      onClick={() => esquecer(r)}
                      aria-label={`Apagar "${r}" das buscas recentes`}
                      className="grid size-11 place-items-center rounded-full text-texto-3 hover:text-texto"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className={recentes.length > 0 ? 'mt-6' : ''}>
            <h2 className="text-[15px] font-bold text-texto">Categorias</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {MENU.map((c) => (
                <Link key={c.id} href={`/#${c.id}`} onClick={aoFechar} className={CHIP}>
                  {c.nome}
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}

      {buscando && achados.length === 0 && (
        <div className="px-6 py-16 text-center">
          <SearchX className="mx-auto size-10 text-texto-3" aria-hidden />
          <p className="mt-4 text-[17px] font-extrabold text-texto">Nenhum resultado para “{termo.trim()}”</p>
          <p className="mx-auto mt-2 max-w-[30ch] text-[14px] text-texto-2">Tente outra palavra ou vá direto a uma categoria.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {MENU.map((c) => (
              <Link key={c.id} href={`/#${c.id}`} onClick={aoFechar} className={CHIP}>
                {c.nome}
              </Link>
            ))}
          </div>
        </div>
      )}

      {buscando && achados.length > 0 && (
        <div role="region" aria-live="polite" aria-label="Resultados da busca" onClickCapture={() => lembrar(termo)}>
          <p className="px-4 pt-2 text-[13px] text-texto-2">
            {achados.length} {achados.length === 1 ? 'resultado' : 'resultados'}
          </p>
          {[...porCategoria.entries()].map(([id, grupo]) => (
            <section key={id} className="px-4 pt-4">
              <h2 className="text-[15px] font-bold text-texto">{grupo.nome}</h2>
              <ul>
                {grupo.itens.map((a) => (
                  <LinhaProduto key={a.item.id} item={a.item} categoriaId={a.categoria.id} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
