import { ThreadPrimitive } from '@assistant-ui/react';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { EmptyState } from './EmptyState';
import { TypingIndicator } from './TypingIndicator';

export function AssistantThread() {
  return (
    <ThreadPrimitive.Root className="assistant-thread">
      <ThreadPrimitive.Viewport className="assistant-thread__viewport">
        <EmptyState />

        <ThreadPrimitive.Messages>
          {() => <ChatMessage />}
        </ThreadPrimitive.Messages>

        <TypingIndicator />
      </ThreadPrimitive.Viewport>

      <ThreadPrimitive.ViewportFooter className="assistant-thread__footer">
        <ChatInput />
      </ThreadPrimitive.ViewportFooter>
    </ThreadPrimitive.Root>
  );
}
