import type { DashboardAssistantContext } from '../data/dashboardData';

export type ChainlitSession = {
  id: string;
  createdAt: string;
  apiUrl: string;
};

export type ChainlitMessagePayload = {
  sessionId: string;
  message: string;
  context: DashboardAssistantContext;
};

const MOCK_LATENCY_MS = 1000;

const sqlResponse = `Могу сформировать SQL-запрос для выбранного графика.

\`\`\`sql
SELECT channel,
       SUM(revenue) AS total_revenue
FROM ecommerce_orders
WHERE order_date >= CURRENT_DATE - INTERVAL '30 day'
GROUP BY channel
ORDER BY total_revenue DESC;
\`\`\`

Если хочешь, следующим сообщением адаптирую его под Superset dataset.`;

const mockResponses = [
  `Могу проанализировать текущий дашборд.

- Самый сильный канал по выручке сейчас: **Organic**
- Узкое место воронки начинается после этапа **"Карточка товара"**
- Рост покупок по дням выглядит устойчивым, без резких провалов`,
  `Вижу снижение конверсии после этапа **"Добавление товара в корзину"**.

| Этап | Конверсия |
| --- | ---: |
| Просмотры | 100% |
| Карточка товара | 74% |
| Корзина | 48% |
| Оформление | 29% |
| Оплата | 18% |

Советую сравнить это место с предыдущим периодом и проверить UX checkout.`,
  `Наибольшая выручка приходится на **органический поиск**.

Похоже, что paid-каналы дают охват, но хуже монетизируются. Полезный следующий шаг: сравнить CAC и ROMI по каналам.`,
  `В текущих данных заметна аномалия по рекламному каналу.

- Revenue по Ads визуально выше среднего
- Но funnel не подтверждает такой же рост финальной оплаты
- Это может говорить о проблеме атрибуции или всплеске некачественного трафика`,
  `Могу объяснить графики более подробно.

Сейчас линейный график показывает стабильный рост ежедневных покупок, а pie chart подтверждает, что основным источником трафика остается organic. Подробнее про Assistant UI можно посмотреть в [документации](https://www.assistant-ui.com/docs).`,
  sqlResponse,
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function abortIfNeeded(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }
}

function pickMockResponse(message: string, context: DashboardAssistantContext) {
  const normalized = message.toLowerCase();

  if (normalized.includes('sql')) return sqlResponse;
  if (normalized.includes('аномал')) return mockResponses[3];
  if (normalized.includes('граф')) return mockResponses[4];
  if (normalized.includes('выруч')) return mockResponses[2];
  if (normalized.includes('дашборд')) return `${mockResponses[0]}\n\nКонтекст: **${context.dashboard.title}**.`;

  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
}

function splitIntoChunks(text: string) {
  const words = text.split(' ');
  const chunks: string[] = [];

  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 42) {
      chunks.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export const chainlitClient = {
  async createSession(): Promise<ChainlitSession> {
    await sleep(120);

    return {
      id: `mock-session-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      apiUrl: import.meta.env.VITE_CHAINLIT_API_URL,
    };
  },

  async sendMessage(payload: ChainlitMessagePayload): Promise<string> {
    await sleep(MOCK_LATENCY_MS);
    return pickMockResponse(payload.message, payload.context);
  },

  async *streamMessage(payload: ChainlitMessagePayload, signal?: AbortSignal): AsyncGenerator<string, void> {
    abortIfNeeded(signal);
    await sleep(MOCK_LATENCY_MS);
    abortIfNeeded(signal);

    const response = pickMockResponse(payload.message, payload.context);
    const chunks = splitIntoChunks(response);

    let output = '';
    for (const chunk of chunks) {
      abortIfNeeded(signal);
      output = output ? `${output} ${chunk}` : chunk;
      yield output;
      await sleep(55);
    }
  },

  async disconnect(): Promise<void> {
    await sleep(40);
  },
};
