import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useAuiState } from '@assistant-ui/store';
import { Thread } from '@assistant-ui/react-ui';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AiChatComposer, AiChatComposerContext } from './AiChatComposer';
import { AiChatNotificationsWelcome } from './AiChatNotificationsWelcome';
import { AiChatSidebar, buildScheduledTasks, type ScheduledTaskItem } from './AiChatSidebar';
import { AiChatTaskUserMessage } from './AiChatTaskUserMessage';
import { aiChatMockAgents, aiChatMockFolders, aiChatMockWorkspaces, type MockAgent } from './aiChatMockAgents';
import { AiChatWelcome } from './AiChatWelcome';
import { useMockAiChatRuntime } from './useMockAiChatRuntime';

function mergeMockAgentsWithCurrent(currentAgents: MockAgent[], seedAgents: MockAgent[]) {
  return seedAgents.map((seedAgent) => {
    const currentAgent = currentAgents.find((agent) => agent.id === seedAgent.id);

    if (!currentAgent) {
      return seedAgent;
    }

    const customTopics = currentAgent.topics.filter((topic) => !seedAgent.topics.some((seedTopic) => seedTopic.id === topic.id));
    const mergedSeedTopics = seedAgent.topics.map((seedTopic) => {
      const currentTopic = currentAgent.topics.find((topic) => topic.id === seedTopic.id);

      if (!currentTopic) {
        return seedTopic;
      }

      return {
        ...seedTopic,
        tags: currentTopic.tags?.length ? currentTopic.tags : seedTopic.tags,
        workspaceTagId: currentTopic.workspaceTagId ?? seedTopic.workspaceTagId,
      };
    });

    return {
      ...seedAgent,
      topics: [...customTopics, ...mergedSeedTopics],
    };
  });
}

function mergeScheduledTasks(defaultTasks: ScheduledTaskItem[], customTasks: ScheduledTaskItem[]) {
  const defaultTaskIds = new Set(defaultTasks.map((task) => task.id));
  const uniqueCustomTasks = customTasks.filter((task, index) => customTasks.findIndex((candidate) => candidate.id === task.id) === index);

  return [...uniqueCustomTasks, ...defaultTasks.filter((task) => !defaultTaskIds.has(task.id) || !uniqueCustomTasks.some((customTask) => customTask.id === task.id))];
}

function extractMessageText(message: {
  content?: ReadonlyArray<{ type?: string; text?: string }>;
}) {
  return (
    message.content
      ?.filter((part) => part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text?.trim() ?? '')
      .filter(Boolean)
      .join(' ') ?? ''
  );
}

function buildHighlightedMatchParts(text: string, query: string) {
  if (!query) {
    return [{ text, isMatch: false }];
  }

  const normalizedText = text.toLowerCase();
  const startIndex = normalizedText.indexOf(query.toLowerCase());

  if (startIndex === -1) {
    return [{ text, isMatch: false }];
  }

  const previewStart = Math.max(0, startIndex - 36);
  const previewEnd = Math.min(text.length, startIndex + query.length + 52);
  const previewText = text.slice(previewStart, previewEnd).trim();
  const normalizedPreview = previewText.toLowerCase();
  const previewMatchStart = normalizedPreview.indexOf(query.toLowerCase());

  if (previewMatchStart === -1) {
    return [{ text: previewText, isMatch: false }];
  }

  const before = previewText.slice(0, previewMatchStart);
  const match = previewText.slice(previewMatchStart, previewMatchStart + query.length);
  const after = previewText.slice(previewMatchStart + query.length);

  return [
    { text: previewStart > 0 ? `...${before}` : before, isMatch: false },
    { text: match, isMatch: true },
    { text: previewEnd < text.length ? `${after}...` : after, isMatch: false },
  ].filter((part) => part.text);
}

function scrollToThreadMessage(messageIndex: number) {
  const messageNodes = Array.from(
    document.querySelectorAll<HTMLElement>('.ai-chat-thread .aui-user-message-root, .ai-chat-thread .aui-assistant-message-root'),
  );
  const targetNode = messageNodes[messageIndex];

  if (!targetNode) {
    return null;
  }

  messageNodes.forEach((node) => {
    node.classList.remove('is-search-hit');
    node.classList.remove('is-search-hit-persistent');
  });

  targetNode.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
  window.requestAnimationFrame(() => {
    targetNode.classList.add('is-search-hit-persistent');
  });

  return targetNode;
}

