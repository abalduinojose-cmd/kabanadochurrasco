'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { Button } from '@/components/ui/Button';
import { usePedidos } from '@/store/pedidos';
import { useInstalacao } from '@/store/instalacao';

/**
 * Convite para instalar o app na tela inicial, dentro do Início.
 *
 * Nunca no primeiro segundo do primeiro acesso: espera a segunda visita ou o
 * primeiro pedido, e some de vez quando dispensado. O evento nativo vem da
 * store compartilhada (`CapturaInstalacao`), a mesma do botão do Perfil.
 */

const CHAVE_VISITAS = 'kabana:visitas';
const CHAVE_DISPENSADO = 'kabana:convite-dispensado';

/* Conta a visita uma vez por carregamento, mesmo que o efeito rode de novo. */
let visitaContada: number | null = null;
function contarVisita(): number {
  if (visitaContada !== null) return visitaContada;
  try {
    const n = Number(localStorage.getItem(CHAVE_VISITAS) ?? '0') + 1;
    localStorage.setItem(CHAVE_VISITAS, String(n));
    visitaContada = n;
  } catch {
    visitaContada = 1;
  }
  return visitaContada;
}

export function ConviteInstalar() {
  const evento = useInstalacao((s) => s.evento);
  const instalar = useInstalacao((s) => s.instalar);
  const jaPediu = usePedidos((s) => s.pedidos.length > 0);
  const [merece, setMerece] = useState(false);
  const [dispensado, setDispensado] = useState(true);

  useEffect(() => {
    // Lê o storage no próximo tique, fora do corpo do efeito, para não
    // disparar render em cascata na montagem.
    const t = window.setTimeout(() => {
      let foiDispensado = false;
      try {
        foiDispensado = localStorage.getItem(CHAVE_DISPENSADO) === '1';
      } catch {
        // sem storage: trata como não dispensado, mas também não insiste depois
      }
      setDispensado(foiDispensado);
      if (!foiDispensado) setMerece(contarVisita() >= 2 || jaPediu);
    }, 0);
    return () => window.clearTimeout(t);
  }, [jaPediu]);

  function dispensar() {
    setDispensado(true);
    try {
      localStorage.setItem(CHAVE_DISPENSADO, '1');
    } catch {
      // sem storage o convite pode voltar numa próxima visita; aceitável
    }
  }

  if (dispensado || !merece || !evento) return null;

  return (
    <div className="px-4 pt-4">
      <div className="relative flex items-center gap-3 rounded-cartao border border-borda bg-cartao py-3 pl-3 pr-12">
        <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-carvao">
          <BrandMark recorte className="w-8" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-tight text-texto">Instale o app da Kabana</p>
          <p className="mt-0.5 text-[13px] leading-snug text-texto-2">Fica na tela inicial e abre sem navegador.</p>
        </div>
        <Button tamanho="md" onClick={() => void instalar().then(dispensar)}>
          Instalar
        </Button>
        <button
          type="button"
          onClick={dispensar}
          aria-label="Dispensar convite de instalação"
          className="absolute right-0 top-0 grid size-11 place-items-center rounded-full text-texto-2 hover:text-texto"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
