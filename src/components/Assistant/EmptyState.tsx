import { useThreadIsEmpty, useThreadIsRunning } from '@assistant-ui/core/react';
import { ChatSuggestions } from './ChatSuggestions';

export function EmptyState() {
  const isEmpty = useThreadIsEmpty();
  const isRunning = useThreadIsRunning();

  if (!isEmpty || isRunning) return null;

  return (
    <div className="assistant-empty-state">
      <div className="assistant-empty-state__eyebrow">AI Search для текущего дашборда</div>
      <div className="assistant-empty-state__icon">🤖</div>
      <h3>Задайте вопрос и получите короткий исследовательский ответ</h3>
      <p>
        Могу быстро собрать выводы по графикам, объяснить просадку метрики, подсветить аномалии и
        предложить следующий шаг анализа.
      </p>
      <ChatSuggestions />
    </div>
  );
}
