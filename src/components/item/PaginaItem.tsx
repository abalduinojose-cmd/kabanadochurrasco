'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { ehFotoDeProduto } from '@/data/fotos';
import { FotoProduto } from '@/components/inicio/FotoProduto';
import { mostrarNaProximaTela } from '@/components/ui/Toast';
import { BotaoCompartilhar } from '@/components/inicio/BotaoCompartilhar';
import { PecaTambem } from '@/components/inicio/PecaTambem';
import { BotaoFavorito } from './BotaoFavorito';
import { GrupoDeOpcoes } from './GrupoDeOpcoes';
import { useCarrinho } from '@/store/cart';
import { fotoDoItem } from '@/data/fotos';
import { MAX_OBSERVACAO } from '@/data/grupos-extra';
import { sugestoesDeObservacao } from '@/data/observacoes';
import { formatBRL, toCents } from '@/lib/money';
import { adicionarComToque } from '@/lib/motion/toque';
import {
  acharItem,
  ehAlcoolico,
  escolhasIniciais,
  gruposDoItem,
  obrigatoriosFaltando,
  precoComOpcoes,
  type ItemComCategoria,
} from '@/lib/opcoes';
import type { OpcaoEscolhida } from '@/types/carrinho';
import type { OptionGroup } from '@/types/menu';

/**
 * A página do item, como a do iFood: foto, nome, descrição, grupos de opção,
 * comentário com sugestões, "Peça também" e a barra fixa com quantidade e
 * "Adicionar R$ X". O preço é o mesmo `precoComOpcoes` que a sacola usa.
 */

function useVoltar() {
  const router = useRouter();
  return () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };
}

const ICONE_FLUTUANTE = 'grid size-10 min-h-10 place-items-center rounded-full bg-white/92 text-texto shadow-sm';
const ICONE_PLANO = 'grid size-11 place-items-center rounded-full text-texto hover:bg-fundo-2';

function BotaoVoltar({ flutuante = false }: { flutuante?: boolean }) {
  const voltar = useVoltar();
  return (
    <button type="button" onClick={voltar} aria-label="Voltar" className={flutuante ? ICONE_FLUTUANTE : ICONE_PLANO}>
      <ChevronLeft className="size-6" aria-hidden />
    </button>
  );
}

export function PaginaItem() {
  const id = useSearchParams().get('id') ?? '';
  const achado = acharItem(id);
  if (!achado) return <NaoEncontrado />;
  // A `key` remonta tudo a cada item: o estado nasce limpo, sem useEffect.
  return <Conteudo key={id} achado={achado} />;
}

function NaoEncontrado() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="flex h-14 items-center px-2">
        <BotaoVoltar />
      </header>
      <div className="px-6 py-16 text-center">
        <p className="text-[18px] font-extrabold">Item não encontrado</p>
        <p className="mt-2 text-[14px] text-texto-2">Ele pode ter saído do cardápio.</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-12 items-center rounded-botao border border-borda px-5 text-[15px] font-semibold text-fogo-texto"
        >
          Ver cardápio
        </Link>
      </div>
    </div>
  );
}

