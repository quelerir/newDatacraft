import { Database, Layers3, Network, Puzzle } from 'lucide-react';
import type { CatalogRow, CatalogTab, TagItem } from '../components/CatalogPageLayout';

export const sourceTags: TagItem[] = [
  { key: 'test', label: 'Тестовый тег', primary: true },
  { key: 'prod', label: 'Prod' },
  { key: 'sandbox', label: 'Sandbox' },
];

export const workspaceTabs: CatalogTab[] = [
  { label: 'Ассистенты', path: '/assistants' },
  { label: 'Агенты', path: '/agents' },
  { label: 'Витрина', path: '/showcases' },
];

export const sourceTabs: CatalogTab[] = [
  { label: 'Поток', path: '/streams' },
  { label: 'Источники', path: '/sources' },
  { label: 'Витрина', path: '/source-showcases' },
];

export const sourceCreateConfigs = {
  extras: { label: 'Добавить элемент', icon: Puzzle },
  showcases: { label: 'Создать витрину', icon: Layers3 },
  sources: { label: 'Добавить источник', icon: Database },
  streams: { label: 'Создать поток', icon: Network },
} as const;

export const sourceRows: Record<'sources' | 'showcases' | 'streams' | 'extras', CatalogRow[]> = {
  sources: [
    {
      id: 'source-1',
      favorite: true,
      tagKey: 'test',
      name: 'PostgreSQL Production',
      editedBy: 'Data Team',
      status: 'Active',
      changed: '12 мин назад',
      createdBy: 'Ekaterina Pichugina',
      owner: 'UN',
      relationHeading: 'Связи',
      relationItems: [],
      relationSections: [
        { heading: 'Связанная витрина', items: ['dm_sales_daily'] },
        { heading: 'Связанные потоки', items: ['orders-to-warehouse', 'returns-reconciliation', 'margin-refresh-nightly'] },
      ],
    },
    {
      id: 'source-2',
      tagKey: 'prod',
      name: 'CRM Hub',
      editedBy: 'Growth',
      status: 'Active',
      changed: '35 мин назад',
      createdBy: 'Alex Ivanov',
      owner: 'GR',
      relationHeading: 'Связи',
      relationItems: [],
      relationSections: [
        { heading: 'Связанная витрина', items: ['dm_crm_funnels'] },
        { heading: 'Связанные потоки', items: ['crm-sync-hourly', 'crm-health-refresh'] },
      ],
    },
    {
      id: 'source-3',
      tagKey: 'sandbox',
      name: 'Ads Export S3',
      editedBy: 'Marketing',
      status: 'Warning',
      changed: '1 час назад',
      createdBy: 'Mikhail Smirnov',
      owner: 'MK',
      relationHeading: 'Связи',
      relationItems: [],
      relationSections: [
        { heading: 'Связанная витрина', items: ['dm_marketing_spend'] },
        { heading: 'Связанные потоки', items: ['ads-cost-enrichment', 'campaign-attribution-daily', 'roas-monitor'] },
      ],
    },
    {
      id: 'source-4',
      tagKey: 'test',
      name: 'Mobile Events',
      editedBy: 'Product',
      status: 'Draft',
      changed: 'Сегодня',
      createdBy: 'Anna Petrova',
      owner: 'AP',
      relationHeading: 'Связи',
      relationItems: [],
      relationSections: [
        { heading: 'Связанная витрина', items: ['dm_mobile_funnel'] },
        { heading: 'Связанные потоки', items: ['mobile-events-hourly', 'session-quality-refresh'] },
      ],
    },
  ],
  showcases: [
    {
      id: 'showcase-1',
      favorite: true,
      tagKey: 'test',
      name: 'dm_sales_daily',
      editedBy: 'Analytics',
      status: 'Published',
      changed: 'Сегодня',
      createdBy: 'Ekaterina Pichugina',
      owner: 'AN',
      relationHeading: 'Связанный агент',
      relationItems: ['Sales Pulse Agent'],
      relationSections: [
        { heading: 'Связанный агент', items: ['Sales Pulse Agent'] },
      ],
    },
    {
      id: 'showcase-2',
      tagKey: 'prod',
      name: 'dm_user_ltv',
      editedBy: 'Retention',
      status: 'Published',
      changed: 'Вчера',
      createdBy: 'Alex Ivanov',
      owner: 'RT',
      relationHeading: 'Связанный агент',
      relationItems: ['LTV Retention Agent'],
      relationSections: [
        { heading: 'Связанный агент', items: ['LTV Retention Agent'] },
      ],
    },
    {
      id: 'showcase-3',
      tagKey: 'sandbox',
      name: 'dm_crm_funnels',
      editedBy: 'CRM',
      status: 'Warning',
      changed: '2 дня назад',
      createdBy: 'Mikhail Smirnov',
      owner: 'CR',
      relationHeading: 'Связанный агент',
      relationItems: ['CRM Funnel Agent'],
      relationSections: [
        { heading: 'Связанный агент', items: ['CRM Funnel Agent'] },
      ],
    },
    {
      id: 'showcase-4',
      tagKey: 'test',
      name: 'dm_catalog_margin',
      editedBy: 'Commerce',
      status: 'Draft',
      changed: 'Сегодня',
      createdBy: 'Anna Petrova',
      owner: 'CM',
      relationHeading: 'Связанный агент',
      relationItems: ['Margin Control Agent'],
      relationSections: [
        { heading: 'Связанный агент', items: ['Margin Control Agent'] },
      ],
    },
  ],
  streams: [
    { id: 'stream-1', favorite: true, tagKey: 'test', name: 'orders-to-warehouse', editedBy: 'Platform', status: 'Running', changed: '5 мин назад', createdBy: 'Ekaterina Pichugina', owner: 'PL', relationHeading: 'Связанный источник', relationItems: ['PostgreSQL Production'] },
    { id: 'stream-2', tagKey: 'prod', name: 'crm-sync-hourly', editedBy: 'Growth', status: 'Running', changed: '18 мин назад', createdBy: 'Alex Ivanov', owner: 'GR', relationHeading: 'Связанный источник', relationItems: ['CRM Hub'] },
    { id: 'stream-3', tagKey: 'sandbox', name: 'ads-cost-enrichment', editedBy: 'Marketing', status: 'Paused', changed: 'Сегодня', createdBy: 'Mikhail Smirnov', owner: 'MK', relationHeading: 'Связанный источник', relationItems: ['Ads Export S3'] },
    { id: 'stream-4', tagKey: 'test', name: 'returns-reconciliation', editedBy: 'Finance', status: 'Draft', changed: 'Вчера', createdBy: 'Anna Petrova', owner: 'FN', relationHeading: 'Связанный источник', relationItems: ['Mobile Events'] },
  ],
  extras: [
    { id: 'extra-1', favorite: true, tagKey: 'test', name: 'currency_rates_ref', editedBy: 'Finance', status: 'Published', changed: 'Сегодня', createdBy: 'Ekaterina Pichugina', owner: 'FN', relationHeading: 'Используется в витринах', relationItems: ['dm_margin_control', 'dm_catalog_margin', 'dm_pnl_report'] },
    { id: 'extra-2', tagKey: 'prod', name: 'geo_lookup_service', editedBy: 'Platform', status: 'Active', changed: '1 час назад', createdBy: 'Alex Ivanov', owner: 'PL', relationHeading: 'Используется в витринах', relationItems: ['dm_delivery_map', 'dm_session_quality'] },
    { id: 'extra-3', tagKey: 'sandbox', name: 'tmp_margin_backfill', editedBy: 'Commerce', status: 'Draft', changed: 'Сегодня', createdBy: 'Mikhail Smirnov', owner: 'CM', relationHeading: 'Используется в витринах', relationItems: ['dm_catalog_margin'] },
    { id: 'extra-4', tagKey: 'test', name: 'partner_mappings', editedBy: 'Ops', status: 'Published', changed: '2 дня назад', createdBy: 'Anna Petrova', owner: 'OP', relationHeading: 'Используется в витринах', relationItems: ['dm_partner_revenue', 'dm_roas_control'] },
  ],
};
