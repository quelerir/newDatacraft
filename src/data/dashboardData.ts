import type { EChartsOption } from 'echarts';

export type MenuItem = {
  label: string;
  active?: boolean;
  path?: string;
  matchPaths?: string[];
};

export type FilterOption = {
  label: string;
  value: string;
};

export type DemoChartItem = {
  key: string;
  title: string;
  type: string;
  updatedAt: string;
  subtitle?: string;
};

export type DashboardAssistantContext = {
  dashboard: {
    title: string;
    description: string;
  };
  filters: Array<{
    label: string;
    options: string[];
    active: string;
  }>;
  charts: Array<{
    key: string;
    title: string;
    type: string;
  }>;
  metrics: Array<{
    label: string;
    value: string;
    trend: string;
  }>;
};

const accent = '#9BEA36';
const gridLine = '#E8EDF3';
const axisLabel = '#7D8795';
const titleColor = '#1F252D';

export const navigationItems: MenuItem[] = [
  { label: 'Агенты', active: true, path: '/assistants', matchPaths: ['/assistants', '/agents', '/showcases'] },
  { label: 'Источники', path: '/streams', matchPaths: ['/streams', '/sources', '/source-showcases'] },
  { label: 'Настройки', path: '/settings', matchPaths: ['/settings'] },
];

export const dashboardTitle = 'E-commerce: от клика до повторной покупки';

export const filterOptions: FilterOption[] = [
  { label: 'Все каналы', value: 'all' },
  { label: 'Performance', value: 'performance' },
  { label: 'Email', value: 'email' },
  { label: 'Organic', value: 'organic' },
  { label: 'CRM', value: 'crm' },
  { label: 'Marketplace', value: 'marketplace' },
];

export const rightPanelCharts: DemoChartItem[] = [
  { key: 'purchases', title: 'Покупки по дням', type: 'Линейный график', updatedAt: 'Сегодня', subtitle: 'Последние 14 дней' },
  { key: 'revenue', title: 'Выручка по каналам', type: 'Bar chart', updatedAt: 'Сегодня', subtitle: 'Июнь 2026' },
  { key: 'traffic', title: 'Источники трафика', type: 'Pie chart', updatedAt: 'Сегодня', subtitle: 'Распределение сессий' },
  { key: 'funnel', title: 'Воронка продаж', type: 'Funnel chart', updatedAt: 'Сегодня', subtitle: 'От просмотра до оплаты' },
];

export type ChartDefinition = {
  key: string;
  title: string;
  subtitle: string;
  option: EChartsOption;
};

export const chartDefinitions: ChartDefinition[] = [
  {
    key: 'purchases',
    title: 'Покупки по дням',
    subtitle: 'Последние 14 дней',
    option: {
      tooltip: { trigger: 'axis' },
      grid: { left: 20, right: 18, top: 28, bottom: 20, containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['16 июн', '18 июн', '20 июн', '22 июн', '24 июн', '26 июн', '28 июн', '30 июн'],
        axisLine: { lineStyle: { color: '#DDE5EE' } },
        axisTick: { show: false },
        axisLabel: { color: axisLabel, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: gridLine } },
        axisLabel: { color: axisLabel, fontSize: 11 },
      },
      series: [
        {
          data: [140, 172, 168, 210, 246, 228, 282, 315],
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: accent, width: 4 },
          itemStyle: { color: accent, borderColor: '#FFFFFF', borderWidth: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(155, 234, 54, 0.35)' },
                { offset: 1, color: 'rgba(155, 234, 54, 0.02)' },
              ],
            },
          },
        },
      ],
    },
  },
  {
    key: 'revenue',
    title: 'Выручка по каналам',
    subtitle: 'Июнь 2026',
    option: {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 20, right: 12, top: 28, bottom: 20, containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Ads', 'SEO', 'Email', 'CRM', 'Mobile'],
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#DDE5EE' } },
        axisLabel: { color: axisLabel, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: gridLine } },
        axisLabel: {
          color: axisLabel,
          fontSize: 11,
          formatter: '{value}k',
        },
      },
      series: [
        {
          data: [92, 68, 54, 39, 83],
          type: 'bar',
          barWidth: 28,
          itemStyle: {
            color: '#B7C5D9',
            borderRadius: [10, 10, 0, 0],
          },
          emphasis: { itemStyle: { color: accent } },
        },
      ],
    },
  },
  {
    key: 'traffic',
    title: 'Источники трафика',
    subtitle: 'Распределение сессий',
    option: {
      tooltip: { trigger: 'item' },
      legend: {
        bottom: 0,
        icon: 'circle',
        textStyle: { color: axisLabel, fontSize: 11 },
      },
      series: [
        {
          type: 'pie',
          radius: ['48%', '76%'],
          center: ['50%', '46%'],
          avoidLabelOverlap: false,
          label: {
            color: titleColor,
            fontSize: 11,
            formatter: '{d}%',
          },
          labelLine: { length: 10, length2: 8 },
          data: [
            { value: 36, name: 'Organic', itemStyle: { color: accent } },
            { value: 24, name: 'Performance', itemStyle: { color: '#C9D3E0' } },
            { value: 18, name: 'Email', itemStyle: { color: '#7C879B' } },
            { value: 14, name: 'Social', itemStyle: { color: '#DCE4EE' } },
            { value: 8, name: 'Referral', itemStyle: { color: '#ADB8C8' } },
          ],
        },
      ],
    },
  },
  {
    key: 'funnel',
    title: 'Воронка продаж',
    subtitle: 'От просмотра до оплаты',
    option: {
      tooltip: { trigger: 'item', formatter: '{b}: {c}' },
      series: [
        {
          type: 'funnel',
          left: '10%',
          top: 18,
          bottom: 12,
          width: '80%',
          min: 0,
          max: 100,
          minSize: '35%',
          maxSize: '100%',
          sort: 'descending',
          gap: 4,
          label: {
            show: true,
            position: 'inside',
            color: '#1D1D1D',
            fontWeight: 700,
          },
          itemStyle: {
            borderColor: '#FFFFFF',
            borderWidth: 2,
          },
          data: [
            { value: 100, name: 'Просмотры', itemStyle: { color: '#DBF6B9' } },
            { value: 74, name: 'Карточка товара', itemStyle: { color: '#C5F07E' } },
            { value: 48, name: 'Корзина', itemStyle: { color: '#ADEE4B' } },
            { value: 29, name: 'Оформление', itemStyle: { color: accent } },
            { value: 18, name: 'Оплата', itemStyle: { color: '#79BF17' } },
          ],
        },
      ],
    },
  },
];

export function buildDashboardContext(): DashboardAssistantContext {
  return {
    dashboard: {
      title: dashboardTitle,
      description: 'Дашборд e-commerce в стиле dataCraft на mock-данных.',
    },
    filters: [
      {
        label: 'Название фильтра',
        options: filterOptions.map((option) => option.label),
        active: 'Все каналы',
      },
    ],
    charts: [
      { key: 'purchases', title: 'Покупки по дням', type: 'line' },
      { key: 'revenue', title: 'Выручка по каналам', type: 'bar' },
      { key: 'traffic', title: 'Источники трафика', type: 'pie' },
      { key: 'funnel', title: 'Воронка продаж', type: 'funnel' },
    ],
    metrics: [
      { label: 'Покупки', value: '315', trend: '+11.7%' },
      { label: 'Выручка', value: '336k', trend: '+7.9%' },
      { label: 'Organic share', value: '36%', trend: '+4.1%' },
      { label: 'Checkout conversion', value: '18%', trend: '-2.4%' },
    ],
  };
}
