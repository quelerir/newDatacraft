import { ChevronDown, FolderOpen, Lock, PanelRight, Pin, Plus, Search } from 'lucide-react';
import { aiChatSpaces } from './aiChatMockData';

const activeSpace = aiChatSpaces.find((space) => space.isActive) ?? aiChatSpaces[0];

export function AiChatSpacesView() {
  return (
    <div className="ai-chat-spaces-view">
      <div className="ai-chat-spaces-view__header">
        <div className="ai-chat-spaces-view__title">Пространства</div>
        <div className="ai-chat-spaces-view__actions">
          <button className="ai-chat-spaces-view__icon-button" type="button" aria-label="Поиск">
            <Search size={18} />
          </button>
          <button className="ai-chat-spaces-view__primary-button" type="button">
            <Plus size={18} />
            Новое пространство
          </button>
        </div>
      </div>

      <div className="ai-chat-spaces-view__body">
        <div className="ai-chat-spaces-view__main">
          <button className="ai-chat-spaces-view__group" type="button">
            <span>Закреплено</span>
            <ChevronDown size={16} />
          </button>

          <div className="ai-chat-spaces-view__rows">
            <button className="ai-chat-spaces-view__row is-active" type="button">
              <div className="ai-chat-spaces-view__row-left">
                <span className="ai-chat-spaces-view__folder">
                  <FolderOpen size={18} />
                </span>
                <span className="ai-chat-spaces-view__row-name">{activeSpace.name}</span>
              </div>

              <div className="ai-chat-spaces-view__row-right">
                <span className="ai-chat-spaces-view__avatar">A</span>
                <span className="ai-chat-spaces-view__row-chip">
                  <Lock size={13} />
                  {activeSpace.visibility}
                </span>
                <span className="ai-chat-spaces-view__row-age">{activeSpace.age}</span>
                <Pin size={13} />
              </div>
            </button>
          </div>

          <div className="ai-chat-spaces-view__canvas">
            <div className="ai-chat-spaces-view__empty">Нет сеансов</div>
          </div>
        </div>
      </div>
    </div>
  );
}
