import { ReactNode } from 'react'

interface NesTextboxProps {
  children: ReactNode
}

export function NesTextbox({ children }: NesTextboxProps) {
  return (
    <div className="relative border-2 border-white-bone bg-gray-deep p-4">
      {/* Top-left pointer */}
      <div className="absolute -top-2 left-4 h-0 w-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-white-bone" />
      <p className="t-body-m text-white-bone leading-relaxed">{children}</p>
    </div>
  )
}
