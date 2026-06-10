import type { ConfidenceLevel } from '../data/constants';

const CONF_STYLES: Record<ConfidenceLevel, { bg: string; text: string; border: string; label: string }> = {
  high: { bg: 'bg-[#EAF3DE]', text: 'text-[#27500A]', border: 'border-[#3B6D11]', label: 'גבוהה' },
  medium: { bg: 'bg-[#FAEEDA]', text: 'text-[#633806]', border: 'border-[#854F0B]', label: 'בינונית' },
  low: { bg: 'bg-[#FCEBEB]', text: 'text-[#791F1F]', border: 'border-[#A32D2D]', label: 'נמוכה' },
  research_required: { bg: 'bg-[#FFE0E0]', text: 'text-[#C00000]', border: 'border-[#C00000]', label: 'דורש מחקר' },
};

interface Props {
  level: ConfidenceLevel;
  size?: 'sm' | 'md';
}

export function ConfidenceBadge({ level, size = 'sm' }: Props) {
  const style = CONF_STYLES[level];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-block rounded-md font-medium ${sizeClass} ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

export function ConfidenceBox({ level, children }: { level: ConfidenceLevel; children: React.ReactNode }) {
  const style = CONF_STYLES[level];
  return (
    <div className={`rounded-lg p-4 border-r-4 ${style.bg} ${style.border}`}>
      {children}
    </div>
  );
}
