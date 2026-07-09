import { ComposerPrimitive, ThreadPrimitive, unstable_useComposerInput, useAuiState } from '@assistant-ui/react';
import { AttachmentUI } from '@assistant-ui/react-ui';
import { createContext, useContext } from 'react';
import { ArrowUp, FolderOpen, Paperclip, Plus, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ComposerWorkspaceOption = {
  id: string;
  name: string;
};

type AiChatComposerContextValue = {
  threadKind: 'task' | 'topic';
  assignableWorkspaces: ComposerWorkspaceOption[];
  onAssignWorkspace: (workspaceId: string) => void;
};

export const AiChatComposerContext = createContext<AiChatComposerContextValue>({
  threadKind: 'topic',
  assignableWorkspaces: [],
  onAssignWorkspace: () => undefined,
});

function ComposerMenu() {
  const attachmentsSupported = useAuiState((state) => state.thread.capabilities.attachments);
  const [isOpen, setIsOpen] = useState(false);
  const [isWorkspacePickerOpen, setIsWorkspacePickerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { threadKind, assignableWorkspaces, onAssignWorkspace } = useContext(AiChatComposerContext);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  return (
    <div className="ai-chat-composer-menu" ref={menuRef}>
      <button
        className="ai-chat-composer-plus"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Plus size={16} />
      </button>

      {isOpen ? (
        <div className="ai-chat-composer-dropdown" role="menu" aria-label="Добавить в сообщение">
          <ComposerPrimitive.AddAttachment asChild disabled={!attachmentsSupported}>
            <button
              className="ai-chat-composer-dropdown-item"
              type="button"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <Paperclip size={16} />
              Загрузить файл
            </button>
          </ComposerPrimitive.AddAttachment>

          <button
            className="ai-chat-composer-dropdown-item"
            type="button"
            role="menuitem"
            onClick={() => setIsWorkspacePickerOpen((current) => !current)}
            disabled={threadKind !== 'topic'}
          >
            <FolderOpen size={16} />
            Отнести к пространству
          </button>

          {isWorkspacePickerOpen && threadKind === 'topic' ? (
            <div className="ai-chat-composer-submenu" role="menu" aria-label="Выбор пространства">
              <div className="ai-chat-composer-submenu__label">Выберите пространство</div>
              {assignableWorkspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  className="ai-chat-composer-submenu-item"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onAssignWorkspace(workspace.id);
                    setIsOpen(false);
                    setIsWorkspacePickerOpen(false);
                  }}
                >
                  <span className="ai-chat-composer-submenu-item__title">{workspace.name}</span>
                  <span className="ai-chat-composer-submenu-item__caption">Привязать тему</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ComposerAttachments() {
  const attachments = useAuiState((state) => state.composer.attachments);

  if (!attachments.length) return null;

  return (
    <div className="ai-chat-composer-attachments">
      <ComposerPrimitive.Attachments
        components={{
          Attachment: AttachmentUI,
        }}
      />
    </div>
  );
}

function ComposerAction() {
  const canCancel = useAuiState((state) => state.thread.capabilities.cancel);
  const composerText = useAuiState((state) => state.composer.text);
  const composer = unstable_useComposerInput();
  const { threadKind } = useContext(AiChatComposerContext);
  const isTaskThread = threadKind === 'task';
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [repeat, setRepeat] = useState('Каждый день');

  useEffect(() => {
    if (!isScheduleModalOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsScheduleModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScheduleModalOpen]);

  const handleTaskSendClick = () => {
    if (!composerText.trim()) {
      return;
    }

    setIsScheduleModalOpen(true);
  };

  const handleScheduleConfirm = () => {
    const scheduleLabel =
      repeat === 'Без повтора'
        ? `> **Исполнить:** ${scheduleDate} в ${scheduleTime}`
        : `> **Исполнить:** ${scheduleDate} в ${scheduleTime}, ${repeat.toLowerCase()}`;

    composer.setText(`${composerText.trim()}\n\n${scheduleLabel}`);
    composer.send();
    setIsScheduleModalOpen(false);
  };

  return (
    <>
      <ThreadPrimitive.If running={false}>
        {isTaskThread ? (
          <button
            className="ai-chat-composer-send ai-chat-composer-send--task"
            type="button"
            aria-label="Отправить сообщение"
            onClick={handleTaskSendClick}
            disabled={!composerText.trim()}
          >
            Запланировать
          </button>
        ) : (
          <ComposerPrimitive.Send asChild>
            <button className="ai-chat-composer-send" type="button" aria-label="Отправить сообщение">
              <ArrowUp size={18} />
            </button>
          </ComposerPrimitive.Send>
        )}
      </ThreadPrimitive.If>

      {canCancel ? (
        <ThreadPrimitive.If running={true}>
          <ComposerPrimitive.Cancel asChild>
            <button className="ai-chat-composer-stop" type="button" aria-label="Остановить генерацию">
              <Square size={14} fill="currentColor" />
            </button>
          </ComposerPrimitive.Cancel>
        </ThreadPrimitive.If>
      ) : null}

      {isTaskThread && isScheduleModalOpen ? (
        <div className="ai-chat-schedule-modal" role="dialog" aria-modal="true" aria-label="Параметры отправки">
          <button
            className="ai-chat-schedule-modal__backdrop"
            type="button"
            aria-label="Закрыть модальное окно"
            onClick={() => setIsScheduleModalOpen(false)}
          />
          <div className="ai-chat-schedule-modal__card">
            <div className="ai-chat-schedule-modal__header">
              <div className="ai-chat-schedule-modal__title">Параметры отправки</div>
              <div className="ai-chat-schedule-modal__subtitle">Настройте время и повтор для запланированной задачи.</div>
            </div>

            <label className="ai-chat-schedule-modal__field">
              <span>Дата старта</span>
              <input type="date" value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} />
            </label>

            <label className="ai-chat-schedule-modal__field">
              <span>Время отправки</span>
              <input type="time" value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} />
            </label>

            <label className="ai-chat-schedule-modal__field">
              <span>Повтор</span>
              <select value={repeat} onChange={(event) => setRepeat(event.target.value)}>
                <option>Без повтора</option>
                <option>Каждый день</option>
                <option>Каждую неделю</option>
                <option>Каждый месяц</option>
              </select>
            </label>

            <div className="ai-chat-schedule-modal__summary">
              Отправка: {scheduleDate} в {scheduleTime}
              {repeat === 'Без повтора' ? '' : `, ${repeat.toLowerCase()}`}
            </div>

            <div className="ai-chat-schedule-modal__actions">
              <button className="ai-chat-schedule-modal__button is-secondary" type="button" onClick={() => setIsScheduleModalOpen(false)}>
                Отмена
              </button>
              <button className="ai-chat-schedule-modal__button is-primary" type="button" onClick={handleScheduleConfirm}>
                Запланировать
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function AiChatComposer() {
  const { threadKind } = useContext(AiChatComposerContext);
  const isTaskThread = threadKind === 'task';

  return (
    <ComposerPrimitive.Root className={`ai-chat-composer-root${isTaskThread ? ' ai-chat-composer-root--task' : ''}`}>
      <ComposerAttachments />
      <div className="ai-chat-composer-shell">
        <div className="ai-chat-composer-body">
          <ComposerPrimitive.Input
            className="ai-chat-composer-input"
            rows={1}
            placeholder={isTaskThread ? 'Напишите сообщение' : 'Спросите Datacraft AI'}
          />

          <div className="ai-chat-composer-bottom">
            {!isTaskThread ? (
              <div className="ai-chat-composer-tools">
                <ComposerMenu />
              </div>
            ) : (
              <div />
            )}

            <div className="ai-chat-composer-tools">
              <ComposerAction />
            </div>
          </div>
        </div>
      </div>
    </ComposerPrimitive.Root>
  );
}
