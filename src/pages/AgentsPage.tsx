import { BarChart3 } from 'lucide-react';
import { CatalogPageLayout, type TagItem } from '../components/CatalogPageLayout';
import { workspaceTabs } from '../data/sourcesCatalogData';

const agentTags: TagItem[] = [
  { key: 'test', label: 'Тестовая категория', primary: true },
  { key: 'growth', label: 'Рост' },
  { key: 'executive', label: 'Руководство' },
];

const agentRows = Array.from({ length: 12 }, (_, index) => ({
  id: `agent-${index + 1}`,
  favorite: index === 1,
  tagKey: index % 3 === 0 ? 'test' : index % 3 === 1 ? 'growth' : 'executive',
  name: `Agent name -${index + 1}`,
  editedBy: 'Name',
  status: 'Published',
  changed: '23 days ago',
  createdBy: 'Ekaterina Pichugina',
  owner: 'UN',
  relationHeading: 'Связи',
  relationItems: [],
  relationSections: [
    {
      heading: 'Входит в ассистенты',
      items:
        index % 3 === 0
          ? ['E-commerce: от клика до повторной покупки', 'Retention weekly pulse', 'LTV Control Center']
          : index % 3 === 1
            ? ['Performance overview', 'CRM health monitor']
            : ['Executive conversion board'],
    },
    {
      heading: 'Связанная витрина',
      items:
        index % 4 === 0
          ? ['dm_sales_daily']
          : index % 4 === 1
            ? ['dm_user_ltv']
            : index % 4 === 2
              ? ['dm_crm_funnels']
              : ['dm_catalog_margin'],
    },
  ],
}));

export function AgentsPage() {
  return (
    <CatalogPageLayout
      activeTabPath="/agents"
      tabs={workspaceTabs}
      tags={agentTags}
      createLabel="Создать агента"
      createIcon={BarChart3}
      rows={agentRows}
    />
  );
}
