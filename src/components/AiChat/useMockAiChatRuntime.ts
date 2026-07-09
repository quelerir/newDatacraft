import {
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from '@assistant-ui/react';
import { type ChatModelAdapter, type ThreadMessage, type ThreadMessageLike, useLocalRuntime } from '@assistant-ui/react';
import { useMemo } from 'react';
import type { MockTopicMessage } from './aiChatMockAgents';

function extractLatestUserMessage(messages: readonly ThreadMessage[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  if (!latestUserMessage) return '';

  return latestUserMessage.content
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

function buildMockReply(
  message: string,
  context: {
    agentName: string;
    topicTitle: string;
    topicPrompt: string;
  },
) {
  const normalizedMessage = message.toLowerCase();

  if (!message) {
    return `${context.agentName} на месте. Можем продолжить тему "${context.topicTitle}" или быстро переформулировать запрос под новый угол.`;
  }

  if (normalizedMessage.includes('вывод') || normalizedMessage.includes('summary')) {
    return `${context.agentName}: по теме "${context.topicTitle}" я бы вынес три вывода. Первое: смотрим на главное изменение в данных. Второе: проверяем, чем оно вызвано. Третье: фиксируем следующий шаг для команды.`;
  }

  if (normalizedMessage.includes('данн') || normalizedMessage.includes('источник') || normalizedMessage.includes('source')) {
    return `${context.agentName}: для темы "${context.topicTitle}" я бы сначала проверил источники, свежесть данных, ключевые поля и сегменты, без которых вывод может получиться искажённым.`;
  }

  if (normalizedMessage.includes('следующ') || normalizedMessage.includes('next')) {
    return `${context.agentName}: следующий шаг по теме "${context.topicTitle}" — сверить динамику по основным сегментам, найти отклонения и подготовить короткий action plan для команды.`;
  }

  if (normalizedMessage.includes('дашборд') || normalizedMessage.includes('dashboard')) {
    return `${context.agentName}: если опираться на тему "${context.topicTitle}", я помогу выделить метрики на дашборде, которые сильнее всего влияют на решение, и собрать короткое объяснение для команды.`;
  }

  return `${context.agentName}: принял запрос по теме "${context.topicTitle}". В mock-режиме я отвечаю шаблонно, но уже в контексте выбранного агента. Базовый стартовый промпт для этой темы: "${context.topicPrompt}"`;
}

const wait = (durationMs: number) => new Promise((resolve) => window.setTimeout(resolve, durationMs));

export function useMockAiChatRuntime(context: {
  agentName: string;
  topicTitle: string;
  topicPrompt: string;
  topicMessages: MockTopicMessage[];
  threadKind?: 'task' | 'topic';
}) {
  const attachmentAdapter = useMemo(
    () => new CompositeAttachmentAdapter([new SimpleImageAttachmentAdapter(), new SimpleTextAttachmentAdapter()]),
    [],
  );

  const chatModelAdapter = useMemo<ChatModelAdapter>(
    () => ({
      run: async function* ({ messages, abortSignal }) {
        if (context.threadKind === 'task') {
          return;
        }

        const latestMessage = extractLatestUserMessage(messages);
        const reply = buildMockReply(latestMessage, context);

        const words = reply.split(' ');
        let partialText = '';

        for (const word of words) {
          if (abortSignal.aborted) return;

          partialText = partialText ? `${partialText} ${word}` : word;
          yield {
            content: [
              {
                type: 'text',
                text: partialText,
              },
            ],
          };
          await wait(35);
        }
      },
    }),
    [context],
  );

  const initialMessages = useMemo<ThreadMessageLike[]>(
    () =>
      context.topicMessages.map((message) => ({
        role: message.role,
        content: [
          {
            type: 'text',
            text: message.text,
          },
        ],
      })),
    [context.topicMessages],
  );

  return useLocalRuntime(chatModelAdapter, {
    initialMessages,
    adapters: {
      attachments: attachmentAdapter,
    },
  });
}
