'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Banknote, Bike, Check, Copy, CreditCard, MessageCircle, QrCode, Store } from 'lucide-react';

import { Button, LinkBotao } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import { Escolha } from './Escolha';
import { OrderReview } from './OrderReview';

import { useCarrinho, selSubtotal, selTemAlcool, selUnidadesDeEspeto } from '@/store/cart';
import { useCliente } from '@/store/cliente';
import { useEntrega } from '@/store/entrega';
import { usePedidos } from '@/store/pedidos';
import { useAgora } from '@/lib/use-agora';
import { isOpenNow, nextOpening } from '@/lib/store-hours';
import { formatBRL, parseBRL, toCents } from '@/lib/money';
import { maskTelefone } from '@/lib/mask';
import { FAIXA_ENTREGA, taxaEntrega, trocoPara, type ModoEntrega } from '@/lib/delivery';
import { bloqueiosDoPedido, CATEGORIAS_DE_ESPETO, type Bloqueio } from '@/lib/regras-pedido';
import { esquemaCheckout, type FormCheckout } from '@/lib/validation';
import { nextOrderId } from '@/lib/order-id';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { LOJA } from '@/data/loja';
import type { Pedido } from '@/types/pedido';

/**
 * Checkout em uma página rolável, como o do iFood: entrega ou retirada (já
 * vem da escolha feita na loja, com o bairro), endereço, pagamento com
 * atalhos de troco, seus dados (preenchidos com o último pedido), resumo e
 * o botão único na barra fixa. Validação no blur; os bloqueios de negócio
 * (`lib/regras-pedido.ts`) aparecem acima da barra, com atalho.
 */

const ICONE_PAGAMENTO: Record<string, React.ReactNode> = {
  pix: <QrCode className="size-5" aria-hidden />,
  dinheiro: <Banknote className="size-5" aria-hidden />,
  credito: <CreditCard className="size-5" aria-hidden />,
  debito: <CreditCard className="size-5" aria-hidden />,
};

const ATALHOS_TROCO = ['50,00', '100,00', '200,00'];

