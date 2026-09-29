import { cn } from '@/lib/utils'

interface TagChipProps {
  tag: string
  /** Occurrences across the archive; renders as `nextjs (4)`. */
  count?: number
  active?: boolean
  /** Omit onClick to render a static, non-interactive chip. */
  onClick?: () => void
  className?: string
}

const base =
  'inline-flex items-center gap-1 rounded-[var(--r-control)] px-2 py-1 font-[family-name:var(--font-geist-mono)] text-[0.6875rem] uppercase leading-none tracking-[0.12em] tabular-nums'

const idle = 'text-muted-foreground'
const interactive = 'glass-1 hover:text-foreground cursor-pointer'
const staticSurface = 'border border-border bg-muted'
// A lit solid pill reads as state more clearly than a translucent one.
const activeState = 'glass-1 border-primary bg-primary text-primary-foreground'

/**
 * The one tag chip for the archive pages. Tags were previously restyled
 * four different ways across the blog components (design.md §3.1).
 */
export function TagChip({
  tag,
  count,
  active,
  onClick,
  className,
}: TagChipProps) {
  const label = count === undefined ? tag : `${tag} (${count})`

  if (!onClick) {
    return (
      <span className={cn(base, idle, staticSurface, className)}>{label}</span>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        base,
        active ? activeState : `${interactive} ${idle}`,
        className,
      )}
    >
      {label}
    </button>
  )
}
