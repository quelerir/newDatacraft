import { MessagePrimitive, useMessage } from '@assistant-ui/react';
import { Clock3 } from 'lucide-react';

function extractTextContent(content: ReadonlyArray<{ type?: string; text?: string }>) {
  return content
    .filter((part) => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text ?? '')
    .join('\n')
    .trim();
}

export function AiChatTaskUserMessage() {
  const content = useMessage((state) => state.content as ReadonlyArray<{ type?: string; text?: string }>);
  const rawText = extractTextContent(content);
  const scheduleMatch = rawText.match(/\n\n> \*\*Исполнить:\*\* (.+)$/s) ?? rawText.match(/\n\nИсполнить:\s*(.+)$/s);
  const scheduleText = scheduleMatch?.[1]?.trim() ?? '';
  const bodyText = scheduleMatch ? rawText.slice(0, scheduleMatch.index).trim() : rawText;

  return (
    <MessagePrimitive.Root className="aui-user-message-root">
      <div className="aui-user-message-content ai-chat-task-user-message">
        {bodyText ? <div className="ai-chat-task-user-message__body">{bodyText}</div> : null}
        {scheduleText ? (
          <div className="ai-chat-task-user-message__schedule">
            <span className="ai-chat-task-user-message__schedule-icon" aria-hidden="true">
              <Clock3 size={16} strokeWidth={2} />
            </span>
            <span className="ai-chat-task-user-message__schedule-text">
              <strong>Исполнить:</strong> {scheduleText}
            </span>
          </div>
        ) : null}
      </div>
    </MessagePrimitive.Root>
  );
}
