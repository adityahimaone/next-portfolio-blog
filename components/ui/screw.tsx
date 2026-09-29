import { cn } from '@/lib/utils'

export const Screw = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'flex h-3 w-3 items-center justify-center rounded-full border border-zinc-500 bg-zinc-400 shadow-inner',
      className,
    )}
  >
    <div className="h-0.5 w-full rotate-45 bg-zinc-600" />
    <div className="absolute h-0.5 w-full -rotate-45 bg-zinc-600" />
  </div>
)
