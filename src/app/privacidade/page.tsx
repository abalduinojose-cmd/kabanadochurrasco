import type { Metadata } from 'next';
import { BarraTopo } from '@/components/layout/BarraTopo';
import { LOJA } from '@/data/loja';

export const metadata: Metadata = { title: 'Privacidade' };

/** O que o app guarda e onde. Curto, porque é curto mesmo: nada sai do aparelho sem a pessoa mandar. */
export default function PrivacidadePage() {
  const blocos = [
    {
      titulo: 'O que fica salvo',
      texto:
        'A sacola, os últimos pedidos, os favoritos, a forma de receber e os dados que você digitou no checkout (nome, WhatsApp e endereço). Tudo fica guardado só neste aparelho, no armazenamento do navegador, para o próximo pedido vir preenchido.',
    },
    {
      titulo: 'O que não fica',
      texto: 'O app não tem cadastro, senha nem servidor próprio. Não guarda cartão e não processa pagamento: o pagamento é combinado direto com a loja.',
    },
    {
      titulo: 'Para onde os dados vão',
      texto: `Só para o WhatsApp da ${LOJA.nome}, e só quando você toca em Fazer pedido: a mensagem com os itens, o endereço e a forma de pagamento abre na sua conversa, e é você quem envia.`,
    },
    {
      titulo: 'Como apagar',
      texto: 'Em Perfil, Meus dados, use "Apagar meus dados deste aparelho". Limpar os dados do site no navegador também apaga tudo.',
    },
  ];

  return (
    <>
      <BarraTopo titulo="Privacidade" voltarPara="/perfil" />
      <main className="mx-auto max-w-2xl px-4 pb-16">
        <h1 className="pt-5 text-[20px] font-extrabold text-texto">Seus dados, no seu aparelho</h1>
        <div className="mt-4 space-y-5">
          {blocos.map((b) => (
            <section key={b.titulo}>
              <h2 className="text-[15px] font-bold text-texto">{b.titulo}</h2>
              <p className="mt-1 text-[14px] leading-relaxed text-texto-2">{b.texto}</p>
            </section>
          ))}
        </div>
        <p className="mt-8 text-legenda text-texto-3">
          {LOJA.nome} • {LOJA.cidade}/{LOJA.uf}
        </p>
      </main>
    </>
  );
}
