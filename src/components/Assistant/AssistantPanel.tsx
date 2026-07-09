import { AssistantRuntimeProvider } from '@assistant-ui/react';
import type { DashboardAssistantContext } from '../../data/dashboardData';
import { AssistantHeader } from './AssistantHeader';
import { AssistantSkillsBar } from './AssistantSkillsBar';
import { AssistantThread } from './AssistantThread';
import { ChatThreadList } from './ChatThreadList';
import { useAssistantRuntime } from './useAssistantRuntime';

type AssistantPanelProps = {
  context: DashboardAssistantContext;
  onResizeStart: (event: React.MouseEvent<HTMLButtonElement>) => void;
  pinnedCharts?: Array<{
    key: string;
    title: string;
    subtitle?: string;
  }>;
  onPinnedChartDrop?: (chartKey: string) => void;
  showChartDropHint?: boolean;
};

function AssistantPanelInner({
  context,
  onResizeStart,
  pinnedCharts,
  onPinnedChartDrop,
  showChartDropHint,
}: AssistantPanelProps) {
  const { runtime, clearSession } = useAssistantRuntime(context);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <aside className="assistant-panel">
        <button
          className="assistant-panel__resize-handle"
          type="button"
          aria-label="Изменить ширину чата"
          onMouseDown={onResizeStart}
        />
        <AssistantHeader onClear={clearSession} />
        <AssistantSkillsBar
          pinnedCharts={pinnedCharts}
          onChartDrop={onPinnedChartDrop}
          showDropHint={showChartDropHint}
        />
        <ChatThreadList />
        <AssistantThread />
      </aside>
    </AssistantRuntimeProvider>
  );
}

export function AssistantPanel({
  context,
  onResizeStart,
  pinnedCharts,
  onPinnedChartDrop,
  showChartDropHint,
}: AssistantPanelProps) {
  return (
    <AssistantPanelInner
      context={context}
      onResizeStart={onResizeStart}
      pinnedCharts={pinnedCharts}
      onPinnedChartDrop={onPinnedChartDrop}
      showChartDropHint={showChartDropHint}
    />
  );
}
