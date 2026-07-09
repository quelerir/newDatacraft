import { useMutation } from '@tanstack/react-query';
import { type ChatModelAdapter, type ThreadMessage, useLocalRuntime } from '@assistant-ui/react';
import { useCallback, useMemo, useRef } from 'react';
import type { DashboardAssistantContext } from '../../data/dashboardData';
import { chainlitClient, type ChainlitSession } from '../../services/chainlitClient';

function extractLatestUserMessage(messages: readonly ThreadMessage[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  if (!latestUserMessage) return '';

  return latestUserMessage.content
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

export function useAssistantRuntime(context: DashboardAssistantContext) {
  const sessionRef = useRef<ChainlitSession | null>(null);

  const createSessionMutation = useMutation({
    mutationFn: () => chainlitClient.createSession(),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => chainlitClient.disconnect(),
  });

  const ensureSession = useCallback(async () => {
    if (sessionRef.current) return sessionRef.current;

    const session = await createSessionMutation.mutateAsync();
    sessionRef.current = session;
    return session;
  }, [createSessionMutation]);

  const clearSession = useCallback(async () => {
    sessionRef.current = null;
    await disconnectMutation.mutateAsync();
  }, [disconnectMutation]);

  const chatModelAdapter = useMemo<ChatModelAdapter>(
    () => ({
      run: async function* ({ messages, abortSignal }) {
        const session = await ensureSession();
        const latestMessage = extractLatestUserMessage(messages);

        for await (const partialText of chainlitClient.streamMessage(
          {
            sessionId: session.id,
            message: latestMessage,
            context,
          },
          abortSignal,
        )) {
          yield {
            content: [
              {
                type: 'text',
                text: partialText,
              },
            ],
          };
        }
      },
    }),
    [context, ensureSession],
  );

  const runtime = useLocalRuntime(chatModelAdapter);

  return {
    runtime,
    clearSession,
  };
}
