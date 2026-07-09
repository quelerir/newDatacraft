import { Bell, CalendarPlus, Check, ChevronDown, ChevronUp, LayoutGrid, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { MockAgent, MockAgentFolder, MockAgentTopic, MockAgentWorkspace, MockTopicMessage } from './aiChatMockAgents';

type AiChatSidebarProps = {
  workspaces: MockAgentWorkspace[];
  folders: MockAgentFolder[];
  agents: MockAgent[];
  scheduledTasks: ScheduledTaskItem[];
  availableTopicTags: string[];
  selectedWorkspaceId: string;
  selectedAgentId: string;
  selectedTopicId: string;
  selectedTaskId: string;
  selectedCardKind: 'task' | 'topic';
  chatSearch: string;
  onWorkspaceSelect: (workspaceId: string) => void;
  onChatSearchChange: (value: string) => void;
  onAgentSelect: (agentId: string) => void;
  onCreateTopic: () => void;
  onCreateTask: () => void;
  onTopicSelect: (topicId: string, searchQuery?: string) => void;
  onTopicTagsChange: (topicId: string, nextTags: string[]) => void;
  onTaskSelect: (taskId: string, searchQuery?: string) => void;
};

export type ScheduledTaskItem = {
  id: string;
  title: string;
  preview: string;
  cadence: string;
  prompt: string;
  messages: MockTopicMessage[];
};

const weekdayMap: Record<string, number> = {
  Пн: 1,
  Вт: 2,
  Ср: 3,
  Чт: 4,
  Пт: 5,
  Сб: 6,
  Вс: 0,
};

const monthMap: Record<string, number> = {
  янв: 0,
  фев: 1,
  мар: 2,
  апр: 3,
  май: 4,
  июн: 5,
  июл: 6,
  авг: 7,
  сен: 8,
  окт: 9,
  ноя: 10,
  дек: 11,
};

function withTime(date: Date, hours: number, minutes: number) {
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function getPreviousWeekday(baseDate: Date, weekday: number) {
  const next = new Date(baseDate);
  const diff = (next.getDay() - weekday + 7) % 7;
  next.setDate(next.getDate() - diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getSortValue(label: string, referenceDate = new Date()) {
  const normalized = label.trim();
  const timeMatch = normalized.match(/^(\d{1,2}):(\d{2})$/);
  const weekdayWithTimeMatch = normalized.match(/^Каждый\s+([а-я]+)\s+в\s+(\d{1,2}):(\d{2})$/i);
  const weekdayOnlyMatch = normalized.match(/^Каждый\s+([а-я]+)$/i);

  if (timeMatch) {
    return withTime(referenceDate, Number(timeMatch[1]), Number(timeMatch[2])).getTime();
  }

  if (normalized === 'Только что') {
    return referenceDate.getTime();
  }

  if (weekdayWithTimeMatch) {
    const weekdayLabel = weekdayWithTimeMatch[1].slice(0, 2);
    const weekday = weekdayMap[weekdayLabel];

    if (weekday !== undefined) {
      return withTime(
        getPreviousWeekday(referenceDate, weekday),
        Number(weekdayWithTimeMatch[2]),
        Number(weekdayWithTimeMatch[3]),
      ).getTime();
    }
  }

  if (normalized === 'Вчера') {
    const yesterday = new Date(referenceDate);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);
    return yesterday.getTime();
  }

  if (weekdayMap[normalized] !== undefined) {
    return getPreviousWeekday(referenceDate, weekdayMap[normalized]).getTime();
  }

  const dateMatch = normalized.match(/^(\d{1,2})\s+([а-я]{3})$/i);
  if (dateMatch) {
    const month = monthMap[dateMatch[2].toLowerCase()];
    if (month !== undefined) {
      const next = new Date(referenceDate);
      next.setMonth(month, Number(dateMatch[1]));
      next.setHours(12, 0, 0, 0);
      return next.getTime();
    }
  }

  const dailyTimeMatch = normalized.match(/в\s+(\d{1,2}):(\d{2})$/i);
  if (dailyTimeMatch) {
    return withTime(referenceDate, Number(dailyTimeMatch[1]), Number(dailyTimeMatch[2])).getTime();
  }

  if (weekdayOnlyMatch) {
    const weekdayLabel = weekdayOnlyMatch[1].slice(0, 2);
    const weekday = weekdayMap[weekdayLabel];

    if (weekday !== undefined) {
      return getPreviousWeekday(referenceDate, weekday).getTime();
    }
  }

  if (normalized === 'Каждый понедельник') {
    return getPreviousWeekday(referenceDate, 1).getTime();
  }

  if (normalized === 'Раз в неделю') {
    const next = new Date(referenceDate);
    next.setDate(next.getDate() - 7);
    next.setHours(12, 0, 0, 0);
    return next.getTime();
  }

  return 0;
}

const taskConversation = (...messages: MockTopicMessage[]) => messages;

function matchesSearchValue(value: string | undefined, query: string) {
  return value?.toLowerCase().includes(query) ?? false;
}

function topicMatchesSearch(
  topic: Pick<MockAgentTopic, 'title' | 'preview' | 'prompt' | 'tags' | 'workspaceTagId' | 'messages'>,
  query: string,
  workspaces: MockAgentWorkspace[],
) {
  const workspaceName = workspaces.find((workspace) => workspace.id === topic.workspaceTagId)?.name;

  return (
    matchesSearchValue(topic.title, query) ||
    matchesSearchValue(topic.preview, query) ||
    matchesSearchValue(topic.prompt, query) ||
    matchesSearchValue(workspaceName, query) ||
    topic.messages.some((message) => matchesSearchValue(message.text, query)) ||
    (topic.tags ?? []).some((tag) => matchesSearchValue(tag, query))
  );
}

function taskMatchesSearch(task: Pick<ScheduledTaskItem, 'title' | 'preview' | 'prompt' | 'messages'>, query: string) {
  return (
    matchesSearchValue(task.title, query) ||
    matchesSearchValue(task.preview, query) ||
    matchesSearchValue(task.prompt, query) ||
    task.messages.some((message) => matchesSearchValue(message.text, query)) ||
    matchesSearchValue('задача', query)
  );
}

const MIN_TASK_MESSAGES = 10;

function resolveTaskScenario(task: Pick<ScheduledTaskItem, 'title' | 'preview' | 'prompt'>) {
  const text = `${task.title} ${task.preview} ${task.prompt}`.toLowerCase();

  if (text.includes('growth') || text.includes('cac') || text.includes('cr') || text.includes('retention')) return 'growth';
  if (text.includes('sla') || text.includes('витрин') || text.includes('data') || text.includes('инцидент')) return 'data';
  if (text.includes('board') || text.includes('руковод') || text.includes('brief')) return 'leadership';
  if (text.includes('алерт') || text.includes('аномал') || text.includes('kpi')) return 'alerts';
  if (text.includes('партн') || text.includes('api')) return 'partners';
  if (text.includes('вендор') || text.includes('коннектор') || text.includes('лимит')) return 'vendors';
  if (text.includes('research') || text.includes('eval') || text.includes('эксперимент')) return 'research';

  return 'generic';
}

function buildTaskExtensionPool(task: Pick<ScheduledTaskItem, 'title' | 'preview' | 'prompt'>): MockTopicMessage[] {
  const scenario = resolveTaskScenario(task);

  if (scenario === 'growth') {
    return [
      { role: 'user', text: `Если по задаче "${task.title}" нужен один главный срез, какой ты выберешь?` },
      { role: 'assistant', text: `Я бы выбрал срез, где сильнее всего меняется экономика или конверсия. По задаче "${task.title}" это быстрее всего показывает, куда команде смотреть в первую очередь.` },
      { role: 'user', text: 'Что здесь лучше сделать действием уже сегодня?' },
      { role: 'assistant', text: `Сразу проверить самый шумный сегмент, сверить недавние изменения и зафиксировать один конкретный action owner. Тогда "${task.title}" превращается в рабочую задачу, а не просто в наблюдение.` },
    ];
  }

  if (scenario === 'data') {
    return [
      { role: 'user', text: `По задаче "${task.title}" где обычно скрывается корень проблемы?` },
      { role: 'assistant', text: `Чаще всего корень сидит либо в контракте данных, либо в тихом изменении схемы или окна загрузки. Для "${task.title}" я бы это проверил раньше всего.` },
      { role: 'user', text: 'Что добавить в follow-up, чтобы задача не повторялась каждую неделю?' },
      { role: 'assistant', text: `Добавить контрольный чек, наблюдаемость и понятный owner на preventive action. Тогда "${task.title}" будет не только про реакцию, но и про профилактику.` },
    ];
  }

  if (scenario === 'leadership') {
    return [
      { role: 'user', text: `Как сократить "${task.title}" до одного экрана для руководителя?` },
      { role: 'assistant', text: `Оставить только изменение, риск и решение. Для "${task.title}" этого достаточно, чтобы статус был управленческим, а не описательным.` },
      { role: 'user', text: 'Что здесь лучше не перегружать деталями?' },
      { role: 'assistant', text: `Не перегружать внутренними срезами, если они не меняют решение. По задаче "${task.title}" важно ускорить понимание, а не показать весь хвост анализа.` },
    ];
  }

  if (scenario === 'alerts') {
    return [
      { role: 'user', text: `Какой критерий полезности ты бы поставил для "${task.title}"?` },
      { role: 'assistant', text: `Сигнал полезен, если у него есть порог, владелец и понятное действие. Без этого "${task.title}" быстро превращается в лишний шум.` },
      { role: 'user', text: 'Как ограничить спам, но не потерять важное?' },
      { role: 'assistant', text: `Добавить дедупликацию, окно повторов и отдельный digest для некритичных случаев. Тогда задача "${task.title}" будет реально помогать команде.` },
    ];
  }

  if (scenario === 'partners' || scenario === 'vendors') {
    return [
      { role: 'user', text: `Какой внешний риск у "${task.title}" ты бы назвал главным?` },
      { role: 'assistant', text: `Главный внешний риск - размытая ответственность и неподтвержденный срок. Для "${task.title}" это именно то, что чаще всего тормозит движение.` },
      { role: 'user', text: 'Что нужно зафиксировать письменно уже сейчас?' },
      { role: 'assistant', text: `Владельца, дедлайн и критерий готовности. Тогда по задаче "${task.title}" у нас будет не ожидание, а управляемая договорённость.` },
    ];
  }

  if (scenario === 'research') {
    return [
      { role: 'user', text: `Как понять, что "${task.title}" дала полезный результат, даже если гипотеза не подтвердилась?` },
      { role: 'assistant', text: `Если задача уменьшила неопределенность и сузила следующий шаг, это уже полезный результат. Для "${task.title}" это даже важнее красивого промежуточного вывода.` },
      { role: 'user', text: 'Что бы ты проверил следующим циклом?' },
      { role: 'assistant', text: `Я бы проверил устойчивость вывода на более строгом наборе кейсов или данных. Тогда задача "${task.title}" даст не только инсайт, но и уверенность.` },
    ];
  }

  return [
    { role: 'user', text: `Какой следующий рабочий шаг ты бы предложил по задаче "${task.title}"?` },
    { role: 'assistant', text: `Я бы сузил задачу до одного проверяемого вопроса, одного владельца и короткого срока проверки. Для "${task.title}" это лучший способ быстро получить пользу.` },
    { role: 'user', text: 'Что важно зафиксировать в результате?' },
    { role: 'assistant', text: `Важно зафиксировать вывод, ограничение и следующее действие. Тогда по задаче "${task.title}" не потеряется контекст между циклами.` },
  ];
}

function ensureTaskConversationDepth(task: ScheduledTaskItem): ScheduledTaskItem {
  const firstUserMessage = task.messages.find((message) => message.role === 'user')?.text?.trim();
  const normalizedUserMessage = firstUserMessage || task.prompt.trim() || task.title;

  return {
    ...task,
    messages: [{ role: 'user', text: normalizedUserMessage }],
  };
}

export function buildScheduledTasks(agent?: MockAgent): ScheduledTaskItem[] {
  if (!agent) {
    return [];
  }

  const taskMap: Record<string, ScheduledTaskItem[]> = {
    'growth-analyst': [
      {
        id: 'task-growth-digest',
        title: 'Утренний growth-дайджест',
        preview: 'Собирать краткую сводку по CR, CAC, spend и самым шумным изменениям за ночь.',
        cadence: 'Каждый будний в 08:45',
        prompt: 'Собери утренний growth-дайджест и выдели, что важнее всего проверить сегодня.',
        messages: taskConversation(
          { role: 'user', text: 'Подготовь утренний growth-дайджест по вчерашнему дню.' },
          { role: 'assistant', text: 'Главное за утро: CR слегка просел в paid social, CAC вырос в двух кампаниях, а spend ушёл выше плана по одному сегменту. В первую очередь я бы проверил связку креативов и целевые аудитории.' },
          { role: 'user', text: 'Что из этого стоит вынести в короткий апдейт команде?' },
          { role: 'assistant', text: 'Я бы вынес два сигнала: рост CAC в перегретых кампаниях и локальную просадку CR на мобильном трафике. Это даст команде понятный фокус на день.' },
          { role: 'user', text: 'И какой action ты бы предложил до обеда?' },
          { role: 'assistant', text: 'До обеда стоит перепроверить сегментацию кампаний, отключить самые дорогие связки и быстро сверить, не изменилась ли посадочная для мобильного трафика.' },
        ),
      },
      {
        id: 'task-growth-thresholds',
        title: 'Ревью каналов с перегретым CAC',
        preview: 'Подсвечивать кампании, где CAC вышел за целевой коридор и нужен пересмотр бюджета.',
        cadence: 'Каждый вторник в 12:30',
        prompt: 'Проведи ревью каналов с перегретым CAC и предложи, что делать с бюджетом.',
        messages: taskConversation(
          { role: 'user', text: 'Собери список каналов, где CAC уже вышел за коридор.' },
          { role: 'assistant', text: 'Сейчас в зоне риска два paid-канала: у одного CAC растет третьи сутки подряд, у второго проблема локальна только в мобильной аудитории. Бюджет лучше не резать одинаково, а смотреть по сегментам.' },
          { role: 'user', text: 'Какой из них самый критичный?' },
          { role: 'assistant', text: 'Самый критичный тот, где рост CAC уже сочетается с падением CR. Там эффект двойной, и он быстрее всего бьет по экономике.' },
          { role: 'user', text: 'Дай короткую рекомендацию по перераспределению.' },
          { role: 'assistant', text: 'Часть бюджета стоит временно вернуть в стабильный брендовый поиск и в каналы с предсказуемым retention, а перегретые кампании оставить на ограниченном тестовом объеме.' },
        ),
      },
      {
        id: 'task-growth-alerts',
        title: 'Алерт по резкому падению CR',
        preview: 'Отмечать сегменты, где конверсия просела сильнее недельной нормы и нужна проверка гипотез.',
        cadence: 'Каждую пятницу в 17:00',
        prompt: 'Проверь, где произошло резкое падение CR, и оформи это как алерт.',
        messages: taskConversation(
          { role: 'user', text: 'Сформируй алерт по резкому падению CR за сегодня.' },
          { role: 'assistant', text: 'Алерт сработал в одном сегменте mobile paid social: падение заметно выше обычной недельной волатильности. Это уже похоже не на шум, а на изменение в воронке.' },
          { role: 'user', text: 'Что проверить первым, чтобы не тратить лишнее время?' },
          { role: 'assistant', text: 'Сначала я бы проверил, не менялись ли посадочная, скорость страницы и набор креативов. Это самые частые причины такой резкой просадки.' },
          { role: 'user', text: 'И как это написать в алерте владельцу?' },
          { role: 'assistant', text: 'Коротко: "CR в mobile paid social просел сильнее нормы, первичная гипотеза связана с изменением точки входа или креативов. Нужна быстрая проверка до конца дня".' },
        ),
      },
    ],
    'data-engineer': [
      {
        id: 'task-data-sla',
        title: 'Проверка утренних SLA',
        preview: 'Сверять лаги по витринам, статус ночных джоб и всё, что не доехало к старту дня.',
        cadence: 'Каждый будний в 07:40',
        prompt: 'Проверь утренние SLA по данным и укажи, что не доехало вовремя.',
        messages: taskConversation(
          { role: 'user', text: 'Проверь, все ли критичные витрины приехали к старту дня.' },
          { role: 'assistant', text: 'Две ключевые витрины обновились вовремя, одна пришла с лагом в 28 минут, и ещё по одной джоба завершилась с ретраем. Пока это не критично, но лучше отметить в утреннем статусе.' },
          { role: 'user', text: 'Какая из задержек самая рискованная для бизнеса?' },
          { role: 'assistant', text: 'Самая чувствительная задержка касается витрины, на которую опирается маркетинговый отчёт. Если лаг повторится завтра, пользователи уже увидят устаревшие цифры утром.' },
          { role: 'user', text: 'Что написать в статусе платформенной команде?' },
          { role: 'assistant', text: 'Я бы написал, что SLA в целом соблюден, но есть один нестабильный пайплайн с повторяющимся лагом, который стоит взять в наблюдение до конца недели.' },
        ),
      },
      {
        id: 'task-data-quality',
        title: 'Контроль качества витрин',
        preview: 'Проверять дубликаты, null и резкие расхождения объёмов в продуктовых таблицах.',
        cadence: 'Каждую среду в 11:15',
        prompt: 'Проведи контроль качества витрин и собери отклонения, которые нужно разобрать.',
        messages: taskConversation(
          { role: 'user', text: 'Нужен quick check качества по основным витринам.' },
          { role: 'assistant', text: 'Нашёл два отклонения: в одной витрине подросла доля null по новому полю, в другой есть скачок объема, который не совпадает с источником. Это требует отдельной валидации схемы и инкремента.' },
          { role: 'user', text: 'Что из этого выглядит как реальный инцидент?' },
          { role: 'assistant', text: 'Скачок объема выглядит опаснее, потому что он может разъехаться с отчетами. Null по новому полю пока похоже на локальный дефект обогащения.' },
          { role: 'user', text: 'Какую первую гипотезу ты бы дал команде?' },
          { role: 'assistant', text: 'Первая гипотеза: после последнего изменения логики инкремента одна часть событий попадает в витрину повторно. Это проще всего проверить сравнением по ключам и окнам загрузки.' },
        ),
      },
      {
        id: 'task-data-incidents',
        title: 'Weekly review по data-инцидентам',
        preview: 'Собирать инциденты недели, причины и статус preventive actions по каждому случаю.',
        cadence: 'Каждую пятницу в 16:30',
        prompt: 'Собери weekly review по data-инцидентам и зафиксируй статус preventive actions.',
        messages: taskConversation(
          { role: 'user', text: 'Сделай weekly review по data-инцидентам.' },
          { role: 'assistant', text: 'За неделю было три заметных случая: лаг витрины, дубли в одной продуктовой таблице и временный сбой доставки событий. По двум инцидентам уже есть действия, по одному пока только workaround.' },
          { role: 'user', text: 'Какой из них требует эскалации?' },
          { role: 'assistant', text: 'Тот, где пока нет preventive action, потому что без него проблема может повториться уже на следующей неделе. Именно его я бы поднял первым.' },
          { role: 'user', text: 'Сформулируй вывод для ретро одним абзацем.' },
          { role: 'assistant', text: 'Неделя показала, что у нас быстрее всего закрываются инциденты с явным владельцем, а вот проблемы на стыке пайплайнов и схем всё ещё долго висят без профилактического решения. Это и стоит зафиксировать на ретро.' },
        ),
      },
    ],
    'executive-brief': [
      {
        id: 'task-exec-morning',
        title: 'Утренний briefing для руководителя',
        preview: 'Генерировать короткий апдейт по ключевым цифрам, рискам и тому, что изменилось со вчера.',
        cadence: 'Каждый будний в 08:30',
        prompt: 'Подготовь утренний briefing для руководителя по цифрам, рискам и фокусу дня.',
        messages: taskConversation(
          { role: 'user', text: 'Нужен утренний briefing для руководителя на сегодня.' },
          { role: 'assistant', text: 'С утра я бы выделил три вещи: выручка в коридоре плана, у маркетинга есть один перегретый канал, а data-команда держит под наблюдением нестабильную витрину. На сегодня главный фокус - не дать этим двум рискам перейти в эскалацию.' },
          { role: 'user', text: 'Что здесь можно сократить до одного абзаца?' },
          { role: 'assistant', text: 'Если коротко: бизнес идёт по плану, но есть два операционных сигнала, которые требуют внимания команды уже сегодня - канал с перегретым CAC и нестабильная утренняя витрина.' },
          { role: 'user', text: 'Добавь формулировку про приоритеты дня.' },
          { role: 'assistant', text: 'Приоритет дня: локализовать причину роста CAC и закрыть проверку по витрине до середины дня, чтобы не тянуть риски в вечерний статус.' },
        ),
      },
      {
        id: 'task-exec-board',
        title: 'Подготовка board summary',
        preview: 'Собирать сводку по росту, блокерам и решениям, которые стоит вынести на обзор недели.',
        cadence: 'Каждый четверг в 15:00',
        prompt: 'Подготовь board summary по росту, блокерам и решениям, которые надо вынести на встречу.',
        messages: taskConversation(
          { role: 'user', text: 'Собери короткий board summary по неделе.' },
          { role: 'assistant', text: 'В summary я бы оставил три части: где есть рост, какие блокеры мешают масштабированию и какие решения требуют согласования. Это помогает держать разговор на уровне решений, а не деталей.' },
          { role: 'user', text: 'Какие блокеры сейчас главные?' },
          { role: 'assistant', text: 'Сейчас самые заметные блокеры - нестабильность части маркетинговой экономики и зависимость от качества данных в одном из критичных отчетов. Оба вопроса управляемые, но их стоит показать заранее.' },
          { role: 'user', text: 'Что бы ты вынес как decision point?' },
          { role: 'assistant', text: 'Decision point: либо перераспределяем бюджет в более предсказуемые каналы уже сейчас, либо даём одной рискованной зоне ещё короткое окно на проверку гипотез.' },
        ),
      },
      {
        id: 'task-exec-risks',
        title: 'Обзор критичных сигналов',
        preview: 'Сводить продуктовые и data-риски в один список, если они требуют эскалации наверх.',
        cadence: 'Каждую пятницу в 18:10',
        prompt: 'Собери обзор критичных сигналов, которые требуют эскалации.',
        messages: taskConversation(
          { role: 'user', text: 'Сведи все критичные сигналы в один обзор.' },
          { role: 'assistant', text: 'На конец недели я бы эскалировал два сигнала: один связан с маркетинговой эффективностью, второй - с риском задержки данных в утреннем отчете. Остальное пока можно закрывать на уровне команд.' },
          { role: 'user', text: 'Почему именно эти два?' },
          { role: 'assistant', text: 'Потому что у обоих есть прямое влияние на решения: первый влияет на экономику привлечения, второй - на доверие к цифрам, по которым команда ориентируется с утра.' },
          { role: 'user', text: 'И какая формулировка подойдёт для эскалации?' },
          { role: 'assistant', text: 'Формулировка может быть такой: "Есть два сигнала с потенциальным влиянием на результат недели - просим держать их в приоритете до следующего статуса".' },
        ),
      },
    ],
    'notifications-agent': [
      {
        id: 'task-alert-kpi',
        title: 'Переоценка KPI-алертов',
        preview: 'Пересчитывать пороги по выручке, CR и retention, чтобы алерты не шумели зря.',
        cadence: 'Каждый будний в 09:10',
        prompt: 'Переоцени пороги KPI-алертов и покажи, где текущие правила дают лишний шум.',
        messages: taskConversation(
          { role: 'user', text: 'Проверь, не шумят ли наши KPI-алерты сильнее нужного.' },
          { role: 'assistant', text: 'Да, часть правил стала слишком чувствительной: по одной метрике алерт срабатывает почти каждый день, хотя это укладывается в обычную волатильность. Порог нужно немного сместить.' },
          { role: 'user', text: 'Какие KPI стоит трогать в первую очередь?' },
          { role: 'assistant', text: 'Сначала я бы пересмотрел выручку по сегментам и retention, потому что именно там больше всего ложных срабатываний в текущей конфигурации.' },
          { role: 'user', text: 'И как объяснить это владельцу процесса?' },
          { role: 'assistant', text: 'Лучше так: "Сигналы сейчас слишком чувствительны и создают шум, поэтому пересматриваем пороги, чтобы сохранить только те алерты, которые требуют реального действия".' },
        ),
      },
      {
        id: 'task-alert-anomaly',
        title: 'Сводка по сработавшим аномалиям',
        preview: 'Собирать все утренние сигналы и отдавать владельцам короткое объяснение, что именно пошло не так.',
        cadence: 'Каждый вторник в 10:20',
        prompt: 'Собери сводку по утренним аномалиям и разложи, кому что нужно проверить.',
        messages: taskConversation(
          { role: 'user', text: 'Нужна сводка по всем аномалиям, которые сработали утром.' },
          { role: 'assistant', text: 'Утром сработали три сигнала: один по выручке, один по конверсии и один по задержке обновления. Для каждого уже можно дать короткую первичную гипотезу и владельца проверки.' },
          { role: 'user', text: 'Кто должен брать их в работу первым?' },
          { role: 'assistant', text: 'Сигнал по выручке стоит отдать growth-команде, по задержке обновления - data-платформе, а по конверсии - тому, кто ведет воронку конкретного сегмента.' },
          { role: 'user', text: 'Сделай формулировку в один экран.' },
          { role: 'assistant', text: 'Короткая сводка: три аномалии, три владельца, по каждой есть первичная версия причины и ожидаемый срок первой проверки до конца дня.' },
        ),
      },
      {
        id: 'task-alert-performance',
        title: 'Контроль marketing-alerts',
        preview: 'Следить за CPA, CTR и расходом по приоритетным кампаниям и поднимать флаг при отклонениях.',
        cadence: 'Каждую пятницу в 14:40',
        prompt: 'Проверь marketing-alerts по CPA, CTR и расходу и выдели самые опасные отклонения.',
        messages: taskConversation(
          { role: 'user', text: 'Проверь marketing-alerts перед вечерним статусом.' },
          { role: 'assistant', text: 'Главный сигнал сейчас по CPA: одна из приоритетных кампаний дорожает при одновременном падении CTR. Это уже не единичный всплеск, а устойчивая негативная динамика.' },
          { role: 'user', text: 'Есть ли что-то ещё кроме CPA?' },
          { role: 'assistant', text: 'Да, по расходу тоже есть отклонение, но оно пока объясняется перераспределением бюджета. CTR выглядит опаснее, потому что это может означать выгорание креатива.' },
          { role: 'user', text: 'Какую рекомендацию дать маркетингу?' },
          { role: 'assistant', text: 'Рекомендация простая: ограничить объём проблемной кампании, проверить свежие креативы и не масштабировать её, пока CPA и CTR не вернутся в норму.' },
        ),
      },
    ],
    'partner-success': [
      {
        id: 'task-partner-status',
        title: 'Статус по партнёрским запускам',
        preview: 'Напоминать о блокерах, SLA и задачах, которые партнёры до сих пор не подтвердили.',
        cadence: 'Каждый будний в 10:00',
        prompt: 'Подготовь статус по партнёрским запускам и подсвети блокеры со стороны партнёров.',
        messages: taskConversation(
          { role: 'user', text: 'Собери статус по текущим партнёрским запускам.' },
          { role: 'assistant', text: 'По двум запускам всё идёт по плану, а по одному есть задержка из-за неподтвержденного списка задач со стороны партнёра. Это пока не критично, но уже влияет на таймлайн.' },
          { role: 'user', text: 'Что нужно запросить у партнёра первым делом?' },
          { role: 'assistant', text: 'Нужен подтверждённый owner по интеграции и дата, когда они закрывают открытые технические пункты. Без этого дальнейший план выглядит слишком условно.' },
          { role: 'user', text: 'Какой статус дать внутри команды?' },
          { role: 'assistant', text: 'Внутри команды я бы отметил запуск как "под наблюдением": критического срыва нет, но есть внешний блокер, который нужно закрыть в ближайший рабочий день.' },
        ),
      },
      {
        id: 'task-partner-api',
        title: 'Проверка внешнего API',
        preview: 'Собирать список проблем по доставке событий, деградациям и нестабильным эндпоинтам.',
        cadence: 'Каждую среду в 13:00',
        prompt: 'Проверь внешнее API партнёров и собери деградации, влияющие на доставку событий.',
        messages: taskConversation(
          { role: 'user', text: 'Сделай проверку внешнего API по партнёрам.' },
          { role: 'assistant', text: 'Есть один нестабильный эндпоинт с ростом ошибок и ещё один с непредсказуемой задержкой ответа. Пока это не массовый сбой, но доставка событий уже начинает страдать.' },
          { role: 'user', text: 'Что опаснее: ошибки или latency?' },
          { role: 'assistant', text: 'Ошибки опаснее в моменте, но растущий latency часто оказывается ранним индикатором более крупной деградации. Я бы держал под контролем оба сигнала.' },
          { role: 'user', text: 'Что отправить партнёру в follow-up?' },
          { role: 'assistant', text: 'В follow-up стоит попросить их подтвердить причину деградации, таймлайн исправления и временную защиту от потери событий на нашей стороне.' },
        ),
      },
      {
        id: 'task-partner-pilot',
        title: 'Готовность к пилоту',
        preview: 'Сверять риски старта, дедлайны и то, что ещё зависит от внешней команды.',
        cadence: 'Каждую пятницу в 11:45',
        prompt: 'Оцени готовность партнёрского пилота и перечисли, что может сорвать старт.',
        messages: taskConversation(
          { role: 'user', text: 'Оцени, готовы ли мы к старту партнёрского пилота.' },
          { role: 'assistant', text: 'По основным пунктам готовность высокая, но есть два риска: неподтвержденный дедлайн по интеграции и не до конца согласованный сценарий поддержки на старте. Это и может сорвать пилот.' },
          { role: 'user', text: 'Какой риск выглядит главным?' },
          { role: 'assistant', text: 'Главный риск - зависимость от внешней команды по интеграционному пункту. Всё остальное можно дожать быстрее, чем внешнее подтверждение.' },
          { role: 'user', text: 'Как бы ты описал текущее решение?' },
          { role: 'assistant', text: 'Текущий статус я бы назвал "условно готово": запуск возможен, если внешний блокер закрывается в согласованный срок, иначе пилот лучше сдвигать контролируемо, а не в последний момент.' },
        ),
      },
    ],
    'vendor-ops': [
      {
        id: 'task-vendor-health',
        title: 'Health-check коннекторов',
        preview: 'Проверять стабильность интеграций, лаги по обновлению и зависшие синки.',
        cadence: 'Каждый будний в 08:10',
        prompt: 'Проверь health коннекторов и покажи, какие интеграции начали деградировать.',
        messages: taskConversation(
          { role: 'user', text: 'Сделай health-check по всем коннекторам.' },
          { role: 'assistant', text: 'Один коннектор начал давать нестабильный лаг обновления, ещё у одного виден рост числа ретраев. Пока система держится, но сигнал уже не хочется игнорировать.' },
          { role: 'user', text: 'Что это значит для пользователей данных?' },
          { role: 'assistant', text: 'Для пользователей это риск более позднего обновления и локально устаревших цифр утром. Если лаг вырастет ещё немного, они уже заметят проблему.' },
          { role: 'user', text: 'Что проверяем первым?' },
          { role: 'assistant', text: 'Сначала стоит проверить источник деградации: лимиты API, объем входящих данных и время ответа внешнего сервиса. Обычно один из этих факторов и даёт основной вклад.' },
        ),
      },
      {
        id: 'task-vendor-limits',
        title: 'Контроль API-лимитов',
        preview: 'Следить за ростом нагрузки и заранее готовить запросы на расширение лимитов.',
        cadence: 'Каждый вторник в 16:00',
        prompt: 'Проверь API-лимиты вендоров и выдели, где скоро потребуется расширение.',
        messages: taskConversation(
          { role: 'user', text: 'Проверь, по каким API мы уже близки к лимитам.' },
          { role: 'assistant', text: 'По двум интеграциям нагрузка подбирается к верхней границе, особенно в пиковые окна. Пока лимит не упирается в потолок, но запас уже слишком небольшой.' },
          { role: 'user', text: 'Где расширение нужно просить в первую очередь?' },
          { role: 'assistant', text: 'Там, где одновременно растёт и объем запросов, и бизнес-зависимость от своевременной доставки данных. Такой кейс лучше не откладывать до фактического упора в лимит.' },
          { role: 'user', text: 'Что написать вендору?' },
          { role: 'assistant', text: 'Я бы попросил расширение с привязкой к прогнозу роста нагрузки и подчеркнул, что это превентивный шаг, а не реакция на уже случившийся инцидент.' },
        ),
      },
      {
        id: 'task-vendor-rca',
        title: 'Разбор RCA поставщиков',
        preview: 'Сверять качество incident review от вендоров и отмечать пробелы в corrective actions.',
        cadence: 'Каждый четверг в 18:20',
        prompt: 'Проверь RCA от поставщиков и выдели места, где corrective actions слишком размыты.',
        messages: taskConversation(
          { role: 'user', text: 'Разбери свежие RCA от поставщиков.' },
          { role: 'assistant', text: 'В одном RCA причина описана хорошо, но corrective actions слишком общие. В другом есть действия, но не хватает объяснения, почему проблема вообще возникла.' },
          { role: 'user', text: 'Какой из этих разборов хуже?' },
          { role: 'assistant', text: 'Хуже тот, где есть действия без ясной причины. Без нормального root cause мы не понимаем, действительно ли меры что-то предотвращают.' },
          { role: 'user', text: 'Какой feedback дать поставщику?' },
          { role: 'assistant', text: 'Нужно попросить их конкретизировать root cause, добавить проверяемые corrective actions и указать, как они поймут, что проблема не повторится.' },
        ),
      },
    ],
    'research-pilot': [
      {
        id: 'task-research-hypothesis',
        title: 'Обновление research backlog',
        preview: 'Переоценивать гипотезы, статусы экспериментов и что имеет смысл прогонять дальше.',
        cadence: 'Каждый будний в 09:25',
        prompt: 'Обнови research backlog и предложи, какие гипотезы двигать дальше в первую очередь.',
        messages: taskConversation(
          { role: 'user', text: 'Обнови research backlog по агентам и гипотезам.' },
          { role: 'assistant', text: 'Сейчас backlog лучше всего делится на три слоя: гипотезы с быстрым сигналом, гипотезы с зависимостью от данных и идеи, которые пока не стоит тащить в ближайший спринт. Это уже упрощает приоритизацию.' },
          { role: 'user', text: 'Что бы ты поставил первым?' },
          { role: 'assistant', text: 'Первым я бы оставил гипотезы, которые можно проверить без долгой инфраструктурной подготовки. Они быстрее всего дают обучение команде.' },
          { role: 'user', text: 'Какой короткий вывод для research sync?' },
          { role: 'assistant', text: 'Вывод такой: сейчас важнее не расширять список идей, а быстрее закрывать те гипотезы, по которым у нас уже есть измеримый способ проверки.' },
        ),
      },
      {
        id: 'task-research-evals',
        title: 'Прогон evals по агентам',
        preview: 'Сравнивать accuracy, latency и format adherence по последним изменениям в пилотах.',
        cadence: 'Каждую среду в 14:15',
        prompt: 'Прогони evals по агентам и покажи, где есть регресс по качеству или формату.',
        messages: taskConversation(
          { role: 'user', text: 'Прогони evals по агентам после последних изменений.' },
          { role: 'assistant', text: 'По результатам видно лёгкий регресс в format adherence у одного агента и улучшение latency у другого. Accuracy в среднем стабильна, но один набор кейсов всё ещё шумит.' },
          { role: 'user', text: 'Что из этого реально блокирует пилот?' },
          { role: 'assistant', text: 'Если агент перестаёт стабильно держать формат ответа, это быстрее всего бьёт по пилоту. Такой регресс обычно важнее небольшого выигрыша или проигрыша по latency.' },
          { role: 'user', text: 'Какой следующий шаг ты бы сделал?' },
          { role: 'assistant', text: 'Я бы локализовал, на каких кейсах ломается формат, и отдельно прогнал их после правки промпта или рендеринга. Это даст самый понятный короткий цикл улучшения.' },
        ),
      },
      {
        id: 'task-research-summary',
        title: 'Сводка по экспериментам',
        preview: 'Собирать выводы по гипотезам, что подтвердилось и какие тесты запускать следующими.',
        cadence: 'Каждую пятницу в 15:50',
        prompt: 'Собери сводку по экспериментам и предложи, какие тесты запускать следующими.',
        messages: taskConversation(
          { role: 'user', text: 'Собери сводку по экспериментам за неделю.' },
          { role: 'assistant', text: 'На этой неделе часть гипотез подтвердилась частично: мы лучше понимаем ограничения формата и видим, где агентам не хватает устойчивости на длинном контексте. Это уже хороший материал для следующей итерации.' },
          { role: 'user', text: 'Какие тесты логично поставить дальше?' },
          { role: 'assistant', text: 'Следом я бы запускал тесты на повторяемость результата и на поведение в сценариях с шумными входными данными. Они быстрее всего покажут, можно ли идти в более широкий пилот.' },
          { role: 'user', text: 'Что сказать команде одним предложением?' },
          { role: 'assistant', text: 'Одним предложением: мы сузили зону неопределенности и теперь должны проверить устойчивость агентов на более жёстких сценариях, а не просто на красивых демо-кейсах.' },
        ),
      },
    ],
  };

  const baseTasks = taskMap[agent.id] ?? [
    {
      id: `task-${agent.id}-daily`,
      title: `Оперативная сводка для ${agent.name}`,
      preview: `Собирать короткий статус по главным сигналам, задачам и блокерам для агента ${agent.name}.`,
      cadence: 'Каждый будний в 09:00',
      prompt: `Подготовь оперативную сводку для ${agent.name} и выдели главные сигналы дня.`,
      messages: taskConversation(
        { role: 'user', text: `Собери для ${agent.name} оперативную сводку по текущему статусу.` },
        { role: 'assistant', text: `Для ${agent.name} сейчас важнее всего коротко показать ключевые сигналы, один главный риск и ближайший следующий шаг. Такой формат лучше всего подходит для утреннего статуса.` },
        { role: 'user', text: 'Что вынести в самый верх?' },
        { role: 'assistant', text: 'В самый верх я бы вынес один главный сдвиг в данных или процессе, который уже сегодня влияет на решение команды.' },
      ),
    },
    {
      id: `task-${agent.id}-weekly`,
      title: `Недельный обзор для ${agent.name}`,
      preview: 'Собирать summary по ключевым изменениям, рискам и следующим шагам на неделю.',
      cadence: 'Каждую пятницу в 17:30',
      prompt: `Подготовь недельный обзор для ${agent.name} по изменениям, рискам и следующим шагам.`,
      messages: taskConversation(
        { role: 'user', text: `Подготовь недельный обзор для ${agent.name}.` },
        { role: 'assistant', text: `В недельном обзоре для ${agent.name} я бы собрал ключевые изменения, что оказалось риском и какие действия логично переносить на следующую неделю. Это помогает не потерять контекст между циклами.` },
        { role: 'user', text: 'Что отметить отдельным блоком?' },
        { role: 'assistant', text: 'Отдельным блоком стоит отметить всё, что не просто произошло, а потребует решения или дополнительного согласования в следующем цикле.' },
      ),
    },
  ];

  return baseTasks.map(ensureTaskConversationDepth);
}

function AgentCard({
  agent,
  isActive,
  onClick,
}: {
  agent: MockAgent;
  isActive: boolean;
  onClick: () => void;
}) {
  const latestTopicTitle = agent.topics[0]?.title ?? 'Новая тема';
  const isNotificationsAgent = agent.id === 'notifications-agent';

  return (
    <button
      className={`ai-chat-agent-card${isActive ? ' is-active' : ''}`}
      type="button"
      onClick={onClick}
    >
      <span className={`ai-chat-agent-card__badge${isNotificationsAgent ? ' ai-chat-agent-card__badge--notifications' : ''}`}>
        {isNotificationsAgent ? <Bell size={18} strokeWidth={2.2} /> : agent.badge}
      </span>
      <span className="ai-chat-agent-card__body">
        <span className="ai-chat-agent-card__name">{agent.name}</span>
        <span className="ai-chat-agent-card__availability">{latestTopicTitle}</span>
      </span>
    </button>
  );
}

function TopicCard({
  topic,
  availableTags,
  workspaceName,
  badgeLabel,
  preview,
  time,
  isActive,
  onClick,
  onTagsChange,
}: {
  topic: Pick<MockAgentTopic, 'id' | 'title' | 'preview' | 'lastDiscussed' | 'tags' | 'workspaceTagId'>;
  availableTags?: string[];
  workspaceName?: string;
  badgeLabel?: string;
  preview?: string;
  time?: string;
  isActive: boolean;
  onClick: () => void;
  onTagsChange?: (nextTags: string[]) => void;
}) {
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const [draftTag, setDraftTag] = useState('');
  const tagMenuRef = useRef<HTMLDivElement | null>(null);
  const tags = topic.tags ?? [];
  const visibleTags = tags.slice(0, 2);
  const hiddenTagsCount = Math.max(0, tags.length - visibleTags.length);

  useEffect(() => {
    if (!isTagMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!tagMenuRef.current?.contains(event.target as Node)) {
        setIsTagMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isTagMenuOpen]);

  const handleTagToggle = (tag: string) => {
    if (!onTagsChange) {
      return;
    }

    onTagsChange(tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag]);
  };

  const handleCreateTag = () => {
    const normalizedTag = draftTag.trim();

    if (!normalizedTag || !onTagsChange) {
      return;
    }

    if (!tags.includes(normalizedTag)) {
      onTagsChange([...tags, normalizedTag]);
    }

    setDraftTag('');
    setIsTagMenuOpen(false);
  };

  return (
    <div className={`ai-chat-topic-card${isActive ? ' is-active' : ''}`}>
      <button className="ai-chat-topic-card__main" type="button" onClick={onClick}>
        <span className="ai-chat-topic-card__body">
          <span className="ai-chat-topic-card__topline">
            <span className="ai-chat-topic-card__title">{topic.title}</span>
            <span className="ai-chat-topic-card__time">{time ?? topic.lastDiscussed}</span>
          </span>
          <span className="ai-chat-topic-card__preview">{preview ?? topic.preview}</span>
        </span>
      </button>
      <div className="ai-chat-topic-card__footer">
        {availableTags && onTagsChange ? (
          <div ref={tagMenuRef} className={`ai-chat-topic-card__tag-shell${isTagMenuOpen ? ' is-open' : ''}`}>
            <button
              className="ai-chat-topic-card__tag-trigger"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsTagMenuOpen((open) => !open);
              }}
            >
              <span className="ai-chat-topic-card__tag-trigger-list">
                {workspaceName ? (
                  <span className="ai-chat-topic-card__tag-chip is-space">{workspaceName}</span>
                ) : null}
                {visibleTags.length ? visibleTags.map((tag) => <span key={tag} className="ai-chat-topic-card__tag-chip">{tag}</span>) : <span className="ai-chat-topic-card__tag-chip is-placeholder">Теги</span>}
                {hiddenTagsCount ? <span className="ai-chat-topic-card__tag-chip is-counter">+{hiddenTagsCount}</span> : null}
              </span>
            </button>

            {isTagMenuOpen ? (
              <div className="ai-chat-topic-card__tag-menu" role="dialog" aria-label="Управление тегами">
                <div className="ai-chat-topic-card__tag-menu-title">Теги темы</div>
                <div className="ai-chat-topic-card__tag-menu-list">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      className={`ai-chat-topic-card__tag-menu-item${tags.includes(tag) ? ' is-active' : ''}`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleTagToggle(tag);
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="ai-chat-topic-card__tag-menu-create">
                  <input
                    className="ai-chat-topic-card__tag-input"
                    type="text"
                    value={draftTag}
                    onChange={(event) => setDraftTag(event.target.value)}
                    placeholder="Новый тег"
                  />
                  <button className="ai-chat-topic-card__tag-create-button" type="button" onClick={handleCreateTag}>
                    Создать тег
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        <span className="ai-chat-topic-card__footer-actions">
          {badgeLabel ? <span className="ai-chat-topic-card__pill">{badgeLabel}</span> : null}
        </span>
      </div>
    </div>
  );
}

function WorkspaceBadge({
  workspace,
  compact = false,
}: {
  workspace: MockAgentWorkspace;
  compact?: boolean;
}) {
  const isAllSpacesWorkspace = workspace.id === 'external';

  return (
    <span className={`ai-chat-workspace-badge ai-chat-workspace-badge--${workspace.accent}${compact ? ' is-compact' : ''}`}>
      {isAllSpacesWorkspace ? <LayoutGrid size={compact ? 24 : 28} strokeWidth={2.25} /> : workspace.badge}
      {!isAllSpacesWorkspace && !!workspace.unreadCount && (
        <span className="ai-chat-workspace-badge__count">{workspace.unreadCount}</span>
      )}
    </span>
  );
}

export function AiChatSidebar({
  workspaces,
  folders,
  agents,
  scheduledTasks,
  availableTopicTags,
  selectedWorkspaceId,
  selectedAgentId,
  selectedTopicId,
  selectedTaskId,
  selectedCardKind,
  chatSearch,
  onWorkspaceSelect,
  onChatSearchChange,
  onAgentSelect,
  onCreateTopic,
  onCreateTask,
  onTopicSelect,
  onTopicTagsChange,
  onTaskSelect,
}: AiChatSidebarProps) {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const workspaceMenuRef = useRef<HTMLDivElement | null>(null);
  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? workspaces[0];
  const normalizedChatSearch = chatSearch.trim().toLowerCase();
  const filteredAgents = normalizedChatSearch
    ? agents.filter((agent) => {
        const matchesAgent = agent.name.toLowerCase().includes(normalizedChatSearch);
        const matchesTopic = agent.topics.some((topic) => topicMatchesSearch(topic, normalizedChatSearch, workspaces));

        return matchesAgent || matchesTopic;
      })
    : agents;
  const selectedAgent = filteredAgents.find((agent) => agent.id === selectedAgentId) ?? filteredAgents[0] ?? agents[0];
  const selectedFolder = folders.find((folder) => folder.id === selectedAgent?.folderId) ?? folders[0];
  const filteredTopics = normalizedChatSearch
    ? (selectedAgent?.topics ?? []).filter((topic) => topicMatchesSearch(topic, normalizedChatSearch, workspaces))
    : (selectedAgent?.topics ?? []);
  const filteredTasks = normalizedChatSearch
    ? scheduledTasks.filter((task) => taskMatchesSearch(task, normalizedChatSearch))
    : scheduledTasks;
  const sortedTopics = selectedAgent
    ? [...filteredTopics].sort((left, right) => {
        const leftMatchesSelectedWorkspace = left.workspaceTagId === selectedWorkspaceId;
        const rightMatchesSelectedWorkspace = right.workspaceTagId === selectedWorkspaceId;

        if (leftMatchesSelectedWorkspace !== rightMatchesSelectedWorkspace) {
          return leftMatchesSelectedWorkspace ? -1 : 1;
        }

        return getSortValue(right.lastDiscussed) - getSortValue(left.lastDiscussed);
      })
    : [];
  const sortedTimelineItems = [
    ...filteredTasks.map((task) => ({
      kind: 'task' as const,
      id: task.id,
      sortValue: getSortValue(task.cadence),
      task,
    })),
    ...sortedTopics.map((topic) => ({
      kind: 'topic' as const,
      id: topic.id,
      sortValue: getSortValue(topic.lastDiscussed),
      topic,
      matchesSelectedWorkspace: topic.workspaceTagId === selectedWorkspaceId,
    })),
  ].sort((left, right) => {
    if (selectedWorkspaceId !== 'external') {
      const leftWorkspacePriority = left.kind === 'topic' && left.matchesSelectedWorkspace ? 1 : 0;
      const rightWorkspacePriority = right.kind === 'topic' && right.matchesSelectedWorkspace ? 1 : 0;

      if (leftWorkspacePriority !== rightWorkspacePriority) {
        return rightWorkspacePriority - leftWorkspacePriority;
      }
    }

    return right.sortValue - left.sortValue;
  });

  useEffect(() => {
    if (!isWorkspaceMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target as Node)) {
        setIsWorkspaceMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isWorkspaceMenuOpen]);

  return (
    <>
      <aside className="ai-chat-agents-panel">
        <div className="ai-chat-panel-brand ai-chat-panel-brand--compact">
          <div className="ai-chat-panel-brand__eyebrow">Datacraft AI</div>
        </div>

        <div className="ai-chat-workspace-switcher" ref={workspaceMenuRef}>
          <button
            className={`ai-chat-workspace-switcher__control${isWorkspaceMenuOpen ? ' is-open' : ''}`}
            type="button"
            onClick={() => setIsWorkspaceMenuOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={isWorkspaceMenuOpen}
          >
            <span className="ai-chat-workspace-switcher__current">
              <WorkspaceBadge workspace={selectedWorkspace} compact />
            </span>
            {isWorkspaceMenuOpen ? <ChevronUp size={18} strokeWidth={2.25} /> : <ChevronDown size={18} strokeWidth={2.25} />}
          </button>

          {isWorkspaceMenuOpen && (
            <div className="ai-chat-workspace-menu" role="listbox" aria-label="Список рабочих пространств">
              {workspaces.map((workspace) => {
                const isActive = workspace.id === selectedWorkspace.id;

                return (
                  <button
                    key={workspace.id}
                    className={`ai-chat-workspace-menu__item${isActive ? ' is-active' : ''}`}
                    type="button"
                    onClick={() => {
                      onWorkspaceSelect(workspace.id);
                      setIsWorkspaceMenuOpen(false);
                    }}
                  >
                    <WorkspaceBadge workspace={workspace} />
                    <span className="ai-chat-workspace-menu__copy">
                      <span className="ai-chat-workspace-menu__name">{workspace.name}</span>
                    </span>
                    {isActive ? <Check size={20} strokeWidth={2.25} /> : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="ai-chat-agent-search">
          <input
            className="ai-chat-agent-search__input"
            type="search"
            value={chatSearch}
            onChange={(event) => onChatSearchChange(event.target.value)}
            placeholder="Поиск по чатам"
            aria-label="Поиск по чатам"
          />
        </div>

        <div className="ai-chat-agent-list">
          {filteredAgents.length ? (
            filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isActive={agent.id === selectedAgentId}
                onClick={() => onAgentSelect(agent.id)}
              />
            ))
          ) : (
            <div className="ai-chat-empty-state">Ничего не найдено по агентам и темам.</div>
          )}
        </div>
      </aside>

      <aside className="ai-chat-topics-panel">
        <div className="ai-chat-panel-brand">
          <div className="ai-chat-panel-brand__title">{selectedAgent?.name ?? 'Выберите агента'}</div>
        </div>

        <div className="ai-chat-topics-actions">
          <button className="ai-chat-scheduled-tasks-section__action" type="button" onClick={onCreateTask}>
            <CalendarPlus size={16} strokeWidth={2.2} />
            Запланированные задачи
          </button>
        </div>

        <div className="ai-chat-topics-section-label">Темы</div>

        <div className="ai-chat-topic-list">
          {selectedAgent ? (
            <>
              {sortedTimelineItems.map((item) =>
                item.kind === 'task' ? (
                  <TopicCard
                    key={item.id}
                    topic={{
                      id: item.task.id,
                      title: item.task.title,
                      preview: item.task.preview,
                      lastDiscussed: item.task.cadence,
                      tags: [],
                    }}
                    badgeLabel="Выполненная задача"
                    preview={item.task.preview}
                    time={item.task.cadence}
                    isActive={selectedCardKind === 'task' && selectedTaskId === item.task.id}
                    onClick={() => onTaskSelect(item.task.id, normalizedChatSearch)}
                  />
                ) : (
                  <TopicCard
                    key={item.id}
                    topic={item.topic}
                    availableTags={availableTopicTags}
                    workspaceName={workspaces.find((workspace) => workspace.id === item.topic.workspaceTagId)?.name}
                    isActive={selectedCardKind === 'topic' && selectedTopicId === item.topic.id}
                    onTagsChange={(nextTags) => onTopicTagsChange(item.topic.id, nextTags)}
                    onClick={() => {
                      onTopicSelect(item.topic.id, normalizedChatSearch);
                    }}
                  />
                ),
              )}
            </>
          ) : (
            <div className="ai-chat-empty-state">
              {normalizedChatSearch ? 'По выбранному запросу чаты не найдены.' : 'В этой папке пока нет агентов.'}
            </div>
          )}
        </div>

        <div className="ai-chat-topics-panel__footer">
          <button className="ai-chat-create-topic-button" type="button" onClick={onCreateTopic} disabled={!selectedAgent}>
            <Plus size={16} strokeWidth={2.25} />
            <span>Новый чат</span>
          </button>
        </div>
      </aside>
    </>
  );
}
