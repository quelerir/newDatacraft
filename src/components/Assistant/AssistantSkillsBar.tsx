import { BarChart3, Database, LineChart, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';

const skillItems = [
  {
    label: 'Dashboard QA',
    description: 'Анализ графиков',
    tone: 'active',
    icon: LineChart,
  },
  {
    label: 'SQL Builder',
    description: 'Генерация запросов',
    tone: 'ready',
    icon: Database,
  },
  {
    label: 'Insight Finder',
    description: 'Поиск аномалий',
    tone: 'ready',
    icon: Search,
  },
  {
    label: 'Narrative',
    description: 'Объяснение метрик',
    tone: 'idle',
    icon: Sparkles,
  },
] as const;

type AssistantSkillsBarProps = {
  pinnedCharts?: Array<{
    key: string;
    title: string;
    subtitle?: string;
  }>;
  onChartDrop?: (chartKey: string) => void;
  showDropHint?: boolean;
};

export function AssistantSkillsBar({ pinnedCharts = [], onChartDrop, showDropHint = false }: AssistantSkillsBarProps) {
  const defaultSkill = skillItems.find((skill) => skill.tone === 'active') ?? skillItems[0];
  const [selectedSkill, setSelectedSkill] = useState<string>(defaultSkill.label);
  const activeSkill = skillItems.find((skill) => skill.label === selectedSkill) ?? defaultSkill;

  return (
    <section
      className={`assistant-skills${pinnedCharts.length ? ' has-pinned-chart' : ''}`}
      aria-label="Статус навыков AI Assistant"
      onDragOver={(event) => {
        if (!onChartDrop) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(event) => {
        if (!onChartDrop) return;
        event.preventDefault();
        const chartKey = event.dataTransfer.getData('text/chart-key');
        if (chartKey) onChartDrop(chartKey);
      }}
    >
      <div className="assistant-skills__list">
        {showDropHint ? (
          <div className="assistant-skills__drop-hint">
            <span className="assistant-skills__drop-hint-title">Можно положить график сюда</span>
            <span className="assistant-skills__drop-hint-text">Перетащите карточку в skills, чтобы закрепить ее в чате</span>
          </div>
        ) : null}
        {pinnedCharts.map((chart) => (
          <div key={chart.key} className="assistant-skill-chip assistant-skill-chip--chart is-selected">
            <span className="assistant-skill-chip__icon">
              <BarChart3 size={13} />
            </span>
            <span className="assistant-skill-chip__content">
              <span className="assistant-skill-chip__title">{chart.title}</span>
              <span className="assistant-skill-chip__description">{chart.subtitle ?? 'Закреплен в skills'}</span>
            </span>
          </div>
        ))}
        {skillItems.map((skill) => {
          const Icon = skill.icon;
          const isSelected = skill.label === activeSkill.label;

          return (
            <button
              key={skill.label}
              className={`assistant-skill-chip assistant-skill-chip--${skill.tone}${isSelected ? ' is-selected' : ''}`}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedSkill(skill.label)}
            >
              <span className="assistant-skill-chip__icon">
                <Icon size={13} />
              </span>
              <span className="assistant-skill-chip__content">
                <span className="assistant-skill-chip__title">{skill.label}</span>
                <span className="assistant-skill-chip__description">{skill.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
