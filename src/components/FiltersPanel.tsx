import { ChevronDown, Filter, Tag, X } from 'lucide-react';
import { filterOptions } from '../data/dashboardData';

type FiltersPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
};

export function FiltersPanel({ isOpen, onClose, onApply }: FiltersPanelProps) {
  return (
    <>
      <button
        className={`drawer-backdrop${isOpen ? ' is-open' : ''}`}
        type="button"
        aria-label="Закрыть фильтры"
        onClick={onClose}
      />

      <aside className={`side-panel side-panel--filters drawer-panel${isOpen ? ' is-open' : ''}`}>
        <div className="drawer-panel__header">
          <div className="panel-heading">Фильтры</div>
          <button className="drawer-panel__close" type="button" aria-label="Закрыть фильтры" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <button className="panel-add-button" type="button">
          <Filter size={18} />
          Добавить фильтр
        </button>

        <div className="panel-tabs">
          <button className="panel-tabs__item is-active" type="button">
            Все фильтры
          </button>
          <button className="panel-tabs__item" type="button">
            Сохраненные
          </button>
        </div>

        <div className="filter-form">
          <label className="field-label" htmlFor="filter-name">
            Название фильтра
          </label>
          <div className="select-wrap">
            <select id="filter-name" defaultValue="all">
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={18} />
          </div>
        </div>

        <div className="side-panel__footer">
          <button className="apply-button" type="button" onClick={onApply}>
            <Tag size={18} />
            Применить фильтры
          </button>
          <button className="clear-link" type="button">
            Очистить всё
          </button>
        </div>
      </aside>
    </>
  );
}
