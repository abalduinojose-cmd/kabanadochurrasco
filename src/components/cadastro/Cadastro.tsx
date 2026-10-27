'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bike, Check, ChevronLeft, Lock, MapPin, ReceiptText, Store, Zap } from 'lucide-react';
import { Button, LinkBotao } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { LogoKabana } from '@/components/layout/LogoKabana';
import { useCliente } from '@/store/cliente';
import { useEntrega } from '@/store/entrega';
import { maskTelefone } from '@/lib/mask';
import { CADASTRO_VAZIO, dadosDoCadastro, errosDoPasso1, errosDoPasso2, type CamposCadastro, type ErrosCadastro } from '@/lib/cadastro';
import { formatBRL, toCents } from '@/lib/money';
import { LOJA } from '@/data/loja';

/**
 * O cadastro em dois passos, no visual da fachada: topo no carvão com o logo,
 * o título do passo e a barra de progresso; o formulário numa folha clara de
 * cantos redondos; o botão fixo no rodapé.
 *
 * 1. Você: nome e WhatsApp (com o que o cadastro dá, em três linhas honestas).
 * 2. Entrega: entregar em casa (bairro da lista com a taxa, rua, número,
 *    complemento, referência) ou retirar na loja.
 * Pronto: o resumo e o caminho para o cardápio.
 *
 * Grava em `useCliente.cadastrar` (o checkout passa a vir preenchido) e já
 * deixa "como receber" escolhido em `useEntrega`. Tudo neste aparelho.
 */

type Etapa = 1 | 2 | 'pronto';

const BAIRROS = LOJA.fretes.map((f) => f.bairro);

const TITULOS: Record<`${Etapa}`, { titulo: string; texto: string }> = {
  '1': { titulo: 'Crie seu cadastro', texto: 'Leva um minuto. Depois é só escolher e pedir.' },
  '2': { titulo: 'Onde você recebe?', texto: 'A taxa de entrega sai do seu bairro.' },
  pronto: { titulo: 'Tudo certo!', texto: 'Seu cadastro está salvo neste aparelho.' },
};

const VANTAGENS = [
  { icone: Zap, titulo: 'Checkout já preenchido', texto: 'Nome, WhatsApp e endereço entram sozinhos no pedido.' },
  { icone: Bike, titulo: 'Taxa do seu bairro calculada', texto: 'Na sacola você já vê quanto fica a entrega.' },
  { icone: ReceiptText, titulo: 'Seus pedidos à mão', texto: 'Acompanhe e peça de novo pela aba Pedidos.' },
] as const;