function Conteudo({ achado }: { achado: ItemComCategoria }) {
  const { item, categoria } = achado;
  const voltar = useVoltar();
  const adicionar = useCarrinho((s) => s.adicionar);
  const obsId = useId();

  const grupos = gruposDoItem(item, categoria.id);
  const [escolhas, setEscolhas] = useState<OpcaoEscolhida[]>(() => escolhasIniciais(grupos));
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');
  const [enviando, setEnviando] = useState(false);

  const foto = fotoDoItem(item.id, item.imageUrl);
  const faltando = obrigatoriosFaltando(grupos, escolhas);
  const total = precoComOpcoes(item, escolhas) * quantidade;
  const podeAdicionar = item.available && faltando.length === 0 && !enviando;
  const urlDoItem = typeof window === 'undefined' ? undefined : `${window.location.origin}${window.location.pathname}?id=${encodeURIComponent(item.id)}`;

  function alternar(grupo: OptionGroup, opcaoId: string) {
    const op = grupo.options.find((o) => o.id === opcaoId);
    if (!op) return;
    const escolhida: OpcaoEscolhida = {
      grupoId: grupo.id,
      grupoNome: grupo.nome,
      opcaoId: op.id,
      nome: op.nome,
      precoCents: toCents(op.preco),
    };
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

  /** Chip de sugestão: entra e sai do comentário, separado por vírgula. */
  function alternarSugestao(texto: string) {
    const partes = observacao
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const tem = partes.some((p) => p.toLowerCase() === texto.toLowerCase());
    const novas = tem ? partes.filter((p) => p.toLowerCase() !== texto.toLowerCase()) : [...partes, texto];
    setObservacao(novas.join(', ').slice(0, MAX_OBSERVACAO));
  }
  const sugestaoAtiva = (texto: string) => observacao.toLowerCase().includes(texto.toLowerCase());

  async function confirmar(e: React.MouseEvent<HTMLButtonElement>) {
    if (!podeAdicionar) return;
    const botao = e.currentTarget;
    setEnviando(true);
    // A verdade é imediata; o toque e a volta vêm depois.
    adicionar({
      itemId: item.id,
      categoriaId: categoria.id,
      nome: item.nome,
      precoBaseCents: toCents(item.preco),
      quantidade,
      opcoes: escolhas,
      observacao: observacao.trim() || undefined,
      alcoolico: ehAlcoolico(item),
    });
    await adicionarComToque(botao);
    mostrarNaProximaTela(quantidade === 1 ? 'Adicionado à sacola' : `${quantidade} itens adicionados à sacola`);
    voltar();
  }

  return (
    <div className="min-h-dvh bg-fundo pb-36">
      <div className="relative">
        {foto ? (
          <div className={`relative aspect-[4/3] max-h-[380px] w-full overflow-hidden ${ehFotoDeProduto(foto) ? 'bg-vitrine' : 'bg-foto'}`}>
            <Image
              src={foto}
              alt={item.nome}
              fill
              priority
              sizes="(max-width: 672px) 100vw, 672px"
              className={ehFotoDeProduto(foto) ? 'object-contain px-[18%] pb-[8%] pt-[16%] mix-blend-multiply' : 'object-cover'}
            />
          </div>
        ) : (
          // Sem foto: o logo da casa no carvão, mais baixo que uma foto.
          <FotoProduto alt="" sizes="(max-width: 672px) 100vw, 672px" className="aspect-[16/9] max-h-[300px] w-full" />
        )}
        <div className="absolute inset-x-3 top-[max(12px,env(safe-area-inset-top))] flex items-center justify-between">
          <BotaoVoltar flutuante />
          <div className="flex gap-2">
            <BotaoFavorito itemId={item.id} className={ICONE_FLUTUANTE} />
            <BotaoCompartilhar className={ICONE_FLUTUANTE} url={urlDoItem} titulo={item.nome} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="px-4 pt-4">
          <h1 className="text-[20px] font-extrabold leading-tight text-texto">{item.nome}</h1>
          {item.descricao && <p className="mt-1.5 text-[14px] leading-relaxed text-texto-2">{item.descricao}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[16px] font-extrabold tabular-nums text-texto">{formatBRL(toCents(item.preco))}</span>
            {ehAlcoolico(item) && <Badge>+18</Badge>}
            {item.badges?.includes('mais-pedido') && <Badge tom="fogo">Mais pedido</Badge>}
            {item.badges?.includes('novidade') && <Badge tom="verde">Novidade</Badge>}
            {!item.available && <Badge>Indisponível</Badge>}
          </div>
        </div>

        <div className="separador mt-5" />

        {grupos.map((grupo) => (
          <GrupoDeOpcoes key={grupo.id} grupo={grupo} escolhas={escolhas} aoAlternar={(id) => alternar(grupo, id)} />
        ))}

        <section className="px-4 pt-5">
          <label htmlFor={obsId} className="text-[15px] font-bold text-texto">
            Algum comentário?
          </label>
          <div className="mt-2 flex flex-wrap gap-2 empty:hidden">
            {sugestoesDeObservacao(categoria.id).map((s) => {
              const ativa = sugestaoAtiva(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={ativa}
                  onClick={() => alternarSugestao(s)}
                  className={`h-9 min-h-9 rounded-pilula border px-3 text-[13px] font-semibold transition-colors ${
                    ativa ? 'border-fogo-texto bg-fogo-suave text-fogo-texto' : 'border-borda bg-cartao text-texto-2'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <textarea
            id={obsId}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value.slice(0, MAX_OBSERVACAO))}
            maxLength={MAX_OBSERVACAO}
            rows={3}
            placeholder="Ex: tirar a cebola, maionese à parte etc."
            className="mt-3 w-full resize-none rounded-campo border border-borda bg-cartao px-3.5 py-3 text-[16px] text-texto placeholder:text-texto-3 focus:border-fogo focus:outline-none"
          />
          <p className="mt-1 text-right text-legenda tabular-nums text-texto-3">
            {observacao.length}/{MAX_OBSERVACAO}
          </p>
        </section>

        <PecaTambem titulo="Peça também" categorias={[categoria.id]} excluir={[item.id]} className="pt-4" />
      </div>

      <footer className="pb-seguro fixed inset-x-0 bottom-0 z-40 border-t border-divisor bg-cartao px-4 pt-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Stepper valor={quantidade} aoMudar={setQuantidade} rotulo={item.nome} />
          <Button onClick={(e) => void confirmar(e)} disabled={!podeAdicionar} className="flex-1 px-4">
            <span className="flex-1 text-left">{item.available ? 'Adicionar' : 'Indisponível'}</span>
            <span className="tabular-nums">{formatBRL(total)}</span>
          </Button>
        </div>
        {item.available && faltando.length > 0 && (
          <p className="mx-auto mt-2 max-w-2xl text-center text-legenda text-texto-2">
            Escolha {faltando.join(' e ')} para continuar.
          </p>
        )}
      </footer>
    </div>
  );
}
