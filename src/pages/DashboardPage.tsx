import { BarChart3, Filter } from 'lucide-react';
import { useMemo, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { AssistantPanel } from '../components/Assistant/AssistantPanel';
import { ChartCard, type ChartCardSize } from '../components/ChartCard';
import { DashboardToolbar } from '../components/DashboardToolbar';
import { FiltersPanel } from '../components/FiltersPanel';
import { Header } from '../components/Header';
import { RightPanel } from '../components/RightPanel';
import { buildDashboardContext, chartDefinitions, rightPanelCharts } from '../data/dashboardData';

const DEFAULT_CHAT_WIDTH = 400;
const SAVED_CHAT_WIDTH = 560;

const isChartDefinition = (
  chart: (typeof chartDefinitions)[number] | undefined,
): chart is (typeof chartDefinitions)[number] => Boolean(chart);

const isDemoChartItem = (
  chart: (typeof rightPanelCharts)[number] | undefined,
): chart is (typeof rightPanelCharts)[number] => Boolean(chart);

export function DashboardPage() {
  const [skillsChartKeys, setSkillsChartKeys] = useState<string[]>([]);
  const [placedChartKeys, setPlacedChartKeys] = useState<string[]>([]);
  const [chartSizes, setChartSizes] = useState<Record<string, ChartCardSize>>({});
  const [isEditingDashboard, setIsEditingDashboard] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isChartDragActive, setIsChartDragActive] = useState(false);
  const [rightRailWidth, setRightRailWidth] = useState(DEFAULT_CHAT_WIDTH);
  const baseAssistantContext = useMemo(() => buildDashboardContext(), []);
  const dashboardSurfaceStyle = useMemo(
    () => ({ ['--right-rail-width' as '--right-rail-width']: `${rightRailWidth}px` }) as CSSProperties,
    [rightRailWidth],
  );

  const placedCharts = useMemo(
    () => placedChartKeys.map((key) => chartDefinitions.find((chart) => chart.key === key)).filter(isChartDefinition),
    [placedChartKeys],
  );
  const pinnedSkillsCharts = useMemo(
    () => skillsChartKeys.map((key) => rightPanelCharts.find((chart) => chart.key === key)).filter(isDemoChartItem),
    [skillsChartKeys],
  );
  const hasChartsOnDashboard = placedCharts.length > 0;
  const isChatOnlyMode = !hasChartsOnDashboard && !isEditingDashboard;
  const isSavedDashboardView = hasChartsOnDashboard && !isEditingDashboard;

  const availableCharts = useMemo(
    () => rightPanelCharts.filter((chart) => !placedChartKeys.includes(chart.key) && !skillsChartKeys.includes(chart.key)),
    [placedChartKeys, skillsChartKeys],
  );

  const assistantContext = useMemo(
    () => ({
      ...baseAssistantContext,
      charts: (placedChartKeys.length ? placedChartKeys : chartDefinitions.map((chart) => chart.key))
        .map((key) => chartDefinitions.find((chart) => chart.key === key))
        .filter(isChartDefinition)
        .map((chart) => ({
          key: chart.key,
          title: chart.title,
          type: chart.key,
        })),
    }),
    [baseAssistantContext, placedChartKeys],
  );

  const addChartToDashboard = (chartKey: string) => {
    if (skillsChartKeys.includes(chartKey)) return;
    setPlacedChartKeys((current) => (current.includes(chartKey) ? current : [...current, chartKey]));
    setChartSizes((current) => ({
      ...current,
      [chartKey]: current[chartKey] ?? { width: 420, height: 320 },
    }));
    setIsRightPanelOpen(false);
    setIsChartDragActive(false);
  };

  const addChartToSkills = (chartKey: string) => {
    setSkillsChartKeys((current) => (current.includes(chartKey) ? current : [...current, chartKey]));
    setPlacedChartKeys((current) => current.filter((key) => key !== chartKey));
    setIsRightPanelOpen(false);
    setIsChartDragActive(false);
  };

  const resizeChart = (chartKey: string, nextSize: ChartCardSize) => {
    setChartSizes((current) => {
      return {
        ...current,
        [chartKey]: nextSize,
      };
    });
  };

  const handleChatResizeStart = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = rightRailWidth;

    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const nextWidth = Math.min(760, Math.max(320, startWidth - deltaX));
      setRightRailWidth(nextWidth);
    };

    const handleMouseUp = () => {
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="app-shell">
      <Header />
      <DashboardToolbar
        isEditingDashboard={isEditingDashboard}
        onStartEditing={() => setIsEditingDashboard(true)}
        onCancelEditing={() => {
          setIsEditingDashboard(false);
          setIsRightPanelOpen(false);
        }}
        onSaveEditing={() => {
          setIsEditingDashboard(false);
          setIsRightPanelOpen(false);
          if (hasChartsOnDashboard) {
            setRightRailWidth((current) => Math.max(current, SAVED_CHAT_WIDTH));
          }
        }}
      />

      <main className="page-content">
        <section
          className={`dashboard-surface${isChatOnlyMode ? ' dashboard-surface--chat-only' : ''}${isSavedDashboardView ? ' dashboard-surface--saved' : ''}`}
          style={dashboardSurfaceStyle}
        >
          {hasChartsOnDashboard ? (
            <FiltersPanel
              isOpen={isFiltersOpen}
              onClose={() => setIsFiltersOpen(false)}
              onApply={() => setIsFiltersOpen(false)}
            />
          ) : null}

          {!isChatOnlyMode ? (
            <div className="dashboard-grid-area">
              <div className="dashboard-grid-area__toolbar">
                {hasChartsOnDashboard ? (
                  <button className="drawer-trigger" type="button" onClick={() => setIsFiltersOpen(true)}>
                    <Filter size={16} />
                    Фильтры
                  </button>
                ) : null}
                {isEditingDashboard ? (
                  <button
                    className="drawer-trigger drawer-trigger--right"
                    type="button"
                    onClick={() => setIsRightPanelOpen(true)}
                  >
                    <BarChart3 size={16} />
                    Графики
                  </button>
                ) : null}
              </div>
              <div
                className={`dashboard-dropzone${placedCharts.length ? ' has-charts' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const chartKey = event.dataTransfer.getData('text/chart-key');
                  if (chartKey) addChartToDashboard(chartKey);
                }}
              >
                {placedCharts.length ? (
                  <div className="dashboard-grid">
                    {placedCharts.map((chart) => (
                      <ChartCard
                        key={chart.key}
                        chartKey={chart.key}
                        title={chart.title}
                        subtitle={chart.subtitle}
                        option={chart.option}
                        size={chartSizes[chart.key] ?? { width: 420, height: 320 }}
                        onResize={resizeChart}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-empty-state">
                    <div className="dashboard-empty-state__icon">
                      <BarChart3 size={28} />
                    </div>
                    <h3>Дашборд пока пустой</h3>
                    <p>Перетащите график из списка справа или нажмите на него, чтобы добавить в рабочую область.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <RightPanel
            isOpen={isRightPanelOpen}
            onClose={() => setIsRightPanelOpen(false)}
            charts={availableCharts}
            onAddChart={addChartToDashboard}
            onChartDragStateChange={setIsChartDragActive}
          />

          <AssistantPanel
            context={assistantContext}
            onResizeStart={handleChatResizeStart}
            pinnedCharts={pinnedSkillsCharts}
            onPinnedChartDrop={addChartToSkills}
            showChartDropHint={isChartDragActive}
          />
        </section>
      </main>
    </div>
  );
}
