import { Bot } from 'lucide-react';
import { CatalogPageLayout, type TagItem } from '../components/CatalogPageLayout';
import { workspaceTabs } from '../data/sourcesCatalogData';

const assistantTags: TagItem[] = [
  { key: 'test', label: 'Тестовая категория', primary: true },
  { key: 'retention', label: 'Удержание' },
  { key: 'commerce', label: 'Коммерция' },
];

const assistantRows = Array.from({ length: 12 }, (_, index) => ({
  id: `assistant-${index + 1}`,
  favorite: index === 2,
  tagKey: index % 3 === 0 ? 'test' : index % 3 === 1 ? 'retention' : 'commerce',
  name: `Assistant name -${index + 1}`,
  editedBy: 'Name',
  status: index % 4 === 0 ? 'Draft' : 'Published',
  changed: '23 days ago',
  createdBy: 'Ekaterina Pichugina',
  owner: 'UN',
  relationHeading: 'Входящие агенты',
  relationItems:
    index % 3 === 0
      ? ['Покупки по дням', 'Выручка по каналам', 'Источники трафика', 'Воронка продаж']
      : index % 3 === 1
        ? ['Cohort retention', 'Repeat purchase rate', 'Средний чек']
        : ['ROAS по источникам', 'Фрод-мониторинг', 'Активные промо'],
}));

export function AssistantsPage() {
  return (
    <CatalogPageLayout
      activeTabPath="/assistants"
      tabs={workspaceTabs}
      tags={assistantTags}
      createLabel="Создать ассистента"
      createIcon={Bot}
      createPath="/superset/welcome"
      rows={assistantRows}
    />
  );
}
