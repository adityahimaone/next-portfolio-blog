'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { useSfx } from '@/hooks/use-sfx'

interface SfxButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  sfx?: 'click' | 'select' | 'hover' | 'transition' | 'error' | 'success' | 'start'
  sfxOnClick?: boolean
  sfxOnHover?: boolean
}

export const SfxButton = forwardRef<HTMLButtonElement, SfxButtonProps>(
  ({ sfx = 'click', sfxOnClick = true, sfxOnHover = true, className, children, onClick, onMouseEnter, ...props }, ref) => {
    const { playSfx } = useSfx()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (sfxOnClick) {
        playSfx(sfx)
      }
      onClick?.(e)
    }

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (sfxOnHover) {
        playSfx('hover')
      }
      onMouseEnter?.(e)
    }

    return (
      <button
        ref={ref}
        className={cn(
          'transition-all active:scale-95',
          className,
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {children}
      </button>
    )
  },
)

SfxButton.displayName = 'SfxButton'
