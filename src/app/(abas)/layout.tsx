import { TabBar } from '@/components/shell/TabBar';
import { CapturaInstalacao } from '@/components/shell/CapturaInstalacao';
import { Toast } from '@/components/ui/Toast';

/**
 * A casca das abas: o conteúdo leva `view-transition-name: aba` (fade curto
 * na troca); a doca (abas + sacola), o toast e a captura de instalação ficam
 * fora dele.
 */
export default function LayoutAbas({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-barras" style={{ viewTransitionName: 'aba' }}>
        {children}
      </div>
      <TabBar />
      <Toast />
      <CapturaInstalacao />
    </>
  );
}
