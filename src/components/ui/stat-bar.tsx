interface StatBarProps {
  label: string
  value: number // 0-100
}

export function StatBar({ label, value }: StatBarProps) {
  const filled = Math.round(value / 10)
  const empty = 10 - filled

  return (
    <div className="flex items-center gap-3">
      <span className="t-hud-xs w-24 text-white-dim">{label}</span>
      <div className="flex-1 font-mono text-sm tracking-tight">
        <span className="text-red">{'█'.repeat(filled)}</span>
        <span className="text-gray-light">{'░'.repeat(empty)}</span>
      </div>
      <span className="t-hud-xs w-8 text-right text-white-dim">{value}</span>
    </div>
  )
}
