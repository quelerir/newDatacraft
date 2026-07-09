import { ThreadPrimitive } from '@assistant-ui/react';
import { Bell, Bot, ChartNoAxesCombined, Gauge, TriangleAlert } from 'lucide-react';

const notificationSuggestions = [
  {
    icon: Bell,
    label: 'Настроить уведомления по KPI',
    prompt: 'Присылай уведомление, если ключевые KPI выходят за заданный диапазон',
  },
  {
    icon: TriangleAlert,
    label: 'Сообщать об аномалиях',
    prompt: 'Сразу уведомляй меня, если в данных появляются аномалии или резкие просадки',
  },
  {
    icon: Gauge,
    label: 'Следить за performance',
    prompt: 'Отправляй уведомление, если performance рекламных кампаний начинает падать',
  },
  {
    icon: ChartNoAxesCombined,
    label: 'Алерт по росту метрик',
    prompt: 'Уведомляй, когда конверсия или выручка заметно растут относительно прошлой недели',
  },
];

export function AiChatNotificationsWelcome() {
  return (
    <ThreadPrimitive.Empty>
      <div className="ai-chat-welcome">
        <div className="ai-chat-welcome__mark">
          <Bot size={78} strokeWidth={1.7} />
        </div>
        <h1>Какие уведомления нужны?</h1>
        <p>Опишите, за чем следить и в каких случаях отправлять сигнал. Я помогу быстро настроить нужный сценарий.</p>

        <div className="ai-chat-welcome__suggestions">
          {notificationSuggestions.map((suggestion) => {
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
