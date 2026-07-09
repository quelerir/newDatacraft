import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useState, type MouseEvent as ReactMouseEvent } from 'react';

export type ChartCardSize = {
  width: number;
  height: number;
};

type ChartCardProps = {
  chartKey: string;
  title: string;
  subtitle: string;
  option: EChartsOption;
  size: ChartCardSize;
  onResize: (chartKey: string, nextSize: ChartCardSize) => void;
};

export function ChartCard({ chartKey, title, subtitle, option, size, onResize }: ChartCardProps) {
  const [isResizing, setIsResizing] = useState(false);
  const chartHeight = Math.max(220, size.height - 72);

  const handleResizeStart = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const startSize = size;

    setIsResizing(true);
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const nextWidth = Math.min(920, Math.max(320, startSize.width + deltaX));
      const nextHeight = Math.min(760, Math.max(260, startSize.height + deltaY));

      onResize(chartKey, { width: nextWidth, height: nextHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <section
      className={`chart-card${isResizing ? ' is-resizing' : ''}`}
      style={{
        width: size.width,
        height: size.height,
      }}
    >
      <div className="chart-card__header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="chart-card__meta">
          <span className="chart-card__size-label">{`${Math.round(size.width)}×${Math.round(size.height)}`}</span>
          <span className="chart-card__status">LIVE</span>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: '100%', minHeight: chartHeight }} opts={{ renderer: 'svg' }} />
      <button
        className="chart-card__resize-handle"
        type="button"
        aria-label="Изменить размер графика"
        onMouseDown={handleResizeStart}
      />
    </section>
  );
}
