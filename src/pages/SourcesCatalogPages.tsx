import { CatalogPageLayout } from '../components/CatalogPageLayout';
import { settingsTabs, sourceCreateConfigs, sourceRows, sourceTabs, sourceTags, workspaceTabs } from '../data/sourcesCatalogData';

export function SourcesPage() {
  const config = sourceCreateConfigs.sources;

  return (
    <CatalogPageLayout activeTabPath="/sources" tabs={sourceTabs} tags={sourceTags} createLabel={config.label} createIcon={config.icon} rows={sourceRows.sources} />
  );
}

export function ShowcasesPage() {
  const config = sourceCreateConfigs.showcases;

  return (
    <CatalogPageLayout activeTabPath="/showcases" tabs={workspaceTabs} tags={sourceTags} createLabel={config.label} createIcon={config.icon} rows={sourceRows.showcases} />
  );
}

export function SourceShowcasesPage() {
  const config = sourceCreateConfigs.showcases;

  return (
    <CatalogPageLayout activeTabPath="/source-showcases" tabs={sourceTabs} tags={sourceTags} createLabel={config.label} createIcon={config.icon} rows={sourceRows.showcases} />
  );
}

export function StreamsPage() {
  const config = sourceCreateConfigs.streams;

  return (
    <CatalogPageLayout activeTabPath="/streams" tabs={sourceTabs} tags={sourceTags} createLabel={config.label} createIcon={config.icon} rows={sourceRows.streams} />
  );
}

export function ExtrasPage() {
  const config = sourceCreateConfigs.extras;

  return (
    <CatalogPageLayout activeTabPath="/extras" tabs={sourceTabs} tags={sourceTags} createLabel={config.label} createIcon={config.icon} rows={sourceRows.extras} expandableRows={false} />
  );
}

export function SettingsStreamsPage() {
  return (
    <CatalogPageLayout
      activeTabPath="/settings/modules"
      tabs={settingsTabs}
      tags={sourceTags}
      rows={sourceRows.settingsStreams}
      showCreateAction={false}
      interactiveExpandedCards
    />
  );
}

export function SettingsSourcesPage() {
  return (
    <CatalogPageLayout activeTabPath="/settings/options" tabs={settingsTabs} tags={sourceTags} rows={sourceRows.settingsSources} showCreateAction={false} />
  );
}

export function SettingsShowcasesPage() {
  return (
    <CatalogPageLayout activeTabPath="/settings/profiles" tabs={settingsTabs} tags={sourceTags} rows={sourceRows.settingsShowcases} showCreateAction={false} />
  );
}
