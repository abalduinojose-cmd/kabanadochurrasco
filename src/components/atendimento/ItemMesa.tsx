'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Stepper } from '@/components/ui/Stepper';
import { GrupoDeOpcoes } from '@/components/item/GrupoDeOpcoes';
import { FotoProduto } from '@/components/inicio/FotoProduto';
import { Janela } from './Janela';
import { ehFotoDeProduto, fotoDoItem } from '@/data/fotos';
import { MAX_OBSERVACAO } from '@/data/grupos-extra';
import { sugestoesDeObservacao } from '@/data/observacoes';
import { formatBRL, toCents } from '@/lib/money';
import { ehAlcoolico, escolhasIniciais, gruposDoItem, obrigatoriosFaltando, precoComOpcoes, type ItemComCategoria } from '@/lib/opcoes';
import type { LinhaCarrinho, OpcaoEscolhida } from '@/types/carrinho';
import type { OptionGroup } from '@/types/menu';

/**
 * O prato aberto no tablet: no tablet deitado, foto grande à esquerda e as
 * escolhas à direita; em pé ou no telefone, foto em cima. Mesmas regras da
 * página do item do delivery (ponto da carne, adicionais, observação com
 * sugestões), e o botão fixo "Adicionar ao pedido R$ X".
 */

type Props = {
  achado: ItemComCategoria;
  aoFechar: () => void;
  aoAdicionar: (linha: Omit<LinhaCarrinho, 'uid'>) => void;
};

export function ItemMesa({ achado, aoFechar, aoAdicionar }: Props) {
  const { item, categoria } = achado;
  const grupos = gruposDoItem(item, categoria.id);
  const [escolhas, setEscolhas] = useState<OpcaoEscolhida[]>(() => escolhasIniciais(grupos));
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');
  const obsId = useId();

  const foto = fotoDoItem(item.id, item.imageUrl);
  const faltando = obrigatoriosFaltando(grupos, escolhas);
  const total = precoComOpcoes(item, escolhas) * quantidade;
  const sugestoes = sugestoesDeObservacao(categoria.id);

  function alternar(grupo: OptionGroup, opcaoId: string) {
    const op = grupo.options.find((o) => o.id === opcaoId);
    if (!op) return;
    const escolhida: OpcaoEscolhida = { grupoId: grupo.id, grupoNome: grupo.nome, opcaoId: op.id, nome: op.nome, precoCents: toCents(op.preco) };
    setEscolhas((atuais) => {
      const jaEstava = atuais.some((e) => e.grupoId === grupo.id && e.opcaoId === opcaoId);
      if (grupo.type === 'single') {
        const semGrupo = atuais.filter((e) => e.grupoId !== grupo.id);
        return jaEstava && !grupo.required ? semGrupo : [...semGrupo, escolhida];
      }
      if (jaEstava) return atuais.filter((e) => !(e.grupoId === grupo.id && e.opcaoId === opcaoId));
      const noGrupo = atuais.filter((e) => e.grupoId === grupo.id).length;
      if (grupo.max !== undefined && noGrupo >= grupo.max) return atuais;
      return [...atuais, escolhida];
    });
  }

  function alternarSugestao(texto: string) {
    const partes = observacao.split(',').map((p) => p.trim()).filter(Boolean);
    const tem = partes.some((p) => p.toLowerCase() === texto.toLowerCase());
    const novas = tem ? partes.filter((p) => p.toLowerCase() !== texto.toLowerCase()) : [...partes, texto];
    setObservacao(novas.join(', ').slice(0, MAX_OBSERVACAO));
  }

  function confirmar() {
    if (faltando.length > 0 || !item.available) return;
    aoAdicionar({
      itemId: item.id,
      categoriaId: categoria.id,
      nome: item.nome,
      precoBaseCents: toCents(item.preco),
      quantidade,
      opcoes: escolhas,
      observacao: observacao.trim() || undefined,
      alcoolico: ehAlcoolico(item),
    });
  }

  return (
    <Janela
      aoFechar={aoFechar}
      titulo={item.nome}
      tituloOculto
      largura="max-w-[920px]"
      semPadding
      rodape={
        <div className="flex items-center gap-3 pb-1">
          <Stepper valor={quantidade} aoMudar={setQuantidade} rotulo={item.nome} />
          <button
            type="button"
            onClick={confirmar}
            disabled={faltando.length > 0 || !item.available}
            className="flex h-14 flex-1 items-center justify-between gap-3 rounded-[18px] bg-fogo px-5 text-[16px] font-extrabold text-carvao shadow-[0_12px_26px_-14px_rgba(255,106,0,0.95)] transition-transform duration-150 active:scale-[0.99] disabled:bg-fundo-2 disabled:text-texto-3 disabled:shadow-none"
          >
            <span>{faltando.length > 0 ? `Escolha: ${faltando.join(', ')}` : 'Adicionar ao pedido'}</span>
            <span className="tabular-nums">{formatBRL(total)}</span>
          </button>
        </div>
      }
    >
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative md:sticky md:top-0 md:self-start">
          {foto ? (
            <div className={`relative aspect-[4/3] md:aspect-auto md:h-[min(680px,calc(92dvh-96px))] ${ehFotoDeProduto(foto) ? 'bg-vitrine' : 'bg-foto'}`}>
              <Image
                src={foto}
                alt={item.nome}
                fill
                sizes="(min-width: 768px) 460px, 100vw"
                className={ehFotoDeProduto(foto) ? 'object-contain p-[14%] mix-blend-multiply' : 'object-cover'}
              />
            </div>
          ) : (
            <FotoProduto alt="" sizes="460px" className="aspect-[4/3] w-full md:aspect-auto md:h-[min(680px,calc(92dvh-96px))]" />
          )}
        </div>

        <div className="px-6 pb-6 pt-5">
          <h3 className="pr-10 text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-texto">{item.nome}</h3>
          {item.descricao && <p className="mt-2 text-[15px] leading-relaxed text-texto-2">{item.descricao}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[20px] font-extrabold tabular-nums text-texto">{formatBRL(toCents(item.preco))}</span>
            {ehAlcoolico(item) && <Badge>+18</Badge>}
            {!item.available && <Badge>Indisponível</Badge>}
          </div>

          {grupos.length > 0 && (
            <div className="-mx-6 mt-5 border-t border-divisor">
              {grupos.map((g) => (
                <GrupoDeOpcoes key={g.id} grupo={g} escolhas={escolhas} aoAlternar={(id) => alternar(g, id)} />
              ))}
            </div>
          )}

          <div className="mt-5">
            <label htmlFor={obsId} className="text-[15px] font-bold text-texto">
              Algum comentário?
            </label>
            {sugestoes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {sugestoes.map((s) => {
                  const ativa = observacao.toLowerCase().includes(s.toLowerCase());
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={ativa}
                      onClick={() => alternarSugestao(s)}
                      className={`h-10 min-h-10 rounded-full border px-3.5 text-[13.5px] font-semibold transition-colors ${
                        ativa ? 'border-fogo-texto bg-fogo-suave text-fogo-texto' : 'border-borda bg-cartao text-texto-2'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            )}
            <textarea
              id={obsId}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value.slice(0, MAX_OBSERVACAO))}
              maxLength={MAX_OBSERVACAO}
              rows={2}
              placeholder="Ex.: tirar a cebola, molho à parte"
              className="mt-2.5 w-full resize-none rounded-[16px] border border-borda bg-cartao px-4 py-3 text-[16px] text-texto placeholder:text-texto-3 focus:border-fogo focus:outline-none"
            />
          </div>
        </div>
      </div>
    </Janela>
  );
}
