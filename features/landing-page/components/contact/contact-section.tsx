'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { Radio, Volume2, Send, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Screw } from '@/components/screw'

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [category, setCategory] = useState('project')
  const [priority, setPriority] = useState(50) // scale 0-100
  const [status, setStatus] = useState<'idle' | 'transmitting' | 'sent'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return
    
    setStatus('transmitting')
    setTimeout(() => {
      setStatus('sent')
      setFormData({ name: '', email: '', message: '' })
      setTimeout(() => setStatus('idle'), 3000)
    }, 1500)
  }

  const categories = ['project', 'consultation', 'feedback', 'other']

  return (
    <section id="contact" className="overflow-hidden py-24 bg-[#f5f5f3] dark:bg-[#121212]">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 flex items-center gap-2 rounded bg-[#e8e8e4] border border-[#d4d4d0] px-3 py-1 font-mono text-[9px] font-bold text-zinc-600 uppercase tracking-widest dark:bg-[#1a1a1a] dark:border-[#27272a] dark:text-zinc-400"
          >
            <Radio className="h-3 w-3" />
            <span>transmitter console</span>
          </m.div>
          <h2 className="font-sans text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            Establish Contact
          </h2>
          <p className="mt-4 max-w-xl font-mono text-xs text-zinc-500 lowercase tracking-tight">
            input query specifications below. select signal parameters and transmit.
          </p>
        </div>

        {/* Braun Console Chassis */}
        <div className="relative mx-auto max-w-4xl rounded-lg border border-[#d4d4d0] bg-[#f4f4f0] p-6 shadow-xl dark:border-[#27272a] dark:bg-[#121212]">
          <Screw className="absolute top-4 left-4" />
          <Screw className="absolute top-4 right-4" />
          <Screw className="absolute bottom-4 left-4" />
          <Screw className="absolute right-4 bottom-4" />

          {/* Top Panel Indicators */}
          <div className="mb-6 flex items-center justify-between border-b border-[#e4e4e0] pb-4 px-2 dark:border-[#202020]">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-2 w-2 rounded-full border transition-all duration-300',
                  status === 'transmitting'
                    ? 'bg-[#f59e0b] border-[#d97706] shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    : status === 'sent'
                      ? 'bg-[#10b981] border-[#047857] shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                      : 'bg-zinc-300 dark:bg-zinc-800'
                )}
              />
              <span className="font-mono text-[8px] font-bold text-zinc-500 uppercase">
                {status === 'transmitting' ? 'transmitting' : status === 'sent' ? 'signal transmitted' : 'system standby'}
              </span>
            </div>
            <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-zinc-800 uppercase dark:text-zinc-300">
              intercom / ah-transmit-02
            </span>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Column: Form Inputs */}
            <div className="md:col-span-7 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] font-bold text-zinc-500 uppercase">name / sender</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. dieter rams"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded border border-[#d4d4d0] bg-white px-4 py-2 text-xs font-mono text-zinc-800 focus:outline-none focus:border-[#f05523] dark:border-[#27272a] dark:bg-[#1a1a1a] dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] font-bold text-zinc-500 uppercase">email / channel</label>
                <input
                  type="email"
                  required
                  placeholder="sender@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded border border-[#d4d4d0] bg-white px-4 py-2 text-xs font-mono text-zinc-800 focus:outline-none focus:border-[#f05523] dark:border-[#27272a] dark:bg-[#1a1a1a] dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] font-bold text-zinc-500 uppercase">query / message content</label>
                <textarea
                  required
                  rows={5}
                  placeholder="write your message specifications here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="rounded border border-[#d4d4d0] bg-white px-4 py-2 text-xs font-mono text-zinc-800 focus:outline-none focus:border-[#f05523] dark:border-[#27272a] dark:bg-[#1a1a1a] dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Right Column: Mechanical Controls */}
            <div className="md:col-span-5 flex flex-col gap-6 border-l border-[#e4e4e0] pl-6 dark:border-[#202020]">
              
              {/* Category selector keys (Braun plungers) */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[9px] font-bold text-zinc-500 uppercase">select query category</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        'px-3 py-2 font-mono text-[8px] font-bold uppercase rounded border transition-all cursor-pointer select-none text-center',
                        category === cat
                          ? 'bg-[#eaeae6] border-zinc-500 text-[#f05523] shadow-inner dark:bg-[#202020] dark:border-zinc-400'
                          : 'bg-white border-[#d4d4d0] text-zinc-500 hover:bg-[#eaeae6] dark:bg-[#1a1a1a] dark:border-[#27272a]'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority slider pointer (Braun frequency scale design) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-[8px] text-zinc-500 uppercase">
                  <span>priority calibration</span>
                  <span className="text-[#f05523] font-bold">{priority}%</span>
                </div>
                <div className="relative h-6 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full h-1 appearance-none rounded bg-[#d8d8d0] dark:bg-[#2c2c2c] accent-[#f05523] cursor-pointer"
                  />
                </div>
              </div>

              {/* Plunger Transmit switch */}
              <button
                type="submit"
                disabled={status !== 'idle'}
                className={cn(
                  'w-full flex items-center justify-center gap-2 rounded border px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-wider transition-all select-none shadow-sm cursor-pointer mt-auto',
                  status === 'sent'
                    ? 'bg-[#10b981] border-[#047857] text-white'
                    : 'bg-[#f05523] border-[#c03d15] text-white hover:bg-[#e04513] active:scale-98'
                )}
              >
                {status === 'transmitting' ? (
                  <span>transmitting...</span>
                ) : status === 'sent' ? (
                  <>
                    <Check size={12} />
                    <span>transmitted</span>
                  </>
                ) : (
                  <>
                    <Send size={10} />
                    <span>transmit signal</span>
                  </>
                )}
              </button>

            </div>

          </form>

          {/* Footer model code */}
          <div className="mt-8 border-t border-[#e4e4e0] pt-4 text-center dark:border-[#202020]">
            <p className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">
              mechanical system interface / dieter rams layout standard
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
