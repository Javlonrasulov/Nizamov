import React from 'react';

/* ─── Dark mode hook (no AppContext dependency) ─── */
function useIsDark() {
  const [isDark, setIsDark] = React.useState(() =>
    document.documentElement.classList.contains('dark')
  );
  React.useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

/* ─── Responsive container width hook ─── */
function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = React.useState(500);
  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) setWidth(Math.floor(w));
      }
    });
    ro.observe(ref.current);
    // initial measurement
    setWidth(Math.floor(ref.current.getBoundingClientRect().width) || 500);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

/* ─── Simple Line Chart ─── */
interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  formatY?: (v: number) => string;
  formatTooltip?: (v: number) => string;
}

export const SimpleLineChart: React.FC<LineChartProps> = ({
  data,
  color = '#2563EB',
  height = 200,
  formatY = (v) => String(v),
  formatTooltip = (v) => String(v),
}) => {
  const isDark = useIsDark();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const W = useContainerWidth(containerRef);
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; value: number; label: string } | null>(null);
  if (!data.length) return <div ref={containerRef} style={{ width: '100%' }} />;

  const padL = 80, padR = 16, padT = 16, padB = 36;
  const H = height;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const values = data.map(d => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const xStep = innerW / (data.length - 1 || 1);
  const toX = (i: number) => padL + i * xStep;
  const toY = (v: number) => padT + innerH - ((v - minV) / range) * innerH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ');

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => minV + (range / ticks) * i);

  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const tooltipBg = isDark ? '#374151' : '#1f2937';
  const tooltipText = '#f9fafb';
  const tooltipLabel = isDark ? '#d1d5db' : '#9ca3af';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', display: 'block' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', width: '100%', overflow: 'visible' }}>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line
              x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)}
              stroke={gridColor} strokeWidth={1} strokeDasharray="4 3"
            />
            <text x={padL - 6} y={toY(v) + 4} textAnchor="end" fontSize={9} fill={textColor}>
              {formatY(v)}
            </text>
          </g>
        ))}

        <polygon
          points={`${toX(0)},${padT + innerH} ${points} ${toX(data.length - 1)},${padT + innerH}`}
          fill={color}
          fillOpacity={isDark ? 0.15 : 0.08}
        />

        <polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={H - 8} textAnchor="middle" fontSize={10} fill={textColor}>
            {d.label}
          </text>
        ))}

        {data.map((d, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(d.value)} r={4} fill={color} />
            <rect
              x={toX(i) - xStep / 2} y={padT} width={xStep} height={innerH}
              fill="transparent"
              onMouseEnter={() => setTooltip({ x: toX(i), y: toY(d.value), value: d.value, label: d.label })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'crosshair' }}
            />
          </g>
        ))}

        {tooltip && (() => {
          const tw = 160, th = 44;
          const tx = Math.min(Math.max(tooltip.x - tw / 2, padL), W - padR - tw);
          const ty = Math.max(tooltip.y - th - 10, padT);
          return (
            <g>
              <rect x={tx} y={ty} width={tw} height={th} rx={8} fill={tooltipBg} opacity={0.95} />
              <text x={tx + tw / 2} y={ty + 15} textAnchor="middle" fontSize={10} fill={tooltipLabel}>{tooltip.label}</text>
              <text x={tx + tw / 2} y={ty + 33} textAnchor="middle" fontSize={11} fill={tooltipText} fontWeight="600">{formatTooltip(tooltip.value)}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
};

/* ─── Simple Horizontal Bar Chart ─── */
interface HBarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  formatX?: (v: number) => string;
  formatTooltip?: (v: number) => string;
}

export const SimpleHBarChart: React.FC<HBarChartProps> = ({
  data,
  color = '#2563EB',
  height,
  formatX = (v) => String(v),
  formatTooltip = (v) => String(v),
}) => {
  const isDark = useIsDark();
  const [hovered, setHovered] = React.useState<number | null>(null);
  if (!data.length) return null;

  const barH = 24;
  const gap = 12;
  const padL = 70, padR = 16, padT = 8, padB = 24;
  const W = 500;
  const H = height ?? padT + padB + data.length * (barH + gap);
  const innerW = W - padL - padR;

  const maxV = Math.max(...data.map(d => d.value)) || 1;
  const ticks = 4;
  const xTicks = Array.from({ length: ticks + 1 }, (_, i) => (maxV / ticks) * i);

  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const bgBarColor = isDark ? '#374151' : '#f3f4f6';
  const hoveredColor = '#1d4ed8';
  const hoverTextColor = isDark ? '#f9fafb' : '#111827';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      {xTicks.map((v, i) => {
        const x = padL + (v / maxV) * innerW;
        return (
          <g key={i}>
            <line x1={x} y1={padT} x2={x} y2={H - padB} stroke={gridColor} strokeWidth={1} strokeDasharray="4 3" />
            <text x={x} y={H - 6} textAnchor="middle" fontSize={10} fill={textColor}>{formatX(v)}</text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const y = padT + i * (barH + gap);
        const bw = (d.value / maxV) * innerW;
        return (
          <g key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect x={padL} y={y} width={innerW} height={barH} rx={6} fill={bgBarColor} />
            <rect x={padL} y={y} width={bw} height={barH} rx={6}
              fill={hovered === i ? hoveredColor : color} />
            <text x={padL - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize={11} fill={textColor}>
              {d.label}
            </text>
            {hovered === i && (
              <text x={padL + bw + 6} y={y + barH / 2 + 4} fontSize={11} fill={hoverTextColor} fontWeight="600">
                {formatTooltip(d.value)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/* ─── Simple Vertical Bar Chart ─── */
interface VBarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  formatY?: (v: number) => string;
  formatTooltip?: (v: number) => string;
}

export const SimpleVBarChart: React.FC<VBarChartProps> = ({
  data,
  color = '#2563EB',
  height = 220,
  formatY = (v) => String(v),
  formatTooltip = (v) => String(v),
}) => {
  const isDark = useIsDark();
  const [hovered, setHovered] = React.useState<number | null>(null);
  if (!data.length) return null;

  const padL = 16, padR = 16, padT = 16, padB = 36;
  const W = 500, H = height;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxV = Math.max(...data.map(d => d.value)) || 1;
  const barW = Math.max(8, innerW / data.length - 8);
  const xStep = innerW / data.length;

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (maxV / ticks) * i);

  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const hoveredColor = '#1d4ed8';
  const tooltipBg = isDark ? '#374151' : '#1f2937';
  const tooltipText = '#f9fafb';
  const tooltipLabelColor = isDark ? '#d1d5db' : '#9ca3af';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      {yTicks.map((v, i) => {
        const y = padT + innerH - (v / maxV) * innerH;
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={gridColor} strokeWidth={1} strokeDasharray="4 3" />
          </g>
        );
      })}

      {data.map((d, i) => {
        const bh = (d.value / maxV) * innerH;
        const x = padL + i * xStep + (xStep - barW) / 2;
        const y = padT + innerH - bh;
        return (
          <g key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect x={x} y={y} width={barW} height={bh} rx={4}
              fill={hovered === i ? hoveredColor : color} />
            <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={10} fill={textColor}>
              {d.label}
            </text>
            {hovered === i && (() => {
              const tw = 160, th = 44;
              const tx = Math.min(Math.max(x + barW / 2 - tw / 2, 0), W - tw);
              const ty = Math.max(y - th - 8, padT);
              return (
                <g>
                  <rect x={tx} y={ty} width={tw} height={th} rx={8} fill={tooltipBg} opacity={0.95} />
                  <text x={tx + tw / 2} y={ty + 15} textAnchor="middle" fontSize={10} fill={tooltipLabelColor}>{d.label}</text>
                  <text x={tx + tw / 2} y={ty + 33} textAnchor="middle" fontSize={11} fill={tooltipText} fontWeight="600">{formatTooltip(d.value)}</text>
                </g>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
};

/* ─── Grouped Bar Chart (2 series) ─── */
interface GroupedBarProps {
  data: { label: string; a: number; b: number }[];
  colorA?: string;
  colorB?: string;
  labelA?: string;
  labelB?: string;
  height?: number;
  formatY?: (v: number) => string;
  formatTooltip?: (v: number) => string;
}

export const SimpleGroupedBar: React.FC<GroupedBarProps> = ({
  data,
  colorA = '#2563EB',
  colorB = '#ef4444',
  labelA = 'A',
  labelB = 'B',
  height = 220,
  formatY = (v) => String(v),
  formatTooltip = (v) => String(v),
}) => {
  const isDark = useIsDark();
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; value: number; label: string; series: string } | null>(null);
  if (!data.length) return null;

  const padL = 16, padR = 16, padT = 16, padB = 36;
  const W = 500, H = height;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxV = Math.max(...data.flatMap(d => [d.a, d.b])) || 1;
  const groupW = innerW / data.length;
  const gap = 3;
  const barW = Math.max(6, groupW / 2 - gap - 2);

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (maxV / ticks) * i);
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const tooltipBg = isDark ? '#374151' : '#1f2937';
  const tooltipText = '#f9fafb';
  const tooltipLabelColor = isDark ? '#d1d5db' : '#9ca3af';

  return (
    <div style={{ position: 'relative' }}>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: colorA }} />
          <span className="text-xs text-gray-500 dark:text-gray-400">{labelA}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: colorB }} />
          <span className="text-xs text-gray-500 dark:text-gray-400">{labelB}</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        {yTicks.map((v, i) => {
          const y = padT + innerH - (v / maxV) * innerH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={gridColor} strokeWidth={1} strokeDasharray="4 3" />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill={textColor}>{formatY(v)}</text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const gx = padL + i * groupW;
          const cx = gx + groupW / 2;
          const bhA = (d.a / maxV) * innerH;
          const bhB = (d.b / maxV) * innerH;
          const xA = gx + (groupW / 2 - barW - gap / 2);
          const xB = gx + groupW / 2 + gap / 2;
          return (
            <g key={i}>
              <rect x={xA} y={padT + innerH - bhA} width={barW} height={bhA} rx={3} fill={colorA} opacity={0.9}
                onMouseEnter={() => setTooltip({ x: xA + barW / 2, y: padT + innerH - bhA, value: d.a, label: d.label, series: labelA })}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: 'pointer' }}
              />
              <rect x={xB} y={padT + innerH - bhB} width={barW} height={bhB} rx={3} fill={colorB} opacity={0.9}
                onMouseEnter={() => setTooltip({ x: xB + barW / 2, y: padT + innerH - bhB, value: d.b, label: d.label, series: labelB })}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: 'pointer' }}
              />
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={10} fill={textColor}>{d.label}</text>
            </g>
          );
        })}

        {tooltip && (() => {
          const tw = 170, th = 48;
          const tx = Math.min(Math.max(tooltip.x - tw / 2, padL), W - padR - tw);
          const ty = Math.max(tooltip.y - th - 10, padT);
          return (
            <g>
              <rect x={tx} y={ty} width={tw} height={th} rx={8} fill={tooltipBg} opacity={0.95} />
              <text x={tx + tw / 2} y={ty + 15} textAnchor="middle" fontSize={9} fill={tooltipLabelColor}>{tooltip.label} · {tooltip.series}</text>
              <text x={tx + tw / 2} y={ty + 35} textAnchor="middle" fontSize={12} fill={tooltipText} fontWeight="700">{formatTooltip(tooltip.value)}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
};