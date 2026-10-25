'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { useCliente } from '@/store/cliente';
import { useEntrega } from '@/store/entrega';
import { maskTelefone, telefoneValido } from '@/lib/mask';
import { LOJA } from '@/data/loja';
import { formatBRL, toCents } from '@/lib/money';

/**
 * "Meus dados": o que o checkout vai preencher sozinho no próximo pedido.
 * Tudo opcional; só o telefone é validado quando preenchido. Fica neste
 * aparelho e pode ser apagado aqui.
 */

type Valores = {
  nome: string;
  telefone: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento: string;
  referencia: string;
};

const VAZIO: Valores = { nome: '', telefone: '', bairro: '', rua: '', numero: '', complemento: '', referencia: '' };

export function FormularioDados() {
  const router = useRouter();
  const dados = useCliente((s) => s.dados);
  const hidratado = useCliente((s) => s.hidratado);
  const salvar = useCliente((s) => s.salvar);
  const apagar = useCliente((s) => s.apagar);
  const definirBairro = useEntrega((s) => s.definirBairro);
  const mostrar = useToast((s) => s.mostrar);
  const [confirmandoApagar, setConfirmandoApagar] = useState(false);

  const form = useForm<Valores>({ defaultValues: VAZIO, mode: 'onTouched' });
  const v = form.watch();
  const erros = form.formState.errors;

  const preenchido = useRef(false);
  useEffect(() => {
    if (!hidratado || preenchido.current) return;
    preenchido.current = true;
    form.reset({
      nome: dados?.nome ?? '',
      telefone: dados?.telefone ?? '',
      bairro: dados?.endereco?.bairro ?? '',
      rua: dados?.endereco?.rua ?? '',
      numero: dados?.endereco?.numero ?? '',
      complemento: dados?.endereco?.complemento ?? '',
      referencia: dados?.endereco?.referencia ?? '',
    });
  }, [hidratado, dados, form]);

  function gravar(valores: Valores) {
    const temEndereco = Boolean(valores.bairro && valores.rua.trim() && valores.numero.trim());
    salvar({
      nome: valores.nome.trim(),
      telefone: valores.telefone,
      endereco: temEndereco
        ? {
            bairro: valores.bairro,
            rua: valores.rua.trim(),
            numero: valores.numero.trim(),
            complemento: valores.complemento.trim() || undefined,
            referencia: valores.referencia.trim() || undefined,
          }
        : null,
    });
    if (valores.bairro) definirBairro(valores.bairro);
    mostrar('Dados salvos');
    router.push('/perfil');
  }

  return (
    <form onSubmit={form.handleSubmit(gravar)} noValidate className="pb-32">
      <fieldset className="space-y-4 px-4 py-5">
        <legend className="sr-only">Quem recebe</legend>
        <h2 className="text-[15px] font-bold text-texto">Quem recebe</h2>
        <Field rotulo="Nome" placeholder="Como o atendente vai te chamar" autoComplete="name" {...form.register('nome', { maxLength: 60 })} />
        <Field
          rotulo="WhatsApp"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(24) 99999-0000"
          erro={erros.telefone?.message}
          {...form.register('telefone', {
            validate: (valor) => !valor || telefoneValido(valor) || 'Confira o WhatsApp: faltou algum número.',
          })}
          onChange={(e) => form.setValue('telefone', maskTelefone(e.target.value), { shouldValidate: form.formState.isSubmitted })}
          value={v.telefone}
        />
      </fieldset>

      <div className="separador" />

      <fieldset className="space-y-4 px-4 py-5">
        <legend className="sr-only">Endereço de entrega</legend>
        <h2 className="text-[15px] font-bold text-texto">Endereço de entrega</h2>
        <Field as="select" rotulo="Bairro" {...form.register('bairro')}>
          <option value="">Escolha o bairro</option>
          {LOJA.fretes.map((f) => (
            <option key={f.bairro} value={f.bairro}>
              {f.bairro} · {formatBRL(toCents(f.taxa))}
            </option>
          ))}
        </Field>
        <div className="grid grid-cols-[1fr_5.5rem] gap-3">
          <Field rotulo="Rua" autoComplete="address-line1" {...form.register('rua')} />
          <Field rotulo="Número" inputMode="numeric" {...form.register('numero')} />
        </div>
        <Field rotulo="Complemento" placeholder="Apto, bloco, fundos" {...form.register('complemento')} />
        <Field rotulo="Ponto de referência" placeholder="Ao lado da padaria" {...form.register('referencia')} />
      </fieldset>

      {dados && (
        <div className="px-4 pt-2">
          <button
            type="button"
            onClick={() => {
              if (!confirmandoApagar) {
                setConfirmandoApagar(true);
                window.setTimeout(() => setConfirmandoApagar(false), 3000);
                return;
              }
              apagar();
              form.reset(VAZIO);
              setConfirmandoApagar(false);
              mostrar('Dados apagados deste aparelho');
            }}
            className={`inline-flex min-h-11 items-center gap-2 rounded-botao px-3 text-[14px] font-bold ${
              confirmandoApagar ? 'bg-vermelho-suave text-vermelho' : 'text-vermelho'
            }`}
          >
            <Trash2 className="size-4" aria-hidden />
            {confirmandoApagar ? 'Toque de novo para apagar' : 'Apagar meus dados deste aparelho'}
          </button>
        </div>
      )}

      <footer className="pb-seguro fixed inset-x-0 bottom-0 z-30 border-t border-divisor bg-cartao px-4 pt-3">
        <div className="mx-auto max-w-2xl">
          <Button type="submit" className="w-full">
            Salvar
          </Button>
        </div>
      </footer>
    </form>
  );
}
