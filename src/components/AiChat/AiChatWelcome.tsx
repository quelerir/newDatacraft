import { ThreadPrimitive } from '@assistant-ui/react';
import { Bot, ChartColumnBig, Database, LineChart, Sparkles } from 'lucide-react';

function buildSuggestions(agentName: string, topicTitle: string, topicPrompt: string, threadKind: 'task' | 'topic') {
  const entityLabel = threadKind === 'task' ? 'задачу' : 'тему';
  const continueLabel = threadKind === 'task' ? 'Продолжить задачу' : 'Продолжить тему';

  return [
    { icon: Sparkles, label: continueLabel, prompt: topicPrompt },
    {
      icon: ChartColumnBig,
      label: 'Сделать краткий вывод',
      prompt: `${agentName}, сделай краткий вывод по ${entityLabel} "${topicTitle}" в 3 пунктах.`,
    },
    {
      icon: Database,
      label: 'Какие данные нужны',
      prompt: `Какие данные и поля нужны, чтобы качественно разобрать ${entityLabel} "${topicTitle}"?`,
    },
    {
      icon: LineChart,
      label: 'Следующий шаг',
      prompt: `Какой следующий аналитический шаг ты рекомендуешь по ${entityLabel} "${topicTitle}"?`,
    },
  ];
}

export function AiChatWelcome({
  agentName,
  topicTitle,
  topicPrompt,
  threadKind = 'topic',
}: {
  agentName: string;
  topicTitle: string;
  topicPrompt: string;
  threadKind?: 'task' | 'topic';
}) {
  const welcomeSuggestions = buildSuggestions(agentName, topicTitle, topicPrompt, threadKind);
  const heading = threadKind === 'task' ? 'Новый чат' : `Тема: ${topicTitle}`;
  const description =
    threadKind === 'task'
      ? 'Опишите цель, ожидаемый результат или первый шаг по этой задаче.'
      : 'Можно продолжить разговор или задать новый вопрос в этом контексте.';

  return (
    <ThreadPrimitive.Empty>
      <div className="ai-chat-welcome">
        <div className="ai-chat-welcome__mark">
          <Bot size={78} strokeWidth={1.7} />
        </div>
        <h1>{heading}</h1>
        <p>{description}</p>

        <div className="ai-chat-welcome__suggestions">
          {welcomeSuggestions.map((suggestion) => {
            const Icon = suggestion.icon;

            return (
              <ThreadPrimitive.Suggestion
                key={suggestion.prompt}
                className="ai-chat-welcome__suggestion"
                prompt={suggestion.prompt}
                method="replace"
                autoSend
              >
                <Icon size={15} />
                {suggestion.label}
              </ThreadPrimitive.Suggestion>
            );
          })}
        </div>
      </div>
    </ThreadPrimitive.Empty>
  );
}
