'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { BellRing, Check, ChevronRight, LayoutGrid, Search, ShoppingBag, X } from 'lucide-react';
import { LogoKabana } from '@/components/layout/LogoKabana';
import { AvisoHorario } from '@/components/layout/AvisoHorario';
import { useLojaAberta } from '@/lib/use-loja-aberta';
import { CartaoMesa } from './CartaoMesa';
import { ItemMesa } from './ItemMesa';
import { PedidoMesa } from './PedidoMesa';
import { ConferirEnvio, MostrarGarcom, PedidoEnviadoAviso } from './EnvioMesa';
import { MenuGarcom } from './MenuGarcom';
import { useComanda, selContaMesa, selItensComanda, selTotalComanda, type PedidoEnviado } from '@/store/comanda';
import { montarCardapio } from '@/lib/cardapio';
import { normalizar } from '@/lib/busca';
import { formatBRL, toCents } from '@/lib/money';
import { impacto, esmagar } from '@/lib/motion/toque';
import { useValorQueTica } from '@/lib/motion/use-valor-que-tica';
import { acharItem, ehAlcoolico, escolhasIniciais, gruposDoItem, type ItemComCategoria } from '@/lib/opcoes';
import { mensagemChamarGarcom, mensagemPedidoMesa, mensagemPedirConta, rotuloMesa, urlWhatsAppLoja } from '@/lib/mensagem-mesa';
import type { LinhaCarrinho } from '@/types/carrinho';
import type { MenuItem } from '@/types/menu';

/**
 * O cardápio do tablet da mesa.
 *
 * Tablet deitado (a partir de 1024px): barra lateral escura com a marca e as
 * seções (foto, nome, contagem), o cardápio da seção no meio em grade de
 * cartões grandes e o pedido sempre à vista à direita. Tablet em pé e
 * telefone: as seções em pílulas no topo e o pedido numa gaveta, aberta pela
 * barra "Ver pedido". A busca procura em todo o cardápio. O selo da mesa,
 * segurado por 1 s, abre o menu do garçom.
 */

const SEGURAR_MS = 900;

type Etapa = 'nada' | 'conferir' | 'garcom';

