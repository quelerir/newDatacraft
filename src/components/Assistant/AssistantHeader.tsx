import { useAui } from '@assistant-ui/store';

type AssistantHeaderProps = {
  onClear: () => Promise<void>;
};

export function AssistantHeader({ onClear }: AssistantHeaderProps) {
  const aui = useAui();

  const handleClear = async () => {
    await onClear();
    aui.thread().reset();
  };

  return (
    <div className="assistant-panel__header">
      <div>
        <div className="assistant-panel__title">🤖 AI Assistant</div>
        <div className="assistant-panel__subtitle">
          <span className="assistant-status-dot" />
          Connected to Chainlit
        </div>
      </div>

      <button className="assistant-clear-button" type="button" onClick={handleClear}>
        Очистить чат
      </button>
    </div>
  );
}
