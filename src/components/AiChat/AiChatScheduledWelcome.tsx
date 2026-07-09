import { ThreadPrimitive } from '@assistant-ui/react';
import { Bot, CalendarClock, Repeat, Sparkles, TimerReset } from 'lucide-react';

const scheduledSuggestions = [
  { icon: CalendarClock, label: 'Запланировать ежедневный дайджест', prompt: 'Каждое утро в 9 присылай дайджест по ключевым метрикам' },
  { icon: Repeat, label: 'Настроить регулярный отчёт', prompt: 'Каждый понедельник собирай отчёт по трафику и конверсии' },
  { icon: TimerReset, label: 'Проверять аномалии по расписанию', prompt: 'Каждый день в 18:00 проверяй аномалии в данных и присылай summary' },
  { icon: Sparkles, label: 'Напомнить о просадке метрик', prompt: 'Если retention week 1 падает ниже порога, сразу присылай уведомление' },
];

export function AiChatScheduledWelcome() {
  return (
    <ThreadPrimitive.Empty>
      <div className="ai-chat-welcome">
        <div className="ai-chat-welcome__mark">
          <Bot size={78} strokeWidth={1.7} />
        </div>
        <h1>Что запланировать?</h1>
        <p>Опишите задачу, периодичность и условия запуска. Я помогу оформить это как регулярный сценарий.</p>

        <div className="ai-chat-welcome__suggestions">
          {scheduledSuggestions.map((suggestion) => {
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
