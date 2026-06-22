'use client'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="h-10 w-full border-t border-[#272727] bg-[#090909] px-6 md:px-10 flex items-center justify-between">
      <span className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#6b6b6b]">
        + Fly Direct — Aditya Himawan
      </span>
      <span className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#6b6b6b] flex items-center gap-1.5">
        3.1390° S, 119.4143° E
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="sr-only">Made with love</span>
      </span>
    </footer>
  )
}
