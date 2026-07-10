import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FilePenLine,
  MoreHorizontal,
  Star,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';

export type FolderItem = {
  key: string;
  label: string;
  primary?: boolean;
};

export type TagItem = FolderItem;

type FilterField = {
  label: string;
  placeholder: string;
  accent?: boolean;
};

export type CatalogRow = {
  id: string;
  favorite?: boolean;
  unavailable?: boolean;
  tagKey?: string;
  name: string;
  editedBy: string;
  status: string;
  changed: string;
  createdBy: string;
  owner: string;
  relationHeading: string;
  relationItems: string[];
  relationSections?: Array<{
    heading: string;
    items: string[];
  }>;
  settingsItems?: Array<{
    label: string;
    description?: string;
    enabled?: boolean;
    modalItems?: Array<{
      label: string;
      description?: string;
      enabled?: boolean;
    }>;
  }>;
};

export type CatalogTab = {
  label: string;
  path: string;
};

type CatalogPageLayoutProps = {
  createLabel?: string;
  createIcon?: LucideIcon;
  createPath?: string;
  activeTabPath: string;
  tabs?: CatalogTab[];
  tags?: TagItem[];
  rows: CatalogRow[];
  expandableRows?: boolean;
  showCreateAction?: boolean;
  interactiveExpandedCards?: boolean;
};

const defaultTagItems: TagItem[] = [{ key: 'test', label: 'Тестовая категория', primary: true }];

const filterFields: FilterField[] = [
  { label: 'Search', placeholder: 'Type a value' },
  { label: 'Owner', placeholder: 'Type a value', accent: true },
  { label: 'Created by', placeholder: 'Type a value' },
  { label: 'Status', placeholder: 'Type a value' },
  { label: 'Категория', placeholder: 'Выберите категорию' },
  { label: 'Certified', placeholder: 'Type a value' },
  { label: 'Certified', placeholder: 'Type a value' },
  { label: 'Certified', placeholder: 'Type a value' },
];

const defaultTabs: CatalogTab[] = [
  { label: 'Агенты', path: '/agents' },
  { label: 'Ассистенты', path: '/assistants' },
];

