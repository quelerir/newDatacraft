import { unstable_useComposerInput } from '@assistant-ui/react';

const followUps = [
  'Сформулируй 3 ключевых вывода',
  'Сравни это с прошлым периодом',
  'Предложи следующий шаг анализа',
];

export function AssistantFollowUps() {
  const composer = unstable_useComposerInput();

  const handleClick = (value: string) => {
    composer.setText(value);
    composer.send();
  };

  return (
    <div className="assistant-followups">
      <div className="assistant-followups__title">Что посмотреть дальше</div>
      <div className="assistant-followups__list">
        {followUps.map((item) => (
          <button
            key={item}
            className="assistant-followups__chip"
            type="button"
            onClick={() => handleClick(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
