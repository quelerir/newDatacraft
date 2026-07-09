import { useThreadListNew } from '@assistant-ui/core/react';
import { useAui, useAuiState } from '@assistant-ui/store';
import { useEffect, useMemo, useRef, useState } from 'react';

function formatThreadTitle(title: string | undefined, index: number) {
  if (title && title.trim()) return title.trim();
  return `Чат ${index + 1}`;
}

function formatThreadTime(value: Date | undefined) {
  if (!value) return 'Без активности';

  const date = value instanceof Date ? value : new Date(value);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  if (isYesterday) {
    return 'Вчера';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function ChatThreadList() {
  const aui = useAui();
  const { switchToNewThread } = useThreadListNew();
  const threadItems = useAuiState((state) => state.threads.threadItems);
  const mainThreadId = useAuiState((state) => state.threads.mainThreadId);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);

  const visibleThreadItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return [...threadItems]
      .filter((item) => item.status !== 'deleted')
      .sort((left, right) => {
        if (left.id === mainThreadId) return -1;
        if (right.id === mainThreadId) return 1;

        const leftTime = left.lastMessageAt ? new Date(left.lastMessageAt).getTime() : 0;
        const rightTime = right.lastMessageAt ? new Date(right.lastMessageAt).getTime() : 0;
        return rightTime - leftTime;
      })
      .filter((item, index) => {
        if (!normalizedQuery) return true;
        const title = formatThreadTitle(item.title, index).toLowerCase();
        return title.includes(normalizedQuery);
      });
  }, [mainThreadId, searchQuery, threadItems]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <section ref={rootRef} className="assistant-thread-list">
      <div className="assistant-thread-list__header">
        <button
          className={`assistant-thread-list__toggle${isExpanded ? ' is-expanded' : ''}`}
          type="button"
          onClick={() => {
            setSearchQuery('');
            setIsExpanded((value) => !value);
          }}
          aria-haspopup="listbox"
          aria-expanded={isExpanded}
        >
          <span className="assistant-thread-list__toggle-copy">
            <span className="assistant-thread-list__toggle-title">История чатов</span>
          </span>
          <span className="assistant-thread-list__toggle-icon" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        <button
          className="assistant-thread-list__new-button"
          type="button"
          onClick={switchToNewThread}
        >
          Новый
        </button>
      </div>

      {isExpanded ? (
        <div className="assistant-thread-list__items" role="listbox" aria-label="Список чатов">
          <div className="assistant-thread-list__search">
            <input
              className="assistant-thread-list__search-input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Поиск по чатам"
              aria-label="Поиск по чатам"
            />
          </div>

          <div className="assistant-thread-list__section-title">Недавние чаты</div>

          {visibleThreadItems.length ? (
            visibleThreadItems.map((item, index) => {
              const isActive = item.id === mainThreadId;

              return (
                <button
                  key={item.id}
                  className={`assistant-thread-list__item${isActive ? ' is-active' : ''}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    aui.threads().item({ id: item.id }).switchTo();
                    setIsExpanded(false);
                  }}
                >
                  <span className="assistant-thread-list__item-topline">
                    <span className="assistant-thread-list__item-title">
                      {formatThreadTitle(item.title, index)}
                    </span>
                    <span className="assistant-thread-list__item-time">
                      {formatThreadTime(item.lastMessageAt)}
                    </span>
                  </span>
                  <span className="assistant-thread-list__item-meta">
                    {isActive ? 'Текущий чат' : 'Открыть чат'}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="assistant-thread-list__empty">
              {searchQuery.trim() ? 'Ничего не найдено' : 'Пока нет сохранённых чатов'}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