export function Cadastro() {
  const router = useRouter();
  const hidratado = useCliente((s) => s.hidratado);
  const cadastrar = useCliente((s) => s.cadastrar);
  const [etapa, setEtapa] = useState<Etapa>(1);
  const [c, setC] = useState<CamposCadastro>(CADASTRO_VAZIO);
  const [erros, setErros] = useState<ErrosCadastro>({});
  const topo = useRef<HTMLHeadingElement>(null);

  // Quem já tem dados (de um pedido) começa com eles preenchidos.
  const preenchido = useRef(false);
  useEffect(() => {
    if (!hidratado || preenchido.current) return;
    preenchido.current = true;
    const { dados } = useCliente.getState();
    const { modo } = useEntrega.getState();
    if (!dados) return;
    const e = dados.endereco;
    // Cópia única do que já estava salvo, na primeira hidratação (não é um laço de estado).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setC({
      nome: dados.nome,
      telefone: dados.telefone,
      modo: e ? 'entrega' : modo,
      bairro: e?.bairro ?? '',
      rua: e?.rua ?? '',
      numero: e?.numero ?? '',
      complemento: e?.complemento ?? '',
      referencia: e?.referencia ?? '',
    });
  }, [hidratado]);

  function mudar<K extends keyof CamposCadastro>(campo: K, valor: CamposCadastro[K]) {
    setC((atual) => ({ ...atual, [campo]: valor }));
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  function irPara(proxima: Etapa) {
    setEtapa(proxima);
    setErros({});
    window.scrollTo({ top: 0 });
    window.requestAnimationFrame(() => topo.current?.focus({ preventScroll: true }));
  }

  function avancar() {
    if (etapa === 1) {
      const e = errosDoPasso1(c);
      setErros(e);
      if (Object.keys(e).length === 0) irPara(2);
      return;
    }
    const e = errosDoPasso2(c, BAIRROS);
    setErros(e);
    if (Object.keys(e).length > 0) return;
    cadastrar(dadosDoCadastro(c));
    useEntrega.getState().confirmar({ modo: c.modo, bairro: c.modo === 'entrega' ? c.bairro : useEntrega.getState().bairro });
    irPara('pronto');
  }

  function voltar() {
    if (etapa === 2) return irPara(1);
    if (etapa === 'pronto') return router.push('/');
    if (window.history.length > 1) router.back();
    else router.push('/perfil');
  }

  const { titulo, texto } = TITULOS[`${etapa}`];

  return (
    <div className="min-h-dvh bg-brasa">
      <header className="px-4 pb-12 text-white" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
        <div className="mx-auto max-w-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={voltar}
              aria-label={etapa === 'pronto' ? 'Ir para o cardápio' : 'Voltar'}
              className="grid size-10 min-h-10 place-items-center rounded-full bg-white/10 ring-1 ring-inset ring-white/15 active:bg-white/15"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            {etapa !== 'pronto' && <span className="text-[13px] font-semibold text-white/60">Passo {etapa} de 2</span>}
          </div>

          <div className="mt-5 flex items-center gap-4">
            <LogoKabana sizes="76px" alt="" className="w-[76px] shrink-0 drop-shadow-[0_10px_18px_rgba(0,0,0,0.5)]" />
            <div className="min-w-0">
              <h1 ref={topo} tabIndex={-1} className="text-[25px] font-extrabold leading-[1.1] tracking-[-0.025em] outline-none">
                {titulo}
              </h1>
              <p className="mt-1 text-[13.5px] leading-snug text-white/65">{texto}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-1.5" aria-hidden>
            {[1, 2].map((n) => (
              <span key={n} className="h-1 overflow-hidden rounded-full bg-white/15">
                <span
                  className="block h-full origin-left rounded-full bg-fogo transition-transform duration-500 ease-[var(--ease-brasa)]"
                  style={{ transform: `scaleX(${etapa === 'pronto' || etapa >= n ? 1 : 0})` }}
                />
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="relative -mt-6 min-h-[calc(100dvh-180px)] rounded-t-[30px] bg-fundo px-4 pb-40 pt-7">
        <div className="mx-auto max-w-xl">
          {etapa === 1 && (
            <form
              id="form-cadastro"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                avancar();
              }}
              className="space-y-4"
            >
              <Field
                rotulo="Seu nome"
                placeholder="Como o atendente vai te chamar"
                autoComplete="name"
                enterKeyHint="next"
                maxLength={60}
                value={c.nome}
                erro={erros.nome}
                onChange={(e) => mudar('nome', e.target.value)}
              />
              <Field
                rotulo="WhatsApp"
                placeholder="(24) 99999-0000"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="done"
                value={c.telefone}
                erro={erros.telefone}
                dica="É por ele que a loja confirma o seu pedido."
                onChange={(e) => mudar('telefone', maskTelefone(e.target.value))}
              />

              <ul className="!mt-7 space-y-1 rounded-[22px] bg-fundo-2 p-2">
                {VANTAGENS.map(({ icone: Icone, titulo: t, texto: x }) => (
                  <li key={t} className="flex items-start gap-3 rounded-[16px] p-2.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-brasa text-fogo">
                      <Icone className="size-[18px]" aria-hidden />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-[14.5px] font-bold text-texto">{t}</span>
                      <span className="block text-[13px] leading-snug text-texto-2">{x}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </form>
          )}

          {etapa === 2 && (
            <form
              id="form-cadastro"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                avancar();
              }}
              className="space-y-4"
            >
              <div role="radiogroup" aria-label="Como você recebe" className="grid grid-cols-2 gap-1 rounded-[18px] bg-fundo-2 p-1">
                {(
                  [
                    { modo: 'entrega', rotulo: 'Entregar em casa', icone: Bike },
                    { modo: 'retirada', rotulo: 'Retirar na loja', icone: Store },
                  ] as const
                ).map(({ modo, rotulo, icone: Icone }) => {
                  const on = c.modo === modo;
                  return (
                    <button
                      key={modo}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => mudar('modo', modo)}
                      className={`inline-flex h-12 items-center justify-center gap-2 rounded-[14px] text-[14px] font-bold transition-colors ${
                        on ? 'bg-cartao text-texto shadow-[0_1px_0_rgba(0,0,0,0.04),0_4px_14px_-6px_rgba(0,0,0,0.25)]' : 'text-texto-2'
                      }`}
                    >
                      <Icone className={`size-[18px] ${on ? 'text-fogo-texto' : ''}`} aria-hidden />
                      {rotulo}
                    </button>
                  );
                })}
              </div>

              {c.modo === 'entrega' ? (
                <>
                  <Field
                    as="select"
                    rotulo="Bairro"
                    value={c.bairro}
                    erro={erros.bairro}
                    onChange={(e) => mudar('bairro', e.target.value)}
                  >
                    <option value="">Escolha o bairro</option>
                    {LOJA.fretes.map((f) => (
                      <option key={f.bairro} value={f.bairro}>
                        {f.bairro} · {formatBRL(toCents(f.taxa))}
                      </option>
                    ))}
                  </Field>
                  <div className="grid grid-cols-[1fr_5.5rem] gap-3">
                    <Field rotulo="Rua" autoComplete="address-line1" value={c.rua} erro={erros.rua} onChange={(e) => mudar('rua', e.target.value)} />
                    <Field rotulo="Número" inputMode="numeric" value={c.numero} erro={erros.numero} onChange={(e) => mudar('numero', e.target.value)} />
                  </div>
                  <Field rotulo="Complemento (opcional)" placeholder="Apto, bloco, fundos" value={c.complemento} onChange={(e) => mudar('complemento', e.target.value)} />
                  <Field
                    rotulo="Ponto de referência (opcional)"
                    placeholder="Ao lado da padaria"
                    value={c.referencia}
                    onChange={(e) => mudar('referencia', e.target.value)}
                  />
                </>
              ) : (
                <div className="flex items-start gap-3 rounded-[20px] bg-fundo-2 p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-brasa text-fogo">
                    <MapPin className="size-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-bold text-texto">Retirada grátis na loja</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-texto-2">
                      {LOJA.endereco}, {LOJA.cidade}. Você busca quando a loja avisar que está pronto.
                    </p>
                  </div>
                </div>
              )}
            </form>
          )}

          {etapa === 'pronto' && (
            <div className="text-center">
              <span className="mx-auto grid size-[72px] place-items-center rounded-full bg-fogo text-carvao shadow-[0_14px_30px_-12px_rgba(255,106,0,0.8)]">
                <svg viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12.5l4.5 4.5L19 7.5" style={{ strokeDasharray: 48, animation: 'check-traca 420ms var(--ease-expo) 120ms both' }} />
                </svg>
              </span>
              <p className="mt-4 text-[22px] font-extrabold tracking-[-0.02em] text-texto">Cadastro feito, {c.nome.trim().split(' ')[0]}!</p>
              <p className="mt-1 text-[14px] text-texto-2">No próximo pedido o checkout já vem preenchido.</p>

              <dl className="mt-6 divide-y divide-divisor rounded-[22px] bg-fundo-2 px-4 text-left">
                <div className="flex items-center justify-between gap-3 py-3.5">
                  <dt className="text-[13px] text-texto-2">Nome</dt>
                  <dd className="truncate text-[14.5px] font-bold text-texto">{c.nome.trim()}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-3.5">
                  <dt className="text-[13px] text-texto-2">WhatsApp</dt>
                  <dd className="text-[14.5px] font-bold tabular-nums text-texto">{c.telefone}</dd>
                </div>
                <div className="flex items-start justify-between gap-3 py-3.5">
                  <dt className="shrink-0 text-[13px] text-texto-2">{c.modo === 'entrega' ? 'Entrega' : 'Recebe'}</dt>
                  <dd className="text-right text-[14.5px] font-bold text-texto">
                    {c.modo === 'entrega' ? `${c.rua.trim()}, ${c.numero.trim()} • ${c.bairro}` : 'Retira na loja'}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 grid gap-2.5">
                <LinkBotao href="/" className="w-full">
                  Ver o cardápio
                </LinkBotao>
                <LinkBotao href="/perfil" variante="secundario" className="w-full">
                  Ir para o meu perfil
                </LinkBotao>
              </div>
            </div>
          )}

          {etapa !== 'pronto' && (
            <p className="mt-6 flex items-start gap-2 text-[12.5px] leading-snug text-texto-2">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                Seus dados ficam só neste aparelho e vão junto na mensagem de cada pedido.{' '}
                <Link href="/privacidade" className="font-bold text-fogo-texto underline-offset-2 hover:underline">
                  Privacidade
                </Link>
              </span>
            </p>
          )}
        </div>
      </main>

      {etapa !== 'pronto' && (
        <footer className="pb-seguro fixed inset-x-0 bottom-0 z-30 border-t border-divisor bg-cartao/95 px-4 pt-3 backdrop-blur-md">
          <div className="mx-auto max-w-xl">
            <Button type="submit" form="form-cadastro" className="w-full">
              {etapa === 1 ? 'Continuar' : (
                <>
                  <Check className="size-5" strokeWidth={2.6} aria-hidden />
                  Concluir cadastro
                </>
              )}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
