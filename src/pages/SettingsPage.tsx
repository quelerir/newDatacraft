import { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { purchasedModules, type PurchasedModuleKey } from '../data/settingsData';

export function SettingsPage() {
  const [activeModuleKey, setActiveModuleKey] = useState<PurchasedModuleKey>('stream');
  const [expandedSourceKeys, setExpandedSourceKeys] = useState<string[]>(['yandex-metrica']);
  const [selectedSettingsByModule, setSelectedSettingsByModule] = useState<Record<PurchasedModuleKey, string[]>>({
    stream: [],
    source: [],
    showcase: [],
    agent: [],
    assistant: [],
  });
  const activeModule = useMemo(
    () => purchasedModules.find((module) => module.key === activeModuleKey) ?? purchasedModules[0],
    [activeModuleKey],
  );
  const selectedSettings = selectedSettingsByModule[activeModule.key] ?? [];
  const totalOptionsCount =
    activeModule.key === 'source'
      ? (activeModule.sourceItems ?? []).reduce(
          (sum, source) => sum + source.settingsSections.reduce((sectionSum, section) => sectionSum + section.options.length, 0),
          0,
        )
      : activeModule.settingsSections.reduce((sum, section) => sum + section.options.length, 0);
  const selectionSummaryLabel = activeModule.key === 'source' ? 'Включено настроек источников' : 'Выбрано опций';

  const toggleSetting = (moduleKey: PurchasedModuleKey, setting: string) => {
    setSelectedSettingsByModule((current) => {
      const moduleSettings = current[moduleKey] ?? [];

      return {
        ...current,
        [moduleKey]: moduleSettings.includes(setting)
          ? moduleSettings.filter((item) => item !== setting)
          : [...moduleSettings, setting],
      };
    });
  };

  const toggleSourceAccordion = (sourceKey: string) => {
    setExpandedSourceKeys((current) =>
      current.includes(sourceKey) ? current.filter((item) => item !== sourceKey) : [...current, sourceKey],
    );
  };

  return (
    <div className="app-shell">
      <Header />

      <main className="settings-page">
        <section className="settings-license-hero">
          <div className="settings-license-hero__copy">
            <span className="settings-license-hero__eyebrow">Modules</span>
            <h1>Настройки модулей dataCraft</h1>
            <p>
              У каждого модуля есть собственные настройки, а для одного и того же типа модуля можно хранить
              несколько профилей, например профиль по умолчанию и тестовый профиль.
            </p>
          </div>
        </section>

        <section className="settings-license-layout">
          <div className="settings-license-grid">
            {purchasedModules.map((module) => {
              const isActive = module.key === activeModule.key;

              return (
                <button
                  key={module.key}
                  className={`settings-license-card settings-license-card--${module.accent}${isActive ? ' is-active' : ''}`}
                  type="button"
                  onClick={() => {
                    setActiveModuleKey(module.key);
                    if (module.key === 'source') {
                      setExpandedSourceKeys(module.sourceItems?.[0]?.key ? [module.sourceItems[0].key] : []);
                    }
                  }}
                >
                  <div className="settings-license-card__top">
                  </div>

                  <h3>{module.label}</h3>
                  <p>{module.shortDescription}</p>
                </button>
              );
            })}
          </div>

          <aside className="settings-license-details">
            <div className="settings-license-details__header">
              <div>
                <h2>{activeModule.label}</h2>
                <p>{activeModule.fullDescription}</p>
              </div>
            </div>

            <div className="settings-license-section">
              <div className="settings-license-section__title">
                Что входит в модуль
              </div>
              {activeModule.key !== 'source' ? (
                <div className="settings-license-chip-list">
                  {activeModule.includes.map((item) => (
                    <span key={item} className="settings-license-chip">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="settings-license-chip-list">
                  {activeModule.includes.map((item) => (
                    <span key={item} className="settings-license-chip">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="settings-license-section">
              <div className="settings-license-explainer">
                <div className="settings-license-settings-summary">
                  {selectionSummaryLabel}: <strong>{selectedSettings.length}</strong> из <strong>{totalOptionsCount}</strong>
                </div>
                <div className="settings-license-setting-sections">
                  {activeModule.key === 'source' && activeModule.sourceItems?.length
                    ? activeModule.sourceItems.map((source) => {
                        const isExpanded = expandedSourceKeys.includes(source.key);

                        return (
                          <section key={source.key} className={`settings-license-setting-section settings-license-setting-section--source${isExpanded ? ' is-expanded' : ''}`}>
                            <button
                              className="settings-license-source-accordion"
                              type="button"
                              onClick={() => toggleSourceAccordion(source.key)}
                            >
                              <div className="settings-license-source-accordion__copy">
                                <strong>{source.label}</strong>
                                <span>{source.description}</span>
                              </div>
                              <span className={`settings-license-source-accordion__chevron${isExpanded ? ' is-expanded' : ''}`} aria-hidden="true">
                                +
                              </span>
                            </button>

                            {isExpanded ? (
                              <div className="settings-license-source-accordion__body">
                                {source.settingsSections.map((section) => (
                                  <div key={`${source.key}-${section.title}`} className="settings-license-source-accordion__group">
                                    <div className="settings-license-setting-section__title">{section.title}</div>
                                    <div className="settings-license-setting-list">
                                      {section.options.map((option) => {
                                        const optionKey = `${source.key}:${option}`;
                                        const isSelected = selectedSettings.includes(optionKey);

                                        return (
                                          <button
                                            key={optionKey}
                                            className={`settings-license-setting-option${isSelected ? ' is-selected' : ''}`}
                                            type="button"
                                            onClick={() => toggleSetting(activeModule.key, optionKey)}
                                          >
                                            <div className="settings-license-setting-option__content">
                                              <span className="settings-license-setting-option__label">{section.title}</span>
                                              <strong>{option}</strong>
                                            </div>
                                            <span className={`settings-license-switch${isSelected ? ' is-on' : ''}`} aria-hidden="true">
                                              <span className="settings-license-switch__thumb" />
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </section>
                        );
                      })
                    : activeModule.settingsSections.map((section) => (
                        <section key={section.title} className="settings-license-setting-section">
                          <div className="settings-license-setting-section__title">{section.title}</div>
                          <div className="settings-license-setting-list">
                            {section.options.map((option) => (
                              <button
                                key={option}
                                className={`settings-license-setting-option${selectedSettings.includes(option) ? ' is-selected' : ''}`}
                                type="button"
                                onClick={() => toggleSetting(activeModule.key, option)}
                              >
                                <div className="settings-license-setting-option__content">
                                  <span className="settings-license-setting-option__label">{section.title}</span>
                                  <strong>{option}</strong>
                                </div>
                                <span className={`settings-license-switch${selectedSettings.includes(option) ? ' is-on' : ''}`} aria-hidden="true">
                                  <span className="settings-license-switch__thumb" />
                                </span>
                              </button>
                            ))}
                          </div>
                        </section>
                      ))}
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
