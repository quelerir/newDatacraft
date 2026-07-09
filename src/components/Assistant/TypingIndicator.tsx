import { useThreadIsRunning } from '@assistant-ui/core/react';

export function TypingIndicator() {
  const isRunning = useThreadIsRunning();

  if (!isRunning) return null;

  return (
    <div className="assistant-typing">
      <div className="assistant-avatar assistant-avatar--live">🤖</div>
      <div className="assistant-typing__bubble">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
