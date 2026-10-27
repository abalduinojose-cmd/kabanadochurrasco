import { telefoneValido } from './mask';
import type { DadosSalvos } from '@/store/cliente';
import type { ModoEntrega } from './delivery';

/**
 * A regra do cadastro, sem tela: o que cada passo exige e como os campos
 * viram os dados salvos. Função pura, então os testes não dependem do React.
 *
 * Passo 1 (você): nome com pelo menos 2 letras e WhatsApp completo.
 * Passo 2 (entrega): para entregar, bairro da lista da loja, rua e número;
 * para retirar na loja, nada (o endereço fica vazio).
 */

export type CamposCadastro = {
  nome: string;
  telefone: string;
  modo: ModoEntrega;
  bairro: string;
  rua: string;
  numero: string;
  complemento: string;
  referencia: string;
};

export type ErrosCadastro = Partial<Record<keyof CamposCadastro, string>>;

export const CADASTRO_VAZIO: CamposCadastro = {
  nome: '',
  telefone: '',
  modo: 'entrega',
  bairro: '',
  rua: '',
  numero: '',
  complemento: '',
  referencia: '',
};

export function errosDoPasso1(c: CamposCadastro): ErrosCadastro {
  const erros: ErrosCadastro = {};
  if (c.nome.trim().length < 2) erros.nome = 'Escreva seu nome.';
  if (!c.telefone.trim()) erros.telefone = 'Escreva seu WhatsApp.';
  else if (!telefoneValido(c.telefone)) erros.telefone = 'Confira o WhatsApp: faltou algum número.';
  return erros;
}

export function errosDoPasso2(c: CamposCadastro, bairros: readonly string[]): ErrosCadastro {
  if (c.modo === 'retirada') return {};
  const erros: ErrosCadastro = {};
  if (!bairros.includes(c.bairro)) erros.bairro = 'Escolha o bairro.';
  if (!c.rua.trim()) erros.rua = 'Escreva a rua.';
  if (!c.numero.trim()) erros.numero = 'Escreva o número.';
  return erros;
}

export function dadosDoCadastro(c: CamposCadastro): DadosSalvos {
  return {
    nome: c.nome.trim().replace(/\s+/g, ' '),
    telefone: c.telefone,
    endereco:
      c.modo === 'entrega'
        ? {
            bairro: c.bairro,
            rua: c.rua.trim(),
            numero: c.numero.trim(),
            complemento: c.complemento.trim() || undefined,
            referencia: c.referencia.trim() || undefined,
          }
        : null,
  };
}

/** "Cliente desde outubro de 2026", a partir da data ISO do cadastro. */
export function clienteDesde(iso: string): string {
  const mes = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(new Date(iso));
  return `Cliente desde ${mes}`;
}
