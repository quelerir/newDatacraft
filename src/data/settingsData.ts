export type PurchasedModuleKey = 'stream' | 'source' | 'showcase' | 'agent' | 'assistant';

export type PurchasedModule = {
  key: PurchasedModuleKey;
  label: string;
  shortDescription: string;
  fullDescription: string;
  includes: string[];
  sourceItems?: Array<{
    key: string;
    label: string;
    description: string;
    settingsSections: Array<{
      title: string;
      options: string[];
    }>;
  }>;
  settingsSections: Array<{
    title: string;
    options: string[];
  }>;
  accent: 'lime' | 'slate';
};

export const purchasedModules: PurchasedModule[] = [
  {
    key: 'stream',
    label: 'Поток',
    shortDescription: 'dataCraft Core для orchestration и управления DAG-ами.',
    fullDescription:
      'Модуль типа "Поток" отвечает за orchestration: склейку, планирование, правила атрибуции и управление группами DAG-ов.',
    includes: ['dataCraft Core', 'Планировщик DAG-ов', 'Политики ретраев', 'Системные логи выполнения'],
    settingsSections: [
      { title: 'Модели атрибуции', options: ['First click', 'Last click', 'Линейная модель'] },
      { title: 'Правила склейки', options: ['Склейка по user_id', 'Склейка по cookie', 'Приоритет CRM-идентификатора'] },
      { title: 'Параметры DAG-ов и расписаний', options: ['Ежечасный запуск', 'Ночные перерасчеты', 'Ретраи при ошибке'] },
    ],
    accent: 'lime',
  },
  {
    key: 'source',
    label: 'Источники',
    shortDescription: 'Набор конкретных источников данных, которые можно включать для инстанса.',
    fullDescription:
      'Модуль типа "Источники" открывает каталог подключаемых систем. В правом меню включаются уже конкретные источники: Яндекс.Метрика, GA4, AppMetrica, рекламные кабинеты, CRM и другие интеграции.',
    includes: ['50+ коннекторов Airbyte', 'Маркетинговые источники', 'Продуктовые и CRM-источники', 'Sandbox-коннекторы'],
    sourceItems: [
      {
        key: 'yandex-metrica',
        label: 'Яндекс.Метрика',
        description: 'Веб-аналитика, цели, визиты и ecommerce-события.',
        settingsSections: [
          { title: 'Подключение', options: ['OAuth токен', 'Counter ID', 'Endpoint API'] },
          { title: 'Что выгружать', options: ['Визиты', 'Цели', 'Ecommerce', 'UTM-метки'] },
          { title: 'Синхронизация', options: ['Ежечасно', 'Daily backfill', 'Ретрай при ошибке'] },
        ],
      },
      {
        key: 'ga4',
        label: 'Google Analytics 4',
        description: 'События, user properties и web/app аналитика.',
        settingsSections: [
          { title: 'Подключение', options: ['Service account', 'Property ID', 'Dataset region'] },
          { title: 'Что выгружать', options: ['Events', 'Sessions', 'User properties', 'Conversions'] },
          { title: 'Синхронизация', options: ['Intraday sync', 'Daily sync', 'Quota guard'] },
        ],
      },
      {
        key: 'appmetrica',
        label: 'AppMetrica',
        description: 'Мобильная аналитика, installs и in-app события.',
        settingsSections: [
          { title: 'Подключение', options: ['API key', 'Application ID', 'Export token'] },
          { title: 'Что выгружать', options: ['Installs', 'Sessions', 'Revenue', 'Custom events'] },
          { title: 'Синхронизация', options: ['Hourly export', 'Late events', 'Duplicate protection'] },
        ],
      },
      {
        key: 'amocrm',
        label: 'amoCRM',
        description: 'Лиды, сделки и воронка CRM.',
        settingsSections: [
          { title: 'Подключение', options: ['Client ID', 'Secret', 'Аккаунт CRM'] },
          { title: 'Что выгружать', options: ['Лиды', 'Сделки', 'Контакты', 'Поля воронки'] },
          { title: 'Синхронизация', options: ['Incremental sync', 'Webhook sync', 'Retry queue'] },
        ],
      },
      {
        key: 'postgres',
        label: 'PostgreSQL',
        description: 'Продуктовые таблицы и кастомные бизнес-данные.',
        settingsSections: [
          { title: 'Подключение', options: ['Host', 'Port', 'Database', 'SSL mode'] },
          { title: 'Что выгружать', options: ['Выбранные таблицы', 'Схемы', 'Views', 'CDC'] },
          { title: 'Синхронизация', options: ['Full refresh', 'Incremental key', 'Schedule'] },
        ],
      },
    ],
    settingsSections: [
      { title: 'Маркетинговые и web-источники', options: ['Яндекс.Метрика', 'Google Analytics 4', 'AppMetrica', 'Google Ads', 'VK Ads', 'Яндекс.Директ'] },
      { title: 'Продуктовые и бизнес-источники', options: ['PostgreSQL', 'ClickHouse import', 'amoCRM', 'Bitrix24', 'CSV / Google Sheets', 'Webhook API'] },
      { title: 'Тестовые и дополнительные источники', options: ['Sandbox connector', 'S3 bucket', 'Kafka stream', 'MySQL', 'Firebase', 'Mixpanel'] },
    ],
    accent: 'lime',
  },
  {
    key: 'showcase',
    label: 'Витрина',
    shortDescription: 'ClickHouse, Qdrant и интернет-витрины для публикации данных.',
    fullDescription:
      'Модуль типа "Витрина" управляет готовыми data-слоями: доступами к БД, прокси, схемами публикации и витринным профилем.',
    includes: ['ClickHouse витрины', 'Qdrant-профили', 'Прокси-доступы', 'Публикация интернет-витрин'],
    settingsSections: [
      { title: 'Доступы к БД', options: ['Read-only доступ', 'Service account', 'Ограничение по IP'] },
      { title: 'Прокси и сетевые параметры', options: ['HTTP proxy', 'Private network', 'Ограничение по доменам'] },
      { title: 'Параметры публикации витрин', options: ['Публичная витрина', 'Внутренний доступ', 'Версионирование схемы'] },
    ],
    accent: 'lime',
  },
  {
    key: 'agent',
    label: 'Агент',
    shortDescription: 'BI-часть, lore и GEO-агенты.',
    fullDescription:
      'Модуль типа "Агент" отвечает за бывшие графики: BI-виджеты, lore-блоки и специализированные GEO-агенты.',
    includes: ['BI-виджеты', 'Lore-конфиги', 'GEO-агенты', 'Общие визуальные настройки'],
    settingsSections: [
      { title: 'Цветовая палитра и визуальные параметры', options: ['Основной цвет', 'Типографика', 'Формат карточек'] },
      { title: 'Lore-конфиг', options: ['Контекст домена', 'Тон ответов', 'Справочные блоки'] },
      { title: 'Общий промпт для GEO-агента', options: ['Базовый системный промпт', 'Ограничения региона', 'Правила маршрутизации'] },
    ],
    accent: 'lime',
  },
  {
    key: 'assistant',
    label: 'Ассистент',
    shortDescription: 'OpenRouter, Codex, Claude Code и маршрутизация моделей.',
    fullDescription:
      'Модуль типа "Ассистент" управляет AI-сценариями: промптами, провайдерами, fallback-моделями и лимитами.',
    includes: ['OpenRouter routing', 'Codex', 'Claude Code', 'Prompt-профили'],
    settingsSections: [
      { title: 'Провайдер и маршрут модели', options: ['Основной провайдер', 'Приоритет моделей', 'Маршрут по типу задач'] },
      { title: 'Fallback-модели', options: ['Резервная модель', 'Fallback по таймауту', 'Fallback по лимитам'] },
      { title: 'Лимиты, квоты и prompt-профили', options: ['Дневной лимит', 'Квота по командам', 'Профиль системного промпта'] },
    ],
    accent: 'slate',
  },
];
