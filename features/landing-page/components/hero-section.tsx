'use client'

import { useRef, useState, useEffect } from 'react'
import { m as motion, useScroll, useTransform, AnimatePresence } from 'motion/react'
import { Play, Pause, SkipForward, Activity, Sparkles, RefreshCw } from 'lucide-react'
import { Magnetic } from '@/components/magnetic'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { Syne } from 'next/font/google'
import { cn } from '@/lib/utils'

const syne = Syne({ weight: ['700', '800'], subsets: ['latin'] })

const MechanicalScrew = () => (
  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-800 border border-zinc-400/40 dark:border-zinc-700/40 shadow-inner flex items-center justify-center select-none relative overflow-hidden">
    <div className="absolute w-1.5 h-[1.5px] bg-zinc-500 dark:bg-zinc-650 rotate-45" />
  </div>
)

const SynthRackKnob = ({ 
  value, 
  onChange, 
  label,
  knobColor
}: { 
  value: number
  onChange: (v: number) => void
  label: string
  knobColor: string
}) => {
  const rotation = -135 + value * 270

  const handlePan = (_: any, info: { delta: { y: number } }) => {
    const delta = -info.delta.y * 0.01
    const newValue = Math.min(1, Math.max(0, value + delta))
    onChange(newValue)
  }

  return (
    <div className="flex touch-none flex-col items-center gap-2 select-none">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-950 shadow-inner">
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="relative h-8 w-8 cursor-grab rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 shadow active:cursor-grabbing flex justify-center items-center"
          onPan={handlePan}
        >
          <div className={cn("w-3.5 h-3.5 rounded-full relative flex justify-center", knobColor)}>
            <div className="absolute -top-1 w-[2px] h-2 bg-white dark:bg-zinc-100 rounded-full" />
          </div>
        </motion.div>
      </div>
      <span className="font-mono text-[7px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}

interface Socket {
  id: string
  name: string
  type: 'out' | 'in'
  x: number // percentage
  y: number // percentage
}

export function HeroSection() {
  const [baseDelay, setBaseDelay] = useState(1)
  const [cutoff, setCutoff] = useState(0.6)
  const [resonance, setResonance] = useState(0.4)
  const [oscType, setOscType] = useState<'sine' | 'square' | 'triangle'>('sine')

  // Patch cords state
  const [selectedSocketId, setSelectedSocketId] = useState<string | null>(null)
  const [connections, setConnections] = useState<Record<string, string>>({
    'osc-out': 'vcf-in', // default patch cord
  })

  // Sockets definitions
  const sockets: Socket[] = [
    { id: 'osc-out', name: 'OSC OUT', type: 'out', x: 20, y: 78 },
    { id: 'lfo-out', name: 'LFO OUT', type: 'out', x: 40, y: 78 },
    { id: 'vcf-in', name: 'VCF IN', type: 'in', x: 60, y: 78 },
    { id: 'amp-in', name: 'AMP IN', type: 'in', x: 80, y: 78 },
  ]

  const handleSocketClick = (id: string) => {
    const clicked = sockets.find(s => s.id === id)
    if (!clicked) return

    if (!selectedSocketId) {
      setSelectedSocketId(id)
    } else {
      const first = sockets.find(s => s.id === selectedSocketId)
      if (first && first.type !== clicked.type) {
        // Valid connection: one out, one in
        const outId = first.type === 'out' ? first.id : clicked.id
        const inId = first.type === 'in' ? first.id : clicked.id
        setConnections(prev => ({
          ...prev,
          [outId]: inId
        }))
      } else {
        // Clear or toggle
        if (selectedSocketId === id) {
          // If clicked twice, delete connection if exists
          setConnections(prev => {
            const copy = { ...prev }
            if (copy[id]) delete copy[id]
            // check if it is the target of any connection
            Object.keys(copy).forEach(k => {
              if (copy[k] === id) delete copy[k]
            })
            return copy
          })
        }
      }
      setSelectedSocketId(null)
    }
  }

  const clearConnections = () => {
    setConnections({})
    setSelectedSocketId(null)
  }

  useEffect(() => {
    if (sessionStorage.getItem('preloaderShown')) {
      setBaseDelay(0.1)
    }
  }, [])

  const { isPlaying, togglePlay, currentTrack, volume, setVolume } = useAudio()
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.98])

  // Oscilloscope Animation helper
  const [time, setTime] = useState(0)
  useEffect(() => {
    let frame: number
    const tick = () => {
      setTime(prev => prev + 0.05)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  // Dynamic wave path logic
  const getOscilloscopePath = () => {
    const points = 50
    let path = 'M 0 30'
    const isAmpPatch = Object.values(connections).includes('amp-in')
    const isVcfPatch = Object.values(connections).includes('vcf-in')

    const effectiveVolume = isAmpPatch ? volume : 0.5
    const frequency = isVcfPatch ? cutoff * 10 + 2 : 5
    const amplitude = isPlaying ? effectiveVolume * 25 * (1 + resonance) : 1

    for (let i = 0; i <= points; i++) {
      const x = (i / points) * 180
      const progress = i / points
      let waveY = 0

      if (oscType === 'sine') {
        waveY = Math.sin(progress * Math.PI * frequency - time * 5)
      } else if (oscType === 'square') {
        waveY = Math.sin(progress * Math.PI * frequency - time * 5) >= 0 ? 1 : -1
      } else if (oscType === 'triangle') {
        waveY = Math.abs((((progress * frequency - time * 2) % 2) - 1)) * 2 - 1
      }

      const calculatedY = 30 + waveY * amplitude
      path += ` L ${x} ${calculatedY}`
    }
    return path
  }

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-955 transition-colors duration-300 py-16 md:py-24"
    >
      {/* Grid background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] opacity-60 dark:opacity-40"
          style={{ backgroundSize: '16px 16px' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-3 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(250,250,250,0.85)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_20%,rgba(9,9,11,0.95)_100%)]" />
      </div>

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-20 w-full flex flex-col items-center max-w-6xl px-4"
      >
        {/* Full-width Hi-Fi Master Studio Deck */}
        <div className="relative w-full border border-zinc-350 dark:border-zinc-800 bg-zinc-200/90 dark:bg-zinc-900/90 p-8 md:p-10 shadow-2xl rounded-3xl transition-all duration-300 flex flex-col gap-6">
          
          {/* Chassis Corner Screws */}
          <div className="absolute top-4 left-4"><MechanicalScrew /></div>
          <div className="absolute top-4 right-4"><MechanicalScrew /></div>
          <div className="absolute bottom-4 left-4"><MechanicalScrew /></div>
          <div className="absolute bottom-4 right-4"><MechanicalScrew /></div>

          {/* Top Console Rail */}
          <div className="flex justify-between items-center border-b border-zinc-300 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] font-bold text-zinc-600 dark:text-zinc-500 tracking-[0.2em] uppercase">SYSTEM PANEL: AH-V3 // MASTER DECK</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={cn("h-1.5 w-1.5 rounded-full transition-all duration-300", isPlaying ? "bg-[#10b981] shadow-[0_0_6px_#10b981]" : "bg-zinc-400 dark:bg-zinc-700")} />
              <span className="font-mono text-[8px] tracking-wider text-zinc-600 dark:text-zinc-400 uppercase">SIGNAL_LOCK</span>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Modular synth patch library (Col span 7) */}
            <div className="lg:col-span-7 flex flex-col gap-6 bg-zinc-100/50 dark:bg-zinc-950/60 p-6 rounded-2xl border border-zinc-300 dark:border-zinc-800 shadow-inner justify-between relative min-h-[360px]">
              
              {/* Brand Header */}
              <div className="text-left select-none border-b border-zinc-250 dark:border-zinc-800 pb-3">
                <span className="font-mono text-[8px] text-[#f59e0b] tracking-[0.3em] uppercase block mb-1">01 // OSCILLATOR / MODULATOR</span>
                <h1 className={cn("text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-200 uppercase", syne.className)}>
                  ADITYA HIMAONE
                </h1>
                <span className="font-mono text-[7px] text-zinc-500 dark:text-zinc-400 tracking-[0.2em] uppercase block mt-1">JAKARTA FRONTEND ARCHITECT</span>
              </div>

              {/* Dial Knobs */}
              <div className="grid grid-cols-4 gap-2 items-center py-4 bg-zinc-200/50 dark:bg-zinc-900/30 rounded-xl px-2 border border-zinc-300 dark:border-zinc-850">
                <SynthRackKnob value={volume} onChange={setVolume} label="VOL (BLU)" knobColor="bg-blue-600" />
                <SynthRackKnob value={cutoff} onChange={setCutoff} label="FREQ (YEL)" knobColor="bg-amber-500" />
                <SynthRackKnob value={resonance} onChange={setResonance} label="RESO (RED)" knobColor="bg-red-500" />
                
                {/* Visual LED Beat indicator */}
                <div className="flex flex-col items-center gap-2 select-none">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center">
                    <motion.div 
                      className="w-2.5 h-2.5 rounded-full bg-[#10b981]"
                      animate={isPlaying ? { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] } : { scale: 1, opacity: 0.3 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <span className="font-mono text-[7px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-widest font-mono">BEAT</span>
                </div>
              </div>

              {/* Physical Sockets & Patch Cables Area */}
              <div className="border-t border-zinc-200 dark:border-zinc-855 pt-4 flex flex-col gap-4 relative">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold">TACTILE PATCH BAY</span>
                  <button 
                    onClick={clearConnections}
                    className="flex items-center gap-1 text-[7px] font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 uppercase transition-colors"
                  >
                    <RefreshCw size={8} /> Reset Cables
                  </button>
                </div>

                <div className="relative h-20 bg-zinc-200/60 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-300 dark:border-zinc-850 flex items-center justify-around">
                  {/* Sockets Map */}
                  {sockets.map((socket) => {
                    const isSelected = selectedSocketId === socket.id
                    const isConnected = Object.keys(connections).includes(socket.id) || Object.values(connections).includes(socket.id)
                    return (
                      <button
                        key={socket.id}
                        onClick={() => handleSocketClick(socket.id)}
                        className="flex flex-col items-center gap-1 group relative cursor-pointer"
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center transition-all border shadow-inner",
                          isSelected 
                            ? "bg-amber-500 border-amber-600 scale-105" 
                            : "bg-zinc-300 dark:bg-zinc-900 border-zinc-400 dark:border-zinc-800"
                        )}>
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full transition-colors",
                            isConnected ? "bg-[#10b981]" : "bg-zinc-950"
                          )} />
                        </div>
                        <span className="text-[6px] font-mono font-bold tracking-wider text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-350">{socket.name}</span>
                      </button>
                    )
                  })}

                  {/* SVG Cables drawing */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
                    {Object.entries(connections).map(([fromId, toId]) => {
                      const fromSocket = sockets.find(s => s.id === fromId)
                      const toSocket = sockets.find(s => s.id === toId)
                      if (!fromSocket || !toSocket) return null

                      // Map percentages to actual coordinate approximations inside the container box
                      const fromIdx = sockets.findIndex(s => s.id === fromId)
                      const toIdx = sockets.findIndex(s => s.id === toId)
                      const step = 100 / (sockets.length + 1)
                      
                      const x1 = `${(fromIdx + 1) * step}%`
                      const y1 = '40%'
                      const x2 = `${(toIdx + 1) * step}%`
                      const y2 = '40%'

                      return (
                        <g key={`${fromId}-${toId}`}>
                          <motion.path
                            d={`M ${x1} ${y1} C ${x1} 110%, ${x2} 110%, ${x2} ${y2}`}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            className="drop-shadow-lg opacity-85"
                          />
                          <motion.path
                            d={`M ${x1} ${y1} C ${x1} 110%, ${x2} 110%, ${x2} ${y2}`}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            className="opacity-95"
                          />
                        </g>
                      )
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Console Panel (DAP LCD Screen & Master Actions) - col span 5 */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              
              {/* Dot-matrix style LCD Display */}
              <div className="w-full flex-1 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-950 dark:bg-zinc-950 p-6 shadow-inner flex flex-col justify-between min-h-[240px] font-mono text-left relative overflow-hidden border-2 border-emerald-950">
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] opacity-5 pointer-events-none" style={{ backgroundSize: '4px 4px' }} />
                
                {/* LCD Bezel Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 blur-2xl pointer-events-none" />

                {/* Display Header */}
                <div className="flex justify-between items-center text-[8px] text-[#10b981]/70 font-bold border-b border-[#10b981]/15 pb-2">
                  <span>AH-OS CORE V3.02</span>
                  <div className="flex items-center gap-1.5">
                    <Activity size={8} className="text-[#10b981] animate-pulse" />
                    <span className="text-[#10b981] animate-pulse">ACTIVE</span>
                  </div>
                </div>

                {/* Description and Oscillator Control Mode */}
                <div className="my-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[7px] text-[#f59e0b] tracking-wider uppercase">Description_</span>
                    <div className="flex gap-1.5">
                      {(['sine', 'square', 'triangle'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setOscType(t)}
                          className={cn(
                            "text-[6px] px-1 rounded uppercase tracking-tighter border border-[#10b981]/20",
                            oscType === t ? "bg-[#10b981]/20 text-[#10b981]" : "text-zinc-600 hover:text-[#10b981]/50"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                    Building premium high-fidelity interactive interfaces. Specializing in Next.js, performance optimization, and custom web experience frameworks.
                  </p>
                </div>

                {/* Simulated Phosphor Screen Wave Oscilloscope */}
                <div className="h-16 flex items-center justify-center border-t border-[#10b981]/15 pt-2 relative">
                  <svg className="w-full h-full overflow-visible">
                    <line x1="0" y1="30" x2="100%" y2="30" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3, 3" className="opacity-20" />
                    <line x1="90" y1="0" x2="90" y2="100%" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3, 3" className="opacity-20" />
                    
                    <motion.path
                      d={getOscilloscopePath()}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      className="drop-shadow-[0_0_3px_#10b981]"
                    />
                  </svg>
                </div>

                {/* Screen Status Footer */}
                <div className="flex justify-between items-center text-[7px] text-[#10b981]/60 font-bold border-t border-[#10b981]/15 pt-2">
                  <span>OUT: {isPlaying ? "SIG_CONNECTED" : "SIG_MUTED"}</span>
                  <span className="text-zinc-400 truncate max-w-[140px] uppercase">{currentTrack || "Tape Standby"}</span>
                </div>
              </div>

              {/* Master Control Deck */}
              <div className="flex items-center gap-4 bg-zinc-100/55 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-350 dark:border-zinc-800 shadow-inner justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all active:scale-95 border",
                      isPlaying 
                        ? "bg-[#f59e0b] border-[#f59e0b] text-zinc-950" 
                        : "bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-750"
                    )}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                  </button>
                  <div className="flex flex-col text-left">
                    <span className="font-mono text-[7px] text-zinc-500 uppercase tracking-widest">MASTER</span>
                    <span className="font-mono text-[8px] text-zinc-800 dark:text-zinc-350 uppercase font-black tracking-wider">
                      {isPlaying ? "PAUSE FEED" : "RUN TAPE"}
                    </span>
                  </div>
                </div>

                <Magnetic intensity={0.15}>
                  <a
                    href="#projects"
                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2 px-4 text-[9px] font-bold text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all shadow"
                  >
                    <SkipForward size={11} className="text-zinc-400 dark:text-zinc-555" />
                    <span className="font-mono">NEXT SECT</span>
                  </a>
                </Magnetic>
              </div>

            </div>

          </div>

          {/* Bottom Rail Detail */}
          <div className="flex justify-between items-center border-t border-zinc-300 dark:border-zinc-800 pt-4 text-[8px] font-mono text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.25em]">
            <span>DESIGN: ADITYAHIMAONE.SPACE</span>
            <span>OS_V3.0.0</span>
          </div>

        </div>
      </motion.div>
    </section>
  )
}