export function CatalogPageLayout({
  createLabel,
  createIcon: CreateIcon,
  createPath,
  activeTabPath,
  tabs = defaultTabs,
  tags = defaultTagItems,
  rows,
  expandableRows = true,
  showCreateAction = true,
  interactiveExpandedCards = false,
}: CatalogPageLayoutProps) {
  const [activeTagKey, setActiveTagKey] = useState<string>('');
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const [activeModalSection, setActiveModalSection] = useState<{
    rowId: string;
    rowName: string;
    heading: string;
    settingsItems: Array<{
      label: string;
      description?: string;
      enabled?: boolean;
    }>;
  } | null>(null);
  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>({});
  const tagMenuRef = useRef<HTMLDivElement | null>(null);

  const visibleRows = useMemo(
    () => rows.filter((row) => !activeTagKey || row.tagKey === activeTagKey),
    [activeTagKey, rows],
  );
  const selectedTag = useMemo(
    () => tags.find((tag) => tag.key === activeTagKey),
    [activeTagKey, tags],
  );
  const tagCounts = useMemo(
    () =>
      Object.fromEntries(
        tags.map((tag) => [
          tag.key,
          rows.filter((row) => row.tagKey === tag.key).length,
        ]),
      ),
    [rows, tags],
  );
  const tagLabels = useMemo(() => Object.fromEntries(tags.map((tag) => [tag.key, tag.label])), [tags]);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(
    expandableRows ? (visibleRows[0]?.id ?? null) : null,
  );

  useEffect(() => {
    if (!expandableRows) {
      setExpandedRowId(null);
      return;
    }

    setExpandedRowId((current) => {
      if (current && visibleRows.some((row) => row.id === current)) {
        return current;
      }

      return visibleRows[0]?.id ?? null;
    });
  }, [expandableRows, visibleRows]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!tagMenuRef.current?.contains(event.target as Node)) {
        setIsTagMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!activeModalSection) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveModalSection(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeModalSection]);

  const canShowCreateAction = showCreateAction && createLabel && CreateIcon;

  return (
    <div className="app-shell">
      <Header />

      <main className="catalog-page">
        <section className="catalog-toolbar">
          <div className="catalog-toolbar__start">
            <div className="catalog-switcher" aria-label="Переключение раздела">
              {tabs.map((tab) => {
                const isActive = activeTabPath === tab.path;

                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`catalog-switcher__item${isActive ? ' is-active' : ''}`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            <div className="catalog-folders">
              <div ref={tagMenuRef} className={`catalog-folder-select${isTagMenuOpen ? ' is-open' : ''}`}>
                <button
                  className="catalog-folder-select__control"
                  type="button"
                  onClick={() => setIsTagMenuOpen((value) => !value)}
                  aria-haspopup="listbox"
                  aria-expanded={isTagMenuOpen}
                >
                  <span className="catalog-folder-select__value">
                    <span className="catalog-folder-select__name">{selectedTag?.label ?? 'Категория не выбрана'}</span>
                    <span className="catalog-folder-select__count">
                      {activeTagKey ? tagCounts[activeTagKey] ?? 0 : rows.length} элементов
                    </span>
                  </span>
                  <ChevronDown size={16} />
                </button>
                {isTagMenuOpen ? (
                  <div className="catalog-folder-menu" role="listbox" aria-label="Список категорий">
                    <button
                      className={`catalog-folder-menu__item${activeTagKey === '' ? ' is-active' : ''}`}
                      type="button"
                      role="option"
                      aria-selected={activeTagKey === ''}
                      onClick={() => {
                        setActiveTagKey('');
                        setIsTagMenuOpen(false);
                      }}
                    >
                      <span>Категория не выбрана</span>
                      <span>{rows.length}</span>
                    </button>
                    {tags.map((tag) => (
                      <button
                        key={tag.key}
                        className={`catalog-folder-menu__item${activeTagKey === tag.key ? ' is-active' : ''}`}
                        type="button"
                        role="option"
                        aria-selected={activeTagKey === tag.key}
                        onClick={() => {
                          setActiveTagKey(tag.key);
                          setIsTagMenuOpen(false);
                        }}
                      >
                        <span>{tag.label}</span>
                        <span>{tagCounts[tag.key] ?? 0}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="catalog-toolbar__actions">
            {canShowCreateAction ? (
              createPath ? (
                <Link className="catalog-create-button" to={createPath}>
                  <CreateIcon size={18} />
                  {createLabel}
                </Link>
              ) : (
                <button className="catalog-create-button" type="button">
                  <CreateIcon size={18} />
                  {createLabel}
                </button>
              )
            ) : null}
            <button className="catalog-icon-button" type="button" aria-label="Экспорт">
              <Download size={22} />
            </button>
          </div>
        </section>

        <section className="catalog-filters">
          {filterFields.map((field) => (
            <label key={field.label} className="catalog-filter">
              <span className="catalog-filter__label">{field.label}</span>
              <span className={`catalog-filter__control${field.accent ? ' is-accent' : ''}`}>
                <span>{field.placeholder}</span>
                <ChevronDown size={15} />
              </span>
            </label>
          ))}
        </section>

        <section className="catalog-table-card">
          <div className="catalog-table">
            <div className="catalog-table__head">
              <span>Название</span>
              <span>Редактировал</span>
              <span>Статус</span>
              <span>Категория</span>
              <span>Изменен</span>
              <span>Создан</span>
              <span>Владелец</span>
              <span>Действия</span>
            </div>

            <div className="catalog-table__body">
              {visibleRows.map((row) => {
                const isExpanded = expandableRows && expandedRowId === row.id;
                const relationSections = row.relationSections ?? [
                  {
                    heading: row.relationHeading,
                    items: row.relationItems,
                  },
                ];
                const totalRelationItems = relationSections.reduce((sum, section) => sum + section.items.length, 0);
                const metaLabel = relationSections.length > 1 ? 'связанных элементов' : row.relationHeading.toLowerCase();

                return (
                  <Fragment key={row.id}>
                    <div
                      className={`catalog-table__row${row.favorite ? ' is-highlighted' : ''}${
                        row.unavailable ? ' is-unavailable' : ''
                      }`}
                    >
                      <div className="catalog-table__name">
                        {expandableRows ? (
                          <button
                            className={`catalog-expand-button${isExpanded ? ' is-expanded' : ''}`}
                            type="button"
                            aria-label={isExpanded ? 'Свернуть строку' : 'Раскрыть строку'}
                            onClick={() => setExpandedRowId((current) => (current === row.id ? null : row.id))}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        ) : null}
                        <Star size={16} className={row.favorite ? 'is-favorite' : ''} />
                        <div className="catalog-table__name-text">
                          <span className="catalog-table__name-label">{row.name}</span>
                          <span className="catalog-table__meta">
                            {totalRelationItems} {metaLabel}
                          </span>
                        </div>
                      </div>
                      <span>{row.editedBy}</span>
                      <span>{row.status}</span>
                      <span>{row.tagKey ? tagLabels[row.tagKey] ?? row.tagKey : '—'}</span>
                      <span>{row.changed}</span>
                      <span>{row.createdBy}</span>
                      <span className="catalog-owner-badge">{row.owner}</span>
                      <div className="catalog-row-actions">
                        <button type="button" aria-label="Удалить">
                          <Trash2 size={16} />
                        </button>
                        <button type="button" aria-label="Редактировать">
                          <FilePenLine size={16} />
                        </button>
                        <button type="button" aria-label="Скачать">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                    {isExpanded ? (
                      <div className="catalog-table__expanded">
                        <div className="catalog-expanded-card">
                          {relationSections.map((section) => (
                            interactiveExpandedCards ? (
                              <div key={section.heading} className="catalog-expanded-section">
                                <div className="catalog-expanded-card__header">
                                  <span className="catalog-expanded-card__label">{section.heading}</span>
                                  <span className="catalog-expanded-card__count">{section.items.length}</span>
                                </div>
                                <div className="catalog-related-list">
                                  {section.items.map((item) => {
                                    const itemSettings = row.settingsItems?.find((settingsItem) => settingsItem.label === item);

                                    return (
                                      <button
                                        key={item}
                                        className="catalog-related-pill catalog-related-pill--button"
                                        type="button"
                                        onClick={() =>
                                          setActiveModalSection({
                                            rowId: row.id,
                                            rowName: row.name,
                                            heading: item,
                                            settingsItems:
                                              itemSettings?.modalItems ??
                                              [{
                                                label: itemSettings?.label ?? item,
                                                description: itemSettings?.description ?? 'Настройка для выбранного модуля',
                                                enabled: itemSettings?.enabled ?? true,
                                              }],
                                          })
                                        }
                                      >
                                        {item}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div key={section.heading} className="catalog-expanded-section">
                                <div className="catalog-expanded-card__header">
                                  <span className="catalog-expanded-card__label">{section.heading}</span>
                                  <span className="catalog-expanded-card__count">{section.items.length}</span>
                                </div>
                                <div className="catalog-related-list">
                                  {section.items.map((item) => (
                                    <span key={item} className="catalog-related-pill">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </Fragment>
                );
              })}
              {!visibleRows.length ? (
                <div className="catalog-table__empty">
                  <h3>В выбранной категории пока пусто</h3>
                  <p>Смените категорию сверху, чтобы посмотреть другие mock-данные.</p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <footer className="catalog-pagination">
          <div className="catalog-pagination__left">
            <span>Выводить по</span>
            <button className="catalog-page-size" type="button">
              10
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="catalog-pagination__center">
            <button className="catalog-page-nav" type="button">
              <ChevronsLeft size={16} />
            </button>
            <button className="catalog-page-nav" type="button">
              <ChevronLeft size={16} />
            </button>
            <button className="catalog-page-number is-active" type="button">
              1
            </button>
            <button className="catalog-page-number" type="button">
              2
            </button>
            <button className="catalog-page-number" type="button">
              3
            </button>
            <button className="catalog-page-number" type="button">
              ...
            </button>
            <button className="catalog-page-number" type="button">
              10
            </button>
            <button className="catalog-page-nav" type="button">
              <ChevronRight size={16} />
            </button>
            <button className="catalog-page-nav" type="button">
              <ChevronsRight size={16} />
            </button>
          </div>

          <div className="catalog-pagination__right">
            <span>Страница</span>
            <button className="catalog-page-size" type="button">
              10
              <ChevronDown size={14} />
            </button>
            <span>из 10</span>
          </div>
        </footer>

        {activeModalSection ? (
          <div className="catalog-settings-modal" role="dialog" aria-modal="true" aria-label={activeModalSection.heading}>
            <button
              className="catalog-settings-modal__backdrop"
              type="button"
              aria-label="Закрыть окно"
              onClick={() => setActiveModalSection(null)}
            />
            <div className="catalog-settings-modal__card">
              <div className="catalog-settings-modal__header">
                <div>
                  <div className="catalog-settings-modal__title">{activeModalSection.heading}</div>
                  <div className="catalog-settings-modal__subtitle">
                    {activeModalSection.rowName} • {activeModalSection.settingsItems.length} параметра
                  </div>
                </div>
                <button
                  className="catalog-settings-modal__close"
                  type="button"
                  aria-label="Закрыть"
                  onClick={() => setActiveModalSection(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="catalog-settings-modal__list">
                {activeModalSection.settingsItems.map((item) => {
                  const switchKey = `${activeModalSection.rowId}:${activeModalSection.heading}:${item.label}`;
                  const isEnabled = switchStates[switchKey] ?? item.enabled ?? true;

                  return (
                    <div key={switchKey} className="catalog-settings-modal__item">
                      <div className="catalog-settings-modal__item-copy">
                        <strong>{item.label}</strong>
                        <span>{item.description ?? 'Настройка для выбранного модуля'}</span>
                      </div>
                      <label className="catalog-settings-modal__switch">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() =>
                            setSwitchStates((current) => ({
                              ...current,
                              [switchKey]: !isEnabled,
                            }))
                          }
                        />
                        <span className={`catalog-settings-modal__switch-slider${isEnabled ? ' is-on' : ''}`} />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

      </main>
    </div>
  );
}
