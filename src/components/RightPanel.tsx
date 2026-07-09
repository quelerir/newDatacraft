import { BarChart3, ChevronDown, Search, X } from 'lucide-react';
import type { DemoChartItem } from '../data/dashboardData';

type RightPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  charts: DemoChartItem[];
  onAddChart: (chartKey: string) => void;
  onChartDragStateChange?: (isDragging: boolean) => void;
};

export function RightPanel({ isOpen, onClose, charts, onAddChart, onChartDragStateChange }: RightPanelProps) {
  return (
    <aside
      className={`side-panel side-panel--right drawer-panel drawer-panel--right drawer-panel--right-with-skills-gap${isOpen ? ' is-open' : ''}`}
    >
      <div className="drawer-panel__header">
        <div className="panel-tabs panel-tabs--compact">
          <button className="panel-tabs__item is-active" type="button">
            Графики
          </button>
          <button className="panel-tabs__item" type="button">
            Проекты
          </button>
          <button className="panel-tabs__item" type="button">
            Элементы
          </button>
        </div>
        <button className="drawer-panel__close" type="button" aria-label="Закрыть графики" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <button className="panel-add-button" type="button">
        <BarChart3 size={18} />
        Добавить график
      </button>

      <div className="right-panel__controls">
        <label className="search-field">
          <Search size={17} />
          <input type="text" placeholder="Поиск..." />
        </label>

        <div className="select-wrap select-wrap--small">
          <select defaultValue="date">
            <option value="date">По дате</option>
            <option value="name">По названию</option>
            <option value="type">По типу</option>
          </select>
          <ChevronDown size={16} />
        </div>
      </div>

      <label className="switch">
        <input type="checkbox" defaultChecked />
        <span className="switch__slider" />
        <span className="switch__label">Только мои графики</span>
      </label>

      <div className="demo-chart-list">
        {charts.map((item) => (
          <button
            className="demo-chart-item"
            type="button"
            key={item.key}
            draggable
            onClick={() => onAddChart(item.key)}
            onDragStart={(event) => {
              event.dataTransfer.setData('text/chart-key', item.key);
              event.dataTransfer.effectAllowed = 'move';
              onChartDragStateChange?.(true);
            }}
            onDragEnd={() => onChartDragStateChange?.(false)}
          >
            <div className="demo-chart-item__icon">
              <BarChart3 size={18} />
            </div>
            <div className="demo-chart-item__meta">
              <span className="demo-chart-item__title">{item.title}</span>
              <span className="demo-chart-item__type">{item.type}</span>
              {item.subtitle ? <span className="demo-chart-item__subtitle">{item.subtitle}</span> : null}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
