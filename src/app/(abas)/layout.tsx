import { TabBar } from '@/components/shell/TabBar';
import { BarraSacola } from '@/components/shell/BarraSacola';
import { CapturaInstalacao } from '@/components/shell/CapturaInstalacao';
import { Toast } from '@/components/ui/Toast';

/**
 * A casca das abas: o conteúdo leva `view-transition-name: aba` (fade curto
 * na troca); barras, toast e captura de instalação ficam fora dele.
 */
export default function LayoutAbas({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-barras" style={{ viewTransitionName: 'aba' }}>
        {children}
      </div>
      <BarraSacola />
      <TabBar />
      <Toast />
      <CapturaInstalacao />
    </>
  );
}