function getThreadJumpPosition(messageIndex: number) {
  const messageNodes = Array.from(
    document.querySelectorAll<HTMLElement>('.ai-chat-thread .aui-user-message-root, .ai-chat-thread .aui-assistant-message-root'),
  );
  const targetNode = messageNodes[messageIndex];
  const shellNode = document.querySelector<HTMLElement>('.ai-chat-thread-shell');

  if (!targetNode || !shellNode) {
    return null;
  }

  const targetRect = targetNode.getBoundingClientRect();
  const shellRect = shellNode.getBoundingClientRect();

  return {
    top: targetRect.bottom - shellRect.top + 10,
    left: targetRect.left - shellRect.left + targetRect.width / 2,
  };
}

function AiChatThreadHeader({
  topicTitle,
}: {
  topicTitle: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSearchMatchIndex, setActiveSearchMatchIndex] = useState(0);
  const threadMessages = useAuiState((state) => state.thread.messages);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchMatches = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return threadMessages
      .map((message, index) => {
        const text = extractMessageText(message);
        const roleLabel = message.role === 'user' ? 'Вы' : 'Ассистент';
        return {
          id: `${message.id ?? message.parentId ?? message.role}-${index}`,
          messageIndex: index,
          roleLabel,
          text,
        };
      })
      .filter((message) => message.text.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery, threadMessages]);

  useEffect(() => {
    setActiveSearchMatchIndex(0);
  }, [normalizedQuery]);

  const handleSearchMatchStep = (direction: 'prev' | 'next') => {
    if (!searchMatches.length) {
      return;
    }

    const nextIndex =
      direction === 'next'
        ? (activeSearchMatchIndex + 1) % searchMatches.length
        : (activeSearchMatchIndex - 1 + searchMatches.length) % searchMatches.length;

    setActiveSearchMatchIndex(nextIndex);
    scrollToThreadMessage(searchMatches[nextIndex]!.messageIndex);
  };

  return (
    <div className="ai-chat-thread-header">
      <div className="ai-chat-thread-header__copy">
        <div className="ai-chat-thread-header__title">{topicTitle}</div>
      </div>
      <div className="ai-chat-thread-header__search">
        <button
          className={`ai-chat-thread-header__search-toggle${isSearchOpen ? ' is-open' : ''}`}
          type="button"
          aria-label="Поиск по чату"
          onClick={() => {
            setIsSearchOpen((current) => !current);
            if (isSearchOpen) {
              setSearchQuery('');
            }
          }}
        >
          <Search size={16} strokeWidth={2.2} />
        </button>

        {isSearchOpen ? (
          <div className="ai-chat-thread-header__search-panel">
            <div className="ai-chat-thread-header__search-input-wrap">
              <Search size={14} strokeWidth={2.2} />
              <input
                className="ai-chat-thread-header__search-input"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Поиск по чату"
                aria-label="Поиск по чату"
                autoFocus
              />
              {searchQuery ? (
                <button
                  className="ai-chat-thread-header__search-clear"
                  type="button"
                  aria-label="Очистить поиск"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} strokeWidth={2.2} />
                </button>
              ) : null}
            </div>

            <div className="ai-chat-thread-header__search-results">
              <div className="ai-chat-thread-header__search-summary">
                <div className="ai-chat-thread-header__search-meta">
                  {!normalizedQuery
                    ? 'Введите запрос'
                    : searchMatches.length
                      ? `${activeSearchMatchIndex + 1} из ${searchMatches.length}`
                      : 'Совпадений нет'}
                </div>
                <div className="ai-chat-thread-header__search-nav">
                  <button
                    className="ai-chat-thread-header__search-nav-button"
                    type="button"
                    aria-label="Предыдущее совпадение"
                    onClick={() => handleSearchMatchStep('prev')}
                    disabled={!searchMatches.length}
                  >
                    <ChevronUp size={14} strokeWidth={2.2} />
                  </button>
                  <button
                    className="ai-chat-thread-header__search-nav-button"
                    type="button"
                    aria-label="Следующее совпадение"
                    onClick={() => handleSearchMatchStep('next')}
                    disabled={!searchMatches.length}
                  >
                    <ChevronDown size={14} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
              {searchMatches.length ? (
                <button
                  className="ai-chat-thread-header__search-result"
                  type="button"
                  onClick={() => scrollToThreadMessage(searchMatches[activeSearchMatchIndex]!.messageIndex)}
                >
                  <div className="ai-chat-thread-header__search-result-role">
                    {searchMatches[activeSearchMatchIndex]!.roleLabel}
                  </div>
                  <div className="ai-chat-thread-header__search-result-text">
                    {buildHighlightedMatchParts(searchMatches[activeSearchMatchIndex]!.text, searchQuery).map((part, index) =>
                      part.isMatch ? (
                        <mark key={`${part.text}-${index}`} className="ai-chat-thread-header__search-result-mark">
                          {part.text}
                        </mark>
                      ) : (
                        <span key={`${part.text}-${index}`}>{part.text}</span>
                      ),
                    )}
                  </div>
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AiChatThreadSearchJump({
  externalSearchRequest,
}: {
  externalSearchRequest?: { query: string; nonce: number } | null;
}) {
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [jumpPosition, setJumpPosition] = useState<{ top: number; left: number } | null>(null);
  const threadMessages = useAuiState((state) => state.thread.messages);
  const normalizedQuery = externalSearchRequest?.query.trim().toLowerCase() ?? '';
  const messageMatches = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return threadMessages
      .map((message, index) => ({
        messageIndex: index,
        text: extractMessageText(message),
      }))
      .filter((message) => message.text.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery, threadMessages]);

  useEffect(() => {
    setActiveMatchIndex(0);
  }, [externalSearchRequest]);

  useEffect(() => {
    if (!messageMatches.length) {
      setJumpPosition(null);
      return;
    }

    const updateJumpPosition = () => {
      const nextPosition = getThreadJumpPosition(messageMatches[activeMatchIndex]?.messageIndex ?? -1);

      if (nextPosition) {
        setJumpPosition(nextPosition);
      }
    };

    window.requestAnimationFrame(updateJumpPosition);
    window.addEventListener('resize', updateJumpPosition);
    return () => {
      window.removeEventListener('resize', updateJumpPosition);
    };
  }, [activeMatchIndex, messageMatches]);

  useEffect(() => {
    if (!normalizedQuery || !messageMatches.length) {
      return;
    }

    const initialMatchIndex = 0;
    setActiveMatchIndex(initialMatchIndex);

    window.setTimeout(() => {
      scrollToThreadMessage(messageMatches[initialMatchIndex]!.messageIndex);
    }, 40);
  }, [externalSearchRequest?.nonce, normalizedQuery, threadMessages.length]);

  useEffect(() => {
    if (!messageMatches.length) {
      return;
    }

    const activeMatch = messageMatches[activeMatchIndex];

    if (!activeMatch) {
      return;
    }

    window.setTimeout(() => {
      scrollToThreadMessage(activeMatch.messageIndex);
      const nextPosition = getThreadJumpPosition(activeMatch.messageIndex);

      if (nextPosition) {
        setJumpPosition(nextPosition);
      }
    }, 40);
  }, [activeMatchIndex]);

  if (!normalizedQuery || !messageMatches.length) {
    return null;
  }

  const handleStep = (direction: 'prev' | 'next') => {
    const nextIndex =
      direction === 'next'
        ? (activeMatchIndex + 1) % messageMatches.length
        : (activeMatchIndex - 1 + messageMatches.length) % messageMatches.length;

    setActiveMatchIndex(nextIndex);
  };

  return (
    <div
      className="ai-chat-thread-jump"
      aria-label="Навигация по найденным сообщениям"
      style={
        jumpPosition
          ? {
              top: `${jumpPosition.top}px`,
              left: `${jumpPosition.left}px`,
            }
          : undefined
      }
    >
      <button
        className="ai-chat-thread-jump__button"
        type="button"
        aria-label="Предыдущее найденное сообщение"
        onClick={() => handleStep('prev')}
      >
        <ChevronUp size={14} strokeWidth={2.2} />
      </button>
      <div className="ai-chat-thread-jump__meta">
        {activeMatchIndex + 1}/{messageMatches.length}
      </div>
      <button
        className="ai-chat-thread-jump__button"
        type="button"
        aria-label="Следующее найденное сообщение"
        onClick={() => handleStep('next')}
      >
        <ChevronDown size={14} strokeWidth={2.2} />
      </button>
    </div>
  );
}

function AiChatThread({
  agentId,
  agentName,
  topicTitle,
  topicPrompt,
  topicMessages,
  threadKind,
  assignableWorkspaces,
  onAssignWorkspace,
  externalSearchRequest,
}: {
  agentId: string;
  agentName: string;
  topicTitle: string;
  topicPrompt: string;
  topicMessages: MockAgent['topics'][number]['messages'];
  threadKind: 'task' | 'topic';
  assignableWorkspaces: Array<{ id: string; name: string }>;
  onAssignWorkspace: (workspaceId: string) => void;
  externalSearchRequest?: { query: string; nonce: number } | null;
}) {
  const runtime = useMockAiChatRuntime({
    agentName,
    topicTitle,
    topicPrompt,
    topicMessages,
    threadKind,
  });

  return (
    <AssistantRuntimeProvider key={`${agentName}-${topicTitle}`} runtime={runtime}>
      <AiChatComposerContext.Provider value={{ threadKind, assignableWorkspaces, onAssignWorkspace }}>
        <div className={`ai-chat-thread${threadKind === 'task' ? ' ai-chat-thread--task' : ''}`}>
          <div className="ai-chat-thread-shell">
            <AiChatThreadHeader topicTitle={topicTitle} />
            <AiChatThreadSearchJump externalSearchRequest={externalSearchRequest} />
            <Thread
              key={`${agentName}-${topicTitle}`}
              composer={{
                allowAttachments: true,
              }}
              components={{
                Composer: AiChatComposer,
                UserMessage: threadKind === 'task' ? AiChatTaskUserMessage : undefined,
                ThreadWelcome: () =>
                  threadKind === 'task' ? null : agentId === 'notifications-agent' ? (
                    <AiChatNotificationsWelcome />
                  ) : (
                    <AiChatWelcome agentName={agentName} topicTitle={topicTitle} topicPrompt={topicPrompt} threadKind={threadKind} />
                  ),
              }}
              strings={{
                composer: {
                  send: {
                    tooltip: 'Отправить сообщение',
                  },
                  addAttachment: {
                    tooltip: 'Добавить файл',
                  },
                },
                thread: {
                  scrollToBottom: {
                    tooltip: 'Прокрутить вниз',
                  },
                },
              }}
            />
          </div>
        </div>
      </AiChatComposerContext.Provider>
    </AssistantRuntimeProvider>
  );
}

export function AiChat() {
  const [agentsState, setAgentsState] = useState<MockAgent[]>(aiChatMockAgents);
  const [customTasksByAgent, setCustomTasksByAgent] = useState<Record<string, ScheduledTaskItem[]>>({});
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('external');
  const [selectedCardKind, setSelectedCardKind] = useState<'task' | 'topic'>('topic');
  const [chatSearch, setChatSearch] = useState('');
  const [threadSearchRequest, setThreadSearchRequest] = useState<{ query: string; nonce: number } | null>(null);
  const isAllAgentsWorkspace = selectedWorkspaceId === 'external';
  const workspacesWithCounts = useMemo(
    () =>
      aiChatMockWorkspaces.map((workspace) => ({
        ...workspace,
        unreadCount:
          workspace.id === 'external'
            ? agentsState.length
            : agentsState.filter((agent) => agent.topics.some((topic) => topic.workspaceTagId === workspace.id)).length,
      })),
    [agentsState],
  );
  const availableFolders = useMemo(
    () => (isAllAgentsWorkspace ? aiChatMockFolders : aiChatMockFolders.filter((folder) => folder.workspaceId === selectedWorkspaceId)),
    [isAllAgentsWorkspace, selectedWorkspaceId],
  );
  const availableAgents = useMemo(
    () =>
      isAllAgentsWorkspace
        ? agentsState
        : agentsState.filter((agent) => agent.topics.some((topic) => topic.workspaceTagId === selectedWorkspaceId)),
    [agentsState, isAllAgentsWorkspace, selectedWorkspaceId],
  );
  const [selectedAgentId, setSelectedAgentId] = useState(availableAgents[0]?.id ?? '');
  const selectedAgent = useMemo(
    () => availableAgents.find((agent) => agent.id === selectedAgentId) ?? availableAgents[0] ?? agentsState[0],
    [availableAgents, selectedAgentId],
  );
  const [selectedTopicId, setSelectedTopicId] = useState(selectedAgent?.topics[0]?.id ?? '');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  useEffect(() => {
    setAgentsState((currentAgents) => mergeMockAgentsWithCurrent(currentAgents, aiChatMockAgents));
  }, [aiChatMockAgents]);

  useEffect(() => {
    if (!availableAgents.length) {
      return;
    }

    if (!availableAgents.some((agent) => agent.id === selectedAgentId)) {
      setSelectedAgentId(availableAgents[0].id);
      setSelectedCardKind('topic');
      setSelectedTaskId('');
    }
  }, [availableAgents, selectedAgentId]);

  useEffect(() => {
    if (!selectedAgent) {
      return;
    }

    if (!selectedAgent.topics.some((topic) => topic.id === selectedTopicId)) {
      setSelectedTopicId(selectedAgent.topics[0]?.id ?? '');
      setSelectedCardKind('topic');
    }
  }, [selectedAgent, selectedTopicId]);

  const selectedTopic = useMemo(
    () => selectedAgent?.topics.find((topic) => topic.id === selectedTopicId) ?? selectedAgent?.topics[0],
    [selectedAgent, selectedTopicId],
  );
  const scheduledTasks = useMemo(() => {
    if (!selectedAgent) {
      return [];
    }

    const defaultTasks = buildScheduledTasks(selectedAgent);
    const customTasks = customTasksByAgent[selectedAgent.id] ?? [];

    return mergeScheduledTasks(defaultTasks, customTasks);
  }, [customTasksByAgent, selectedAgent]);
  const selectedTask = useMemo(
    () => scheduledTasks.find((task) => task.id === selectedTaskId) ?? scheduledTasks[0],
    [scheduledTasks, selectedTaskId],
  );
  const availableTopicTags = useMemo(() => {
    const baseTags = ['Growth', 'Data', 'Retention', 'Конверсия', 'Риски', 'Алерты', 'API', 'Отчёт', 'Эксперименты'];
    const dynamicTags = agentsState.flatMap((agent) => agent.topics.flatMap((topic) => topic.tags ?? []));

    return [...new Set([...baseTags, ...dynamicTags])];
  }, [agentsState]);
  const assignableWorkspaces = useMemo(
    () => aiChatMockWorkspaces.filter((workspace) => workspace.id !== 'external'),
    [],
  );

  const handleAgentSelect = (agentId: string) => {
    const nextAgent = availableAgents.find((agent) => agent.id === agentId);
    setSelectedAgentId(agentId);
    setSelectedTopicId(nextAgent?.topics[0]?.id ?? '');
    setSelectedTaskId('');
    setSelectedCardKind('topic');
    setThreadSearchRequest(null);
  };

  const handleTopicSelect = (topicId: string, searchQuery = '') => {
    setSelectedTopicId(topicId);
    setSelectedCardKind('topic');
    setThreadSearchRequest(searchQuery.trim() ? { query: searchQuery.trim(), nonce: Date.now() } : null);
  };

  const handleTopicTagsChange = (topicId: string, nextTags: string[]) => {
    setAgentsState((currentAgents) =>
      currentAgents.map((agent) => ({
        ...agent,
        topics: agent.topics.map((topic) => (topic.id === topicId ? { ...topic, tags: nextTags } : topic)),
      })),
    );
  };

  const handleTopicWorkspaceAssign = (topicId: string, workspaceId: string) => {
    setAgentsState((currentAgents) =>
      currentAgents.map((agent) => ({
        ...agent,
        topics: agent.topics.map((topic) => (topic.id === topicId ? { ...topic, workspaceTagId: workspaceId } : topic)),
      })),
    );
  };

  const handleTaskSelect = (taskId: string, searchQuery = '') => {
    setSelectedTaskId(taskId);
    setSelectedCardKind('task');
    setThreadSearchRequest(searchQuery.trim() ? { query: searchQuery.trim(), nonce: Date.now() } : null);
  };

  const handleCreateTopic = () => {
    if (!selectedAgent) {
      return;
    }

    const nextTopicId = `topic-${Date.now()}`;
    const nextTopic = {
      id: nextTopicId,
      title: 'Новый чат',
      preview: 'Новый диалог готов к обсуждению.',
      prompt: 'Помоги начать новый чат и сформулировать первый запрос по задаче.',
      lastDiscussed: 'Только что',
      tags: [],
      workspaceTagId: undefined,
      messages: [],
    };

    setAgentsState((currentAgents) =>
      currentAgents.map((agent) =>
        agent.id === selectedAgent.id
          ? {
              ...agent,
              topics: [nextTopic, ...agent.topics],
            }
          : agent,
      ),
    );
    setSelectedTopicId(nextTopicId);
    setSelectedCardKind('topic');
    setThreadSearchRequest(null);
  };

  const handleCreateTask = () => {
    if (!selectedAgent) {
      return;
    }

    const nextTaskId = `task-custom-${Date.now()}`;
    const nextTask: ScheduledTaskItem = {
      id: nextTaskId,
      title: 'Новая задача',
      preview: 'Новая задача создана и готова к обсуждению.',
      cadence: 'Только что',
      prompt: 'Помоги сформулировать задачу, уточнить цель и предложить первый план действий.',
      messages: [{ role: 'user', text: 'Помоги сформулировать задачу, уточнить цель и предложить первый план действий.' }],
    };

    setCustomTasksByAgent((currentTasksByAgent) => ({
      ...currentTasksByAgent,
      [selectedAgent.id]: [nextTask, ...(currentTasksByAgent[selectedAgent.id] ?? [])],
    }));
    setSelectedTaskId(nextTaskId);
    setSelectedCardKind('task');
    setThreadSearchRequest(null);
  };

  const handleWorkspaceSelect = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setSelectedAgentId('');
    setSelectedTopicId('');
    setSelectedTaskId('');
    setSelectedCardKind('topic');
    setThreadSearchRequest(null);
  };

  const activeThread =
    selectedCardKind === 'task' && selectedTask
      ? {
          id: selectedTask.id,
          title: selectedTask.title,
          prompt: selectedTask.prompt,
          messages: selectedTask.messages,
        }
      : selectedTopic
        ? {
            id: selectedTopic.id,
            title: selectedTopic.title,
            prompt: selectedTopic.prompt,
            messages: selectedTopic.messages,
          }
        : null;

  return (
    <div className="ai-chat-layout">
      <AiChatSidebar
        workspaces={workspacesWithCounts}
        folders={availableFolders}
        agents={availableAgents}
        scheduledTasks={scheduledTasks}
        availableTopicTags={availableTopicTags}
        selectedWorkspaceId={selectedWorkspaceId}
        selectedAgentId={selectedAgent?.id ?? ''}
        selectedTopicId={selectedTopic?.id ?? ''}
        selectedTaskId={selectedTask?.id ?? ''}
        selectedCardKind={selectedCardKind}
        chatSearch={chatSearch}
        onWorkspaceSelect={handleWorkspaceSelect}
        onChatSearchChange={setChatSearch}
        onAgentSelect={handleAgentSelect}
        onCreateTopic={handleCreateTopic}
        onCreateTask={handleCreateTask}
        onTopicSelect={handleTopicSelect}
        onTopicTagsChange={handleTopicTagsChange}
        onTaskSelect={handleTaskSelect}
      />

      {selectedAgent && activeThread ? (
        <AiChatThread
          agentId={selectedAgent.id}
          agentName={selectedAgent.name}
          topicTitle={activeThread.title}
          topicPrompt={activeThread.prompt}
          topicMessages={activeThread.messages}
          threadKind={selectedCardKind}
          assignableWorkspaces={assignableWorkspaces.map((workspace) => ({ id: workspace.id, name: workspace.name }))}
          externalSearchRequest={threadSearchRequest}
          onAssignWorkspace={(workspaceId) => {
            if (selectedCardKind === 'topic' && selectedTopic) {
              handleTopicWorkspaceAssign(selectedTopic.id, workspaceId);
            }
          }}
        />
      ) : (
        <div className="ai-chat-thread ai-chat-thread--empty">
          <div className="ai-chat-thread-shell">
            <div className="ai-chat-thread-header">
              <div className="ai-chat-thread-header__copy">
                <div className="ai-chat-thread-header__title">Выберите папку с агентами</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
