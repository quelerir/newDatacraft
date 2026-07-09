import { unstable_useComposerInput } from '@assistant-ui/react';

const suggestions = [
  'Проанализируй текущий дашборд',
  'Почему упала выручка?',
  'Покажи 3 главных инсайта',
  'Сравни каналы по эффективности',
  'Найди аномалии в воронке',
  'Построй SQL-запрос',
];

export function ChatSuggestions() {
  const composer = unstable_useComposerInput();

  const handleSuggestionClick = (value: string) => {
    composer.setText(value);
    composer.send();
  };

  return (
    <div className="assistant-suggestions">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          className="assistant-suggestion-card"
          type="button"
          onClick={() => handleSuggestionClick(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
