interface Props {
  progress: number; // 0-100
  size?: number;
  stroke?: number;
  label?: string;
}

export default function ProgressRing({ progress, size = 80, stroke = 6, label }: Props) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="text-center -mt-[calc(50%+10px)] mb-4">
        <span className="text-lg font-bold">{Math.round(progress)}%</span>
      </div>
      {label && <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>}
    </div>
  );
}
