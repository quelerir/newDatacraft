import { ChevronDown, MoreHorizontal, Pencil, RotateCcw, Undo2 } from 'lucide-react';

type DashboardToolbarProps = {
  isEditingDashboard: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveEditing: () => void;
};

export function DashboardToolbar({
  isEditingDashboard,
  onStartEditing,
  onCancelEditing,
  onSaveEditing,
}: DashboardToolbarProps) {
  return (
    <section className="dashboard-toolbar">
      <div className="dashboard-toolbar__title-group">
        <button className="ghost-star" type="button" aria-label="Избранное">
          ☆
        </button>
        <h1 className="dashboard-toolbar__title">E-commerce: от клика до повторной покупки</h1>
        <button className="ghost-pencil" type="button" aria-label="Редактировать название">
          <Pencil size={16} />
        </button>
      </div>

      <div className="dashboard-toolbar__actions">
        <button className="toolbar-icon" type="button" aria-label="Отменить последние действия">
          <Undo2 size={20} />
        </button>
        <button className="toolbar-icon" type="button" aria-label="Вернуть действия">
          <RotateCcw size={20} />
        </button>

        {isEditingDashboard ? (
          <>
            <button
              className="toolbar-button toolbar-button--muted"
              type="button"
              onClick={onCancelEditing}
            >
              Отменить
            </button>
            <button
              className="toolbar-button toolbar-button--primary"
              type="button"
              onClick={onSaveEditing}
            >
              Сохранить
              <ChevronDown size={18} />
            </button>
          </>
        ) : (
          <button
            className="toolbar-button toolbar-button--primary"
            type="button"
            onClick={onStartEditing}
          >
            Редактировать дашборд
          </button>
        )}

        <button className="toolbar-round" type="button" aria-label="Дополнительное меню">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </section>
  );
}