export function CheckoutPagina() {
  const router = useRouter();
  const [copiado, setCopiado] = useState(false);

  const hidratado = useCarrinho((s) => s.hidratado);
  const linhas = useCarrinho((s) => s.linhas);
  const subtotal = useCarrinho(selSubtotal);
  const temAlcool = useCarrinho(selTemAlcool);
  const espetos = useCarrinho(selUnidadesDeEspeto(CATEGORIAS_DE_ESPETO));
  const limpar = useCarrinho((s) => s.limpar);
  const registrar = usePedidos((s) => s.registrar);

  const cliente = useCliente((s) => s.dados);
  const clienteHidratado = useCliente((s) => s.hidratado);
  const salvarCliente = useCliente((s) => s.salvar);

  const modoEscolhido = useEntrega((s) => s.modo);
  const bairroEscolhido = useEntrega((s) => s.bairro);
  const entregaHidratada = useEntrega((s) => s.hidratado);
  const definirModoGlobal = useEntrega((s) => s.definir);
  const definirBairroGlobal = useEntrega((s) => s.definirBairro);

  const agora = useAgora();
  const lojaAberta = agora === null ? null : isOpenNow(agora);
  const proximaAbertura = agora === null ? null : nextOpening(agora);

  const form = useForm<FormCheckout>({
    resolver: zodResolver(esquemaCheckout),
    mode: 'onTouched',
    defaultValues: {
      nome: '',
      telefone: '',
      modo: 'entrega',
      bairro: '',
      rua: '',
      numero: '',
      complemento: '',
      referencia: '',
      pagamento: LOJA.pagamentos[0].id,
      trocoPara: '',
      maiorDeIdade: false,
    },
  });

  // Preenche uma vez, depois da hidratação das stores: a escolha feita na
  // loja (modo e bairro) e os dados do último pedido. Na hidratação o
  // primeiro snapshot ainda é o padrão; o persistido só chega no render seguinte.
  const preenchido = useRef(false);
  useEffect(() => {
    if (!clienteHidratado || !entregaHidratada || preenchido.current) return;
    preenchido.current = true;
    form.reset({
      ...form.getValues(),
      nome: cliente?.nome ?? '',
      telefone: cliente?.telefone ?? '',
      modo: LOJA.retiradaNoLocal ? modoEscolhido : 'entrega',
      bairro: bairroEscolhido ?? cliente?.endereco?.bairro ?? '',
      rua: cliente?.endereco?.rua ?? '',
      numero: cliente?.endereco?.numero ?? '',
      complemento: cliente?.endereco?.complemento ?? '',
      referencia: cliente?.endereco?.referencia ?? '',
    });
  }, [clienteHidratado, entregaHidratada, cliente, modoEscolhido, bairroEscolhido, form]);

  const v = form.watch();
  const erros = form.formState.errors;
  const metodo = LOJA.pagamentos.find((p) => p.id === v.pagamento);
  const taxa = taxaEntrega(v.modo, v.bairro || null) ?? 0;
  const total = subtotal + taxa;
  const trocoParaCents = metodo?.pedeTroco ? parseBRL(v.trocoPara ?? '') : null;
  const troco = trocoPara(total, trocoParaCents);

  // O bairro escolhido aqui vale para a loja e a sacola também.
  useEffect(() => {
    if (v.bairro) definirBairroGlobal(v.bairro);
  }, [v.bairro, definirBairroGlobal]);

  const bloqueios: Bloqueio[] = [
    ...bloqueiosDoPedido({
      subtotal,
      unidadesDeEspeto: espetos,
      itens: linhas.length,
      lojaAberta,
      proximaAbertura,
      modo: v.modo,
      bairro: v.bairro || null,
    }),
  ];
  if (temAlcool && !v.maiorDeIdade) {
    bloqueios.push({ id: 'maioridade', mensagem: 'Confirme que é maior de 18 anos para enviar.' });
  }
  if (metodo?.pedeTroco && trocoParaCents !== null && trocoParaCents < total) {
    bloqueios.push({ id: 'troco', mensagem: `O valor para troco não cobre o total de ${formatBRL(total)}.` });
  }
  const podeEnviar = bloqueios.length === 0 && lojaAberta === true;

  function enviar(dados: FormCheckout) {
    if (!podeEnviar) return;
    const quando = new Date();
    const entrega =
      dados.modo === 'entrega'
        ? {
            bairro: dados.bairro ?? '',
            rua: (dados.rua ?? '').trim(),
            numero: (dados.numero ?? '').trim(),
            complemento: dados.complemento?.trim() || undefined,
            referencia: dados.referencia?.trim() || undefined,
          }
        : undefined;
    const pedido: Pedido = {
      id: nextOrderId(quando),
      criadoEm: quando.getTime(),
      cliente: { nome: dados.nome.trim(), telefone: dados.telefone },
      linhas,
      modo: dados.modo,
      entrega,
      subtotalCents: subtotal,
      taxaEntregaCents: taxa,
      totalCents: total,
      pagamento: {
        id: dados.pagamento,
        label: metodo?.label ?? dados.pagamento,
        trocoParaCents: trocoParaCents ?? undefined,
        trocoCents: troco ?? undefined,
      },
      temAlcool,
      maiorDeIdade: dados.maiorDeIdade,
    };

    registrar(pedido);
    salvarCliente({ nome: pedido.cliente.nome, telefone: pedido.cliente.telefone, endereco: entrega ?? cliente?.endereco ?? null });
    window.open(buildWhatsAppUrl(pedido), '_blank', 'noopener');
    // A sacola só esvazia depois de o pedido existir no histórico.
    limpar();
    router.push(`/pedido?id=${encodeURIComponent(pedido.id)}`);
  }

  if (!hidratado) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (linhas.length === 0) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-[18px] font-extrabold text-texto">Sua sacola está vazia</p>
        <LinkBotao href="/" className="mt-6">
          Ver cardápio
        </LinkBotao>
      </div>
    );
  }

  const definirModo = (modo: ModoEntrega) => {
    form.setValue('modo', modo, { shouldDirty: true });
    definirModoGlobal(modo);
    if (modo === 'retirada') form.clearErrors(['bairro', 'rua', 'numero']);
  };

  return (
    <form onSubmit={form.handleSubmit(enviar)} noValidate className="pb-56">
      {/* 1. Entrega ou retirada */}
      <Bloco titulo={v.modo === 'entrega' ? 'Entregar no endereço' : 'Retirar na loja'}>
        {LOJA.retiradaNoLocal && (
          <div role="radiogroup" aria-label="Como receber" className="flex rounded-[10px] bg-fundo-2 p-[3px]">
            {(
              [
                { id: 'entrega', rotulo: 'Entrega', icone: <Bike className="size-4" aria-hidden /> },
                { id: 'retirada', rotulo: 'Retirada', icone: <Store className="size-4" aria-hidden /> },
              ] as const
            ).map((o) => {
              const ativo = v.modo === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  onClick={() => definirModo(o.id)}
                  className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[14px] font-semibold transition-colors ${
                    ativo ? 'bg-cartao text-texto shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-texto-2'
                  }`}
                >
                  {o.icone}
                  {o.rotulo}
                </button>
              );
            })}
          </div>
        )}

        {v.modo === 'entrega' ? (
          <>
            <p className="text-[13px] text-texto-2">
              Entrega em {FAIXA_ENTREGA}. A taxa depende do bairro.
            </p>
            <Field as="select" rotulo="Bairro" erro={erros.bairro?.message} {...form.register('bairro')}>
              <option value="">Escolha o bairro</option>
              {LOJA.fretes.map((f) => (
                <option key={f.bairro} value={f.bairro}>
                  {f.bairro} · {formatBRL(toCents(f.taxa))}
                </option>
              ))}
            </Field>
            <div className="grid grid-cols-[1fr_5.5rem] gap-3">
              <Field rotulo="Rua" autoComplete="address-line1" erro={erros.rua?.message} {...form.register('rua')} />
              <Field rotulo="Número" inputMode="numeric" erro={erros.numero?.message} {...form.register('numero')} />
            </div>
            <Field rotulo="Complemento" placeholder="Apto, bloco, fundos" {...form.register('complemento')} />
            <Field rotulo="Ponto de referência" placeholder="Ao lado da padaria" {...form.register('referencia')} />
          </>
        ) : (
          <div className="flex items-start gap-3 rounded-cartao bg-fundo-2 p-3.5">
            <Store className="mt-0.5 size-5 shrink-0 text-texto-2" aria-hidden />
            <div className="text-[14px] leading-snug">
              <p className="font-semibold text-texto">{LOJA.nome}</p>
              <p className="mt-0.5 text-texto-2">
                {LOJA.endereco === 'TODO' ? (
                  <span className="text-vermelho">Endereço ainda não cadastrado em loja.ts</span>
                ) : (
                  `${LOJA.endereco}, ${LOJA.cidade}/${LOJA.uf}`
                )}
              </p>
              <p className="mt-1 font-semibold text-verde">Sem taxa de entrega</p>
            </div>
          </div>
        )}
      </Bloco>

      <div className="separador" />

      {/* 2. Pagamento */}
      <Bloco titulo={v.modo === 'entrega' ? 'Pagamento na entrega' : 'Pagamento na retirada'}>
        <div>
          {LOJA.pagamentos.map((p) => (
            <Escolha
              key={p.id}
              tipo="radio"
              nome="pagamento"
              marcado={v.pagamento === p.id}
              aoMudar={() => form.setValue('pagamento', p.id)}
              icone={ICONE_PAGAMENTO[p.id]}
            >
              {p.label}
            </Escolha>
          ))}
        </div>

        {metodo?.pedeTroco && (
          <div>
            <Field
              rotulo="Troco para quanto?"
              inputMode="decimal"
              placeholder="Ex.: 150,00"
              dica="Deixe em branco se tiver o valor certo."
              {...form.register('trocoPara')}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {ATALHOS_TROCO.map((valor) => {
                const ativo = v.trocoPara === valor;
                return (
                  <button
                    key={valor}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => form.setValue('trocoPara', ativo ? '' : valor, { shouldDirty: true })}
                    className={`h-9 min-h-9 rounded-pilula border px-3 text-[13px] font-semibold transition-colors ${
                      ativo ? 'border-fogo-texto bg-fogo-suave text-fogo-texto' : 'border-borda bg-cartao text-texto-2'
                    }`}
                  >
                    R$ {valor}
                  </button>
                );
              })}
            </div>
            {trocoParaCents !== null && (
              <p
                role="status"
                className={`mt-2 rounded-lg px-3 py-2 text-[13px] ${troco === null ? 'bg-vermelho-suave text-vermelho' : 'bg-verde-suave text-verde'}`}
              >
                {troco === null
                  ? `Esse valor não cobre o total de ${formatBRL(total)}.`
                  : `O entregador leva ${formatBRL(troco)} de troco.`}
              </p>
            )}
          </div>
        )}

        {v.pagamento === 'pix' && (
          <div className="rounded-cartao bg-fundo-2 p-3.5">
            <p className="text-[13px] font-bold text-texto">Chave Pix</p>
            {LOJA.chavePix === 'TODO' ? (
              <p className="mt-1 text-[13px] text-vermelho">Chave Pix ainda não cadastrada em loja.ts</p>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-cartao px-3 py-2 text-[13px] text-texto">{LOJA.chavePix}</code>
                <Button
                  variante="secundario"
                  tamanho="md"
                  onClick={async () => {
                    await navigator.clipboard?.writeText(LOJA.chavePix);
                    setCopiado(true);
                    window.setTimeout(() => setCopiado(false), 2000);
                  }}
                >
                  {copiado ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                  {copiado ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
            )}
            <p className="mt-2 text-legenda text-texto-2">
              O pagamento é combinado direto com a loja pelo WhatsApp. O app não processa cobrança.
            </p>
          </div>
        )}

        {temAlcool && (
          <Escolha
            tipo="checkbox"
            marcado={v.maiorDeIdade}
            aoMudar={() => form.setValue('maiorDeIdade', !v.maiorDeIdade)}
            className="border-b-0"
          >
            Declaro ser maior de 18 anos. A venda de bebida alcoólica para menores é proibida por lei (Lei 13.106/2015).
          </Escolha>
        )}
      </Bloco>

      <div className="separador" />

      {/* 3. Seus dados */}
      <Bloco titulo="Seus dados">
        {cliente && <p className="-mt-2 text-[13px] text-texto-2">Preenchido com os dados do seu último pedido. É só conferir.</p>}
        <Field
          rotulo="Nome"
          placeholder="Como o atendente vai te chamar"
          autoComplete="name"
          erro={erros.nome?.message}
          {...form.register('nome')}
        />
        <Field
          rotulo="WhatsApp"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(24) 99999-0000"
          dica="É por aqui que a loja confirma o pedido."
          erro={erros.telefone?.message}
          {...form.register('telefone')}
          onChange={(e) =>
            form.setValue('telefone', maskTelefone(e.target.value), { shouldValidate: form.formState.isSubmitted })
          }
          value={v.telefone}
        />
      </Bloco>

      <div className="separador" />

      {/* 4. Resumo */}
      <OrderReview linhas={linhas} subtotal={subtotal} taxa={taxa} total={total} modo={v.modo} bairro={v.bairro || null} />

      {/* Barra fixa: avisos, total e o único botão. */}
      <footer className="pb-seguro fixed inset-x-0 bottom-0 z-30 border-t border-divisor bg-cartao px-4 pt-3">
        <div className="mx-auto max-w-2xl">
          {bloqueios.length > 0 && (
            <ul className="mb-3 space-y-1.5">
              {bloqueios.slice(0, 2).map((b) => (
                <li key={b.id} className="flex items-start gap-2 text-[13px] leading-snug text-texto">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-fogo-texto" aria-hidden />
                  <span>
                    {b.mensagem}
                    {b.atalho && (
                      <>
                        {' '}
                        <Link href={b.atalho.href} className="font-bold text-fogo-texto">
                          {b.atalho.texto}
                        </Link>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <p className="text-legenda text-texto-2">Total {v.modo === 'entrega' ? 'com entrega' : ''}</p>
              <p className="text-[17px] font-extrabold tabular-nums text-texto">{formatBRL(total)}</p>
            </div>
            <Button type="submit" className="flex-1" disabled={!podeEnviar}>
              <MessageCircle className="size-5" aria-hidden />
              Fazer pedido
            </Button>
          </div>
        </div>
      </footer>
    </form>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 px-4 py-5">
      <legend className="sr-only">{titulo}</legend>
      <h2 className="text-[15px] font-bold text-texto">{titulo}</h2>
      {children}
    </fieldset>
  );
}
