import { ComposerPrimitive } from '@assistant-ui/react';
import { useAuiState } from '@assistant-ui/store';
import { ArrowUp, Square } from 'lucide-react';

export function ChatInput() {
  const isRunning = useAuiState((state) => state.thread.isRunning);

  return (
    <ComposerPrimitive.Root className="assistant-composer">
      <ComposerPrimitive.Input
        className="assistant-composer__input"
        placeholder="Спросите что-нибудь о текущему дашборду..."
        rows={1}
      />
      {isRunning ? (
        <ComposerPrimitive.Cancel className="assistant-composer__stop">
          <Square size={14} fill="currentColor" />
        </ComposerPrimitive.Cancel>
      ) : (
        <ComposerPrimitive.Send className="assistant-composer__send">
          <ArrowUp size={18} />
        </ComposerPrimitive.Send>
      )}
    </ComposerPrimitive.Root>
  );
}
