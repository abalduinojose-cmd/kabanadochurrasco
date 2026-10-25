import { z } from 'zod';
import { telefoneValido } from './mask';
import { BAIRROS } from './delivery';
import { LOJA } from '@/data/loja';

/**
 * Esquemas do checkout.
 *
 * Mensagem de erro é texto que o cliente lê com fome e pressa: diz o que
 * fazer, não o que ele errou. "Faltou o número" e não "campo obrigatório".
 */

const IDS_PAGAMENTO = LOJA.pagamentos.map((p) => p.id) as [string, ...string[]];

export const esquemaCheckout = z
  .object({
    // Passo 1
    nome: z
      .string()
      .trim()
      .min(2, 'Escreva seu nome para o atendente saber quem é.')
      .max(60, 'Nome muito comprido.'),
    telefone: z
      .string()
      .refine(telefoneValido, 'Confira o WhatsApp: faltou algum número.'),

    // Passo 2
    modo: z.enum(['entrega', 'retirada']),
    bairro: z.string().optional(),
    rua: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().max(60).optional(),
    referencia: z.string().max(80).optional(),

    // Passo 3
    pagamento: z.enum(IDS_PAGAMENTO),
    trocoPara: z.string().optional(),
    maiorDeIdade: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.modo !== 'entrega') return;

    if (!v.bairro || !BAIRROS.includes(v.bairro)) {
      ctx.addIssue({
        code: 'custom',
        path: ['bairro'],
        message: 'Escolha o bairro para calcularmos a taxa.',
      });
    }
    if (!v.rua?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['rua'], message: 'Faltou o nome da rua.' });
    }
    if (!v.numero?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['numero'], message: 'Faltou o número.' });
    }
  });

export type FormCheckout = z.infer<typeof esquemaCheckout>;

/** Campos que cada passo precisa ter válidos para o cliente avançar. */
export const CAMPOS_POR_PASSO = {
  1: ['nome', 'telefone'],
  2: ['modo', 'bairro', 'rua', 'numero'],
  3: ['pagamento'],
} as const satisfies Record<1 | 2 | 3, readonly (keyof FormCheckout)[]>;
