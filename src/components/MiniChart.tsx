"use client";

interface MiniChartProps {
  data: number[];
  max?: number;
  color?: string;
  height?: number;
}

export function MiniChart({ data, max, color = "oklch(0.72 0.19 165)", height = 60 }: MiniChartProps) {
  const maxVal = max ?? Math.max(...data, 1);
  const barWidth = 100 / Math.max(data.length, 1);

  return (
    <svg width="100%" height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`bar-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {data.map((value, i) => {
        const barHeight = maxVal > 0 ? (value / maxVal) * height : 0;
        return (
          <rect
            key={i}
            x={`${i * barWidth + barWidth * 0.15}%`}
            y={height - barHeight}
            width={`${barWidth * 0.7}%`}
            height={barHeight}
            rx={3}
            fill={`url(#bar-${color.replace(/[^a-z0-9]/gi, "")})`}
            className="transition-all duration-500"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        );
      })}
    </svg>
  );
}