export function CardapioMesa({ aoNovoCliente }: { aoNovoCliente: () => void }) {
  const secoes = useMemo(() => montarCardapio(), []);
  const [secaoId, setSecaoId] = useState(secoes[0]?.id ?? '');
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState<ItemComCategoria | null>(null);
  const [gaveta, setGaveta] = useState(false);
  const [nome, setNome] = useState('');
  const [etapa, setEtapa] = useState<Etapa>('nada');
  const [enviado, setEnviado] = useState<{ pedido: PedidoEnviado; url: string | null } | null>(null);
  const [menuGarcom, setMenuGarcom] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  // Fora do horário o cardápio abre e o pedido monta, mas não sai para a cozinha.
  const lojaAberta = useLojaAberta();

  const mesa = useComanda((s) => s.mesa) ?? '';
  const garcom = useComanda((s) => s.garcom);
  const linhas = useComanda((s) => s.linhas);
  const enviados = useComanda((s) => s.enviados);
  const adicionar = useComanda((s) => s.adicionar);
  const registrarEnvio = useComanda((s) => s.registrarEnvio);
  const voltarAsMesas = useComanda((s) => s.voltarAsMesas);
  const total = useComanda(selTotalComanda);
  const itens = useComanda(selItensComanda);
  const conta = useComanda(selContaMesa);
  const totalExibido = useValorQueTica(total, 320);

  const conteudo = useRef<HTMLDivElement>(null);

  // Aviso curto no rodapé ("Adicionado", "Chamamos o garçom").
  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(null), 2200);
    return () => window.clearTimeout(t);
  }, [aviso]);

  const quantidadeNoPedido = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of linhas) m.set(l.itemId, (m.get(l.itemId) ?? 0) + l.quantidade);
    return m;
  }, [linhas]);

  const resultados = useMemo(() => {
    const q = normalizar(busca);
    if (!q) return null;
    const palavras = q.split(/\s+/);
    return secoes.flatMap((s) =>
      s.blocos.flatMap((b) =>
        b.categoria.items
          .filter((i) => {
            const chave = normalizar(`${i.nome} ${i.descricao ?? ''}`);
            return palavras.every((p) => chave.includes(p));
          })
          .map((item) => ({ item, categoriaId: b.categoria.id })),
      ),
    );
  }, [busca, secoes]);

  const secao = secoes.find((s) => s.id === secaoId) ?? secoes[0];

  function irPara(id: string) {
    setSecaoId(id);
    setBusca('');
    conteudo.current?.scrollTo({ top: 0 });
  }

  function receberLinha(linha: Omit<LinhaCarrinho, 'uid'>) {
    adicionar(linha);
    setAberto(null);
    setAviso(`${linha.quantidade > 1 ? `${linha.quantidade}x ` : ''}${linha.nome} no pedido`);
    // O pedido à vista (painel ou barra "Ver pedido") dá o pulso de quem recebeu.
    document.querySelectorAll<HTMLElement>('[data-alvo-pedido]').forEach((el) => {
      if (el.offsetParent) impacto(el);
    });
  }

  function adicionarDireto(item: MenuItem, categoriaId: string, botao: HTMLElement) {
    void esmagar(botao);
    receberLinha({
      itemId: item.id,
      categoriaId,
      nome: item.nome,
      precoBaseCents: toCents(item.preco),
      quantidade: 1,
      opcoes: escolhasIniciais(gruposDoItem(item, categoriaId)),
      alcoolico: ehAlcoolico(item),
    });
  }

  function enviarWhatsApp() {
    const texto = mensagemPedidoMesa({
      mesa,
      garcom,
      nome: nome.trim() || undefined,
      numero: enviados.length + 1,
      linhas,
      totalCents: total,
      contaAnteriorCents: conta,
      agora: new Date(),
    });
    const url = urlWhatsAppLoja(texto);
    window.open(url, '_blank', 'noopener');
    const pedido = registrarEnvio('whatsapp', nome);
    setEtapa('nada');
    setGaveta(false);
    if (pedido) setEnviado({ pedido, url });
    setNome('');
  }

  function confirmarGarcom() {
    const pedido = registrarEnvio('garcom', nome);
    setEtapa('nada');
    setGaveta(false);
    if (pedido) setEnviado({ pedido, url: null });
    setNome('');
  }

  function chamarGarcom() {
    window.open(urlWhatsAppLoja(mensagemChamarGarcom(mesa, garcom)), '_blank', 'noopener');
    setAviso('Chamamos o garçom. Ele já vem.');
  }

  function pedirConta() {
    window.open(urlWhatsAppLoja(mensagemPedirConta(mesa, garcom, enviados.length, conta)), '_blank', 'noopener');
    setAviso('Pedimos a sua conta ao garçom.');
  }

  // Selo da mesa: segurar 0,9 s abre o menu do garçom (cliente não abre sem querer).
  const timer = useRef<number | null>(null);
  const [segurando, setSegurando] = useState(false);
  const iniciarSegurar = () => {
    setSegurando(true);
    timer.current = window.setTimeout(() => {
      setSegurando(false);
      setMenuGarcom(true);
    }, SEGURAR_MS);
  };
  const soltar = () => {
    setSegurando(false);
    if (timer.current) window.clearTimeout(timer.current);
  };
  const seloMesa = (escuro: boolean) => (
    <button
      type="button"
      onPointerDown={iniciarSegurar}
      onPointerUp={soltar}
      onPointerLeave={soltar}
      onPointerCancel={soltar}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={`${rotuloMesa(mesa)}. Garçom: segure para abrir o menu`}
      className={`relative inline-flex h-11 min-h-11 select-none items-center gap-2 overflow-hidden rounded-full px-4 text-[14px] font-extrabold tracking-[0.06em] [-webkit-touch-callout:none] ${
        escuro ? 'bg-white/10 text-white ring-1 ring-inset ring-white/15' : 'bg-carvao text-white'
      }`}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-fogo/40"
        style={{ width: segurando ? '100%' : '0%', transition: segurando ? `width ${SEGURAR_MS}ms linear` : 'width 120ms ease-out' }}
      />
      <span className="relative">{rotuloMesa(mesa)}</span>
    </button>
  );

  const campoBusca = (
    <label className="relative block w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-texto-3" aria-hidden />
      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar no cardápio"
        aria-label="Buscar no cardápio"
        className="h-12 w-full rounded-full border border-transparent bg-fundo-2 pl-12 pr-11 text-[16px] text-texto placeholder:text-texto-3 focus:border-fogo focus:bg-cartao focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {busca && (
        <button type="button" onClick={() => setBusca('')} aria-label="Limpar a busca" className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-texto-2">
          <X className="size-5" aria-hidden />
        </button>
      )}
    </label>
  );

  const grade = (lista: readonly { item: MenuItem; categoriaId: string }[]) => (
    <ul className="grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {lista.map(({ item, categoriaId }) => (
        <CartaoMesa
          key={item.id}
          item={item}
          categoriaId={categoriaId}
          noPedido={quantidadeNoPedido.get(item.id) ?? 0}
          aoAbrir={() => {
            const a = acharItem(item.id);
            if (a) setAberto(a);
          }}
          aoAdicionarDireto={(botao) => adicionarDireto(item, categoriaId, botao)}
        />
      ))}
    </ul>
  );

  const propsPedido = {
    nome,
    aoMudarNome: setNome,
    aoEnviar: () => (lojaAberta === false ? setAviso('O pedido só pode ser enviado no horário de funcionamento.') : setEtapa('conferir')),
    aoChamarGarcom: chamarGarcom,
    aoPedirConta: pedirConta,
  };
  const pedido = <PedidoMesa {...propsPedido} />;
  const pedidoNaGaveta = <PedidoMesa {...propsPedido} aoFechar={() => setGaveta(false)} />;

  return (
    <div className="h-dvh overflow-hidden bg-fundo-2 lg:grid lg:grid-cols-[240px_minmax(0,1fr)_380px]">
      {/* Barra lateral (tablet deitado) */}
      <aside className="hidden h-dvh flex-col bg-carvao text-white lg:flex">
        <div className="flex items-center gap-3 px-5 pb-5 pt-6">
          <span className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-black ring-1 ring-white/15">
            <LogoKabana sizes="40px" alt="" className="w-[40px]" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold leading-tight">Kabana do Churrasco</p>
            <p className="text-[12px] text-white/55">Cardápio da mesa</p>
          </div>
        </div>
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={voltarAsMesas}
            className="flex h-11 w-full items-center gap-2.5 rounded-[14px] bg-white/[0.06] px-3 text-[14px] font-bold text-white/85 ring-1 ring-inset ring-white/10 hover:bg-white/[0.1]"
          >
            <LayoutGrid className="size-[18px] text-fogo" aria-hidden />
            Todas as mesas
          </button>
        </div>
        <nav aria-label="Seções do cardápio" className="min-h-0 flex-1 overflow-y-auto px-3">
          <ul className="space-y-1">
            {secoes.map((s) => {
              const ativa = !resultados && s.id === secao?.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => irPara(s.id)}
                    aria-current={ativa ? 'true' : undefined}
                    className={`relative flex w-full items-center gap-3 rounded-[16px] p-2 text-left transition-colors duration-150 ${ativa ? 'bg-white/[0.1]' : 'hover:bg-white/[0.05]'}`}
                  >
                    {ativa && <span aria-hidden className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-fogo" />}
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-[12px] bg-white/10">
                      {s.foto && <Image src={s.foto} alt="" fill sizes="44px" className="object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[15px] font-bold ${ativa ? 'text-white' : 'text-white/80'}`}>{s.nome}</span>
                      <span className="block text-[12px] text-white/45">{s.total} itens</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="space-y-2.5 border-t border-white/10 p-4">
          {seloMesa(true)}
          <button
            type="button"
            onClick={chamarGarcom}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-white/[0.08] text-[14px] font-bold text-white ring-1 ring-inset ring-white/10 active:bg-white/[0.14]"
          >
            <BellRing className="size-[18px] text-fogo" aria-hidden />
            Chamar garçom
          </button>
        </div>
      </aside>

      {/* Cardápio */}
      <main className="flex h-dvh min-w-0 flex-col">
        <header className="z-10 border-b border-divisor bg-cartao/95 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={voltarAsMesas}
              aria-label="Voltar para todas as mesas"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[14px] bg-carvao px-3 text-[14px] font-bold text-white lg:hidden"
            >
              <LayoutGrid className="size-[18px] text-fogo" aria-hidden />
              <span className="hidden sm:inline">Mesas</span>
            </button>
            <span className="hidden size-11 shrink-0 place-items-center rounded-[14px] bg-carvao sm:grid lg:hidden">
              <LogoKabana sizes="36px" alt="" className="w-[36px]" />
            </span>
            <div className="min-w-0 flex-1">{campoBusca}</div>
            <div className="lg:hidden">{seloMesa(false)}</div>
          </div>
          <AvisoHorario className="mx-4 mb-3 sm:mx-6" />
          <nav aria-label="Seções do cardápio" className="lg:hidden">
            <ul className="sem-barra flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
              {secoes.map((s) => {
                const ativa = !resultados && s.id === secao?.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => irPara(s.id)}
                      aria-current={ativa ? 'true' : undefined}
                      className={`inline-flex h-11 min-h-11 items-center gap-2 whitespace-nowrap rounded-full pl-1.5 pr-4 text-[14px] font-bold transition-colors ${
                        ativa ? 'bg-carvao text-white' : 'bg-fundo-2 text-texto-2'
                      }`}
                    >
                      <span className="relative size-8 overflow-hidden rounded-full bg-foto">
                        {s.foto && <Image src={s.foto} alt="" fill sizes="32px" className="object-cover" />}
                      </span>
                      {s.nome}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </header>

        <div ref={conteudo} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-32 pt-5 sm:px-6 lg:pb-10">
          {resultados ? (
            <>
              <h1 className="text-[26px] font-extrabold tracking-[-0.02em] text-texto">
                {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'} para “{busca.trim()}”
              </h1>
              <div className="mt-4">{resultados.length > 0 ? grade(resultados) : <p className="text-[15px] text-texto-2">Nada com esse nome. Tente outra palavra.</p>}</div>
            </>
          ) : (
            secao && (
              <>
                <div className="relative isolate overflow-hidden rounded-[26px] bg-carvao px-6 py-6 text-white sm:px-8 sm:py-7">
                  {secao.foto && <Image src={secao.foto} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="-z-20 object-cover opacity-55" />}
                  <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/10" />
                  <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-fogo">Cardápio</p>
                  <h1 className="mt-1 text-[34px] font-extrabold leading-none tracking-[-0.03em] sm:text-[40px]">{secao.nome}</h1>
                  <p className="mt-2 text-[15px] text-white/80">
                    {secao.chamada}
                    {secao.aPartirDe !== null && <> • a partir de {formatBRL(secao.aPartirDe)}</>}
                  </p>
                </div>
                {secao.blocos.map((b) => (
                  <section key={b.categoria.id} className="mt-7">
                    {secao.blocos.length > 1 && (
                      <h2 className="mb-3.5 flex items-center gap-3 text-[18px] font-extrabold tracking-[-0.01em] text-texto">
                        {b.titulo}
                        <span className="text-[14px] font-semibold text-texto-3">{b.categoria.items.length}</span>
                        <span aria-hidden className="h-px flex-1 bg-borda" />
                      </h2>
                    )}
                    {grade(b.categoria.items.map((item) => ({ item, categoriaId: b.categoria.id })))}
                  </section>
                ))}
                {(() => {
                  const i = secoes.findIndex((s) => s.id === secao.id);
                  const proxima = secoes[i + 1];
                  return proxima ? (
                    <button
                      type="button"
                      onClick={() => irPara(proxima.id)}
                      className="mt-8 flex w-full items-center justify-between rounded-[20px] bg-cartao px-5 py-4 text-left shadow-[0_0_0_1px_var(--color-borda)] active:brightness-95"
                    >
                      <span>
                        <span className="block text-[12.5px] font-semibold text-texto-2">Próxima seção</span>
                        <span className="block text-[18px] font-extrabold text-texto">{proxima.nome}</span>
                      </span>
                      <ChevronRight className="size-6 text-texto-2" aria-hidden />
                    </button>
                  ) : null;
                })()}
              </>
            )
          )}
        </div>
      </main>

      {/* Pedido (tablet deitado) */}
      <aside className="hidden h-dvh border-l border-divisor lg:block">{pedido}</aside>

      {/* Barra "Ver pedido" (tablet em pé e telefone) */}
      {(itens > 0 || enviados.length > 0) && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(16px,env(safe-area-inset-bottom))] lg:hidden">
          <button
            data-alvo-pedido
            type="button"
            onClick={() => setGaveta(true)}
            className="mx-auto flex h-16 w-full max-w-[640px] items-center gap-3 rounded-[22px] bg-carvao pl-2.5 pr-5 text-white shadow-[0_18px_40px_-14px_rgba(0,0,0,0.6)]"
          >
            <span className="relative grid size-11 place-items-center rounded-[15px] bg-fogo text-carvao">
              <ShoppingBag className="size-5" strokeWidth={2.25} aria-hidden />
              {itens > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-white px-1 text-[12px] font-extrabold tabular-nums text-carvao ring-2 ring-carvao">
                  {itens}
                </span>
              )}
            </span>
            <span className="flex-1 text-left">
              <span className="block text-[16px] font-extrabold">{itens > 0 ? 'Ver pedido' : 'Conta da mesa'}</span>
              <span className="block text-[12.5px] text-white/60">{itens > 0 ? 'Confira e envie para a cozinha' : `${enviados.length} ${enviados.length === 1 ? 'pedido enviado' : 'pedidos enviados'}`}</span>
            </span>
            <span className="text-[18px] font-extrabold tabular-nums">{formatBRL(itens > 0 ? totalExibido : conta)}</span>
          </button>
        </div>
      )}

      {/* Gaveta do pedido (tablet em pé e telefone) */}
      {gaveta && (
        <div className="fixed inset-0 z-40 flex justify-end lg:hidden">
          <button type="button" tabIndex={-1} aria-label="Fechar o pedido" onClick={() => setGaveta(false)} className="anima-veu absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          <div className="anima-janela relative flex h-full w-full max-w-[440px] flex-col shadow-[0_0_60px_rgba(0,0,0,0.35)]">
            {pedidoNaGaveta}
          </div>
        </div>
      )}

      {/* Aviso curto */}
      {aviso && (
        <div role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8">
          <span className="anima-janela inline-flex items-center gap-2 rounded-full bg-carvao px-5 py-3 text-[15px] font-bold text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,0.55)]">
            <Check className="size-[18px] text-fogo" strokeWidth={3} aria-hidden />
            {aviso}
          </span>
        </div>
      )}

      {aberto && <ItemMesa key={aberto.item.id} achado={aberto} aoFechar={() => setAberto(null)} aoAdicionar={receberLinha} />}

      {etapa === 'conferir' && (
        <ConferirEnvio
          mesa={mesa}
          nome={nome}
          linhas={linhas}
          totalCents={total}
          aoFechar={() => setEtapa('nada')}
          aoEnviarWhatsApp={enviarWhatsApp}
          aoMostrarGarcom={() => setEtapa('garcom')}
        />
      )}
      {etapa === 'garcom' && (
        <MostrarGarcom mesa={mesa} nome={nome} linhas={linhas} totalCents={total} aoVoltar={() => setEtapa('conferir')} aoConfirmar={confirmarGarcom} />
      )}
      {enviado && <PedidoEnviadoAviso mesa={mesa} pedido={enviado.pedido} urlWhatsApp={enviado.url} aoContinuar={() => setEnviado(null)} />}
      {menuGarcom && (
        <MenuGarcom
          aoFechar={() => setMenuGarcom(false)}
          aoNovoCliente={() => {
            setMenuGarcom(false);
            aoNovoCliente();
          }}
        />
      )}
    </div>
  );
}
