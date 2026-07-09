import { ActionBarPrimitive, MessagePrimitive, useMessage } from '@assistant-ui/react';
import { useThreadIsRunning } from '@assistant-ui/core/react';
import { Copy, RefreshCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { AssistantFollowUps } from './AssistantFollowUps';

function formatTime(value: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

export function ChatMessage() {
  const role = useMessage((state) => state.role);
  const createdAt = useMessage((state) => state.createdAt);
  const isLast = useMessage((state) => state.isLast);
  const isRunning = useThreadIsRunning();

  const isUser = role === 'user';

  return (
    <MessagePrimitive.Root
      className={`assistant-message${isUser ? ' is-user' : ' is-assistant'}`}
    >
      <div className="assistant-message__row">
        {!isUser && <div className="assistant-avatar">🤖</div>}

        <div className="assistant-message__content">
          <div className="assistant-message__meta">
            {!isUser ? (
              <span className="assistant-message__badge">Answer</span>
            ) : null}
            <span className="assistant-message__author">
              {isUser ? 'Вы' : 'AI Assistant'}
            </span>
            <span>{formatTime(createdAt)}</span>
          </div>

          <div
            className={`assistant-message__bubble${isUser ? ' is-user' : ''}`}
          >
            <MessagePrimitive.Parts />
          </div>

          {!isUser ? (
            <ActionBarPrimitive.Root
              className="assistant-message__actions"
              autohide="not-last"
              autohideFloat="never"
            >
              <ActionBarPrimitive.Copy className="assistant-message__action-button">
                <Copy size={14} />
                <span>Копировать</span>
              </ActionBarPrimitive.Copy>
              <ActionBarPrimitive.Reload className="assistant-message__action-button">
                <RefreshCcw size={14} />
                <span>Повторить</span>
              </ActionBarPrimitive.Reload>
              <ActionBarPrimitive.FeedbackPositive className="assistant-message__action-button">
                <ThumbsUp size={14} />
              </ActionBarPrimitive.FeedbackPositive>
              <ActionBarPrimitive.FeedbackNegative className="assistant-message__action-button">
                <ThumbsDown size={14} />
              </ActionBarPrimitive.FeedbackNegative>
            </ActionBarPrimitive.Root>
          ) : null}

          {!isUser && isLast && !isRunning ? <AssistantFollowUps /> : null}
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}
