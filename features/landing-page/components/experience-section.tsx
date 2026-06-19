'use client'

import { useState, useRef, useEffect } from 'react'
import { m as motion, AnimatePresence } from 'motion/react'
import {
  Briefcase,
  Calendar,
  MapPin,
  ListMusic,
  ChevronRight,
  Activity,
  Disc
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EXPERIENCES } from '../constants'
import { useAudioEngine } from '@/features/landing-page/spotify/use-audio-engine'

const MechanicalScrew = () => (
  <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-800 border border-zinc-400/40 dark:border-zinc-700/40 shadow-inner flex items-center justify-center select-none relative overflow-hidden">
    <div className="absolute w-[5px] h-[1px] bg-zinc-500 dark:bg-zinc-650 rotate-45" />
  </div>
)

const TapeReel = ({ isRolling }: { isRolling: boolean }) => (
  <div className="flex gap-8 items-center justify-center bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow-inner relative overflow-hidden h-24">
    <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] opacity-5 pointer-events-none" style={{ backgroundSize: '6px 6px' }} />
    
    {/* Left Reel */}
    <motion.div
      animate={isRolling ? { rotate: 360 } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      className="w-12 h-12 rounded-full border border-zinc-750 flex items-center justify-center bg-zinc-900 relative shadow-inner"
    >
      <div className="w-8 h-8 rounded-full border border-dashed border-zinc-600 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-zinc-950 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-zinc-700" />
        </div>
      </div>
    </motion.div>

    {/* Tape Path */}
    <div className="w-12 h-[2px] bg-zinc-800 relative z-10" />

    {/* Right Reel */}
    <motion.div
      animate={isRolling ? { rotate: 360 } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      className="w-12 h-12 rounded-full border border-zinc-750 flex items-center justify-center bg-zinc-900 relative shadow-inner"
    >
      <div className="w-8 h-8 rounded-full border border-dashed border-zinc-600 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-zinc-950 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-zinc-700" />
        </div>
      </div>
    </motion.div>
  </div>
)

const StepSequencerRow = ({ 
  selectedId, 
  onStepSelect, 
  isPlaying, 
  setIsPlaying 
}: { 
  selectedId: number
  onStepSelect: (id: number) => void
  isPlaying: boolean
  setIsPlaying: (p: boolean) => void 
}) => {
  const { toneRef, startAudio } = useAudioEngine()
  const synthRef = useRef<any>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const playSequencerNote = async (id: number) => {
    try {
      const audioStarted = await startAudio()
      if (!audioStarted) return
      const Tone = toneRef.current
      if (!Tone) return

      if (!synthRef.current) {
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'square' },
          envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.4 }
        }).toDestination()
        synthRef.current.volume.value = -18
      }

      let notes = ['C4']
      if (id === 1) notes = ['F4', 'C5']
      else if (id === 2) notes = ['G4', 'D5']
      else if (id === 3) notes = ['A4', 'E5']

      synthRef.current.triggerAttackRelease(notes, 0.25)
      setIsPlaying(true)
      setTimeout(() => setIsPlaying(false), 250)
    } catch (e) {
      console.warn(e)
    }
  }

  // Auto stepping light indicator loop
  useEffect(() => {
    let interval: any
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % 8)
      }, 300)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div className="relative rounded-2xl border border-zinc-350 dark:border-zinc-800 bg-zinc-200/80 dark:bg-zinc-950 p-6 shadow-inner flex flex-col justify-between overflow-hidden h-[400px]">
      
      {/* Corner rack screws */}
      <div className="absolute top-3 left-3"><MechanicalScrew /></div>
      <div className="absolute top-3 right-3"><MechanicalScrew /></div>
      <div className="absolute bottom-3 left-3"><MechanicalScrew /></div>
      <div className="absolute bottom-3 right-3"><MechanicalScrew /></div>

      <div className="relative z-10 flex justify-between items-center border-b border-zinc-300 dark:border-zinc-900 pb-3 mt-1">
        <span className="font-mono text-[8px] font-bold tracking-[0.2em] text-zinc-550 dark:text-zinc-550 uppercase">SEQ TIMELINE: 08-STEP // MILITARY CLASS</span>
        <span className="font-mono text-[7px] text-[#10b981] bg-[#10b981]/5 px-2 py-0.5 rounded border border-[#10b981]/15 tracking-wider">ACTIVE_FLOW</span>
      </div>

      {/* Sequencer tape deck reel visualization */}
      <div className="my-4">
        <TapeReel isRolling={isPlaying} />
      </div>

      {/* Grid Steps matrix */}
      <div className="flex flex-col gap-3 mb-1">
        <span className="font-mono text-[7px] text-zinc-550 dark:text-zinc-550 uppercase tracking-widest text-left">CHRONO TRIGGERS</span>
        
        {/* Step indicator LED lights */}
        <div className="flex justify-between items-center px-2 bg-zinc-100/50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-905">
          {[...Array(8)].map((_, i) => {
            const isCurrentLight = isPlaying && currentStepIndex === i
            return (
              <div 
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-100",
                  isCurrentLight ? "bg-[#10b981] shadow-[0_0_6px_#10b981]" : "bg-zinc-350 dark:bg-zinc-800"
                )}
              />
            )
          })}
        </div>

        {/* Sequencer mechanical button selectors */}
        <div className="flex gap-2 items-stretch justify-between mt-1">
          {EXPERIENCES.map((exp) => {
            const isActive = selectedId === exp.id
            return (
              <button
                key={exp.id}
                onClick={() => {
                  onStepSelect(exp.id)
                  playSequencerNote(exp.id)
                }}
                className={cn(
                  "flex-1 h-12 rounded-lg border flex flex-col justify-center items-center cursor-pointer transition-all duration-100 active:scale-95 select-none",
                  isActive 
                    ? "bg-[#f59e0b] border-[#f59e0b] text-zinc-950 font-black shadow-md" 
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-400"
                )}
              >
                <span className="font-mono text-[9px] font-bold">0{exp.id}</span>
                <div className={cn("w-1 h-1 rounded-full mt-1.5", isActive ? "bg-zinc-950" : "bg-zinc-400 dark:bg-zinc-700")} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ExperienceSection() {
  const [selectedId, setSelectedId] = useState(EXPERIENCES[0].id)
  const [isPlaying, setIsPlaying] = useState(false)
  const selectedJob =
    EXPERIENCES.find((e) => e.id === selectedId) || EXPERIENCES[0]

  return (
    <section id="experience" className="py-24 bg-zinc-50 dark:bg-zinc-955 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-14 flex flex-col items-center text-center">
          <div
            className="mb-4 flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-800 bg-zinc-200/50 dark:bg-zinc-900/60 px-4 py-1.5 text-xs font-mono tracking-wider text-[#f59e0b]"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>02 // CAREER RECORDINGS</span>
          </div>
          <h2
            className="text-4xl font-black tracking-tighter sm:text-5xl text-zinc-900 dark:text-zinc-100 uppercase"
          >
            Step Sequencer
          </h2>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          
          {/* Left Column: Sequencer Grid Trigger Box */}
          <div className="lg:col-span-5 flex flex-col justify-end">
            <StepSequencerRow 
              selectedId={selectedId} 
              onStepSelect={setSelectedId} 
              isPlaying={isPlaying} 
              setIsPlaying={setIsPlaying}
            />
          </div>

          {/* Right Column: Experience Details */}
          <div className="lg:col-span-7">
            <div className="relative h-full min-h-[480px] overflow-hidden rounded-3xl border border-zinc-250 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-900/40 shadow-2xl">
              
              {/* Dynamic light gradient backing */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedJob.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.03 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    'absolute inset-0 blur-3xl',
                    selectedJob.color,
                  )}
                />
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-2 mix-blend-overlay" />

              <div className="relative flex h-full flex-col p-6 sm:p-8 md:p-10 justify-between">
                
                <div>
                  {/* Job Header Metadata */}
                  <div className="mb-6 border-b border-zinc-300 dark:border-zinc-850 pb-6">
                    <motion.div
                      key={selectedJob.company}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="font-mono text-[9px] text-[#f59e0b] tracking-[0.2em] uppercase block mb-1">
                        TRACK_0{selectedJob.id} // ACTIVE_JOB
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
                        {selectedJob.role}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-zinc-650 dark:text-zinc-400 text-sm">
                        <span className="text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 font-bold">
                          <Briefcase className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                          {selectedJob.company}
                        </span>
                        <span className="hidden h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700 sm:block" />
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                          {selectedJob.location}
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Content Area */}
                  <div className="pr-2">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedJob.id}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {/* Period Badge */}
                        <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-950 px-3 py-1 text-xs font-mono text-zinc-800 dark:text-[#10b981] shadow-inner">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                          {selectedJob.period.toUpperCase()}
                        </div>

                        {/* Descriptions */}
                        <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-850 dark:text-zinc-300">
                          {selectedJob.isGroup ? (
                            <div className="space-y-4">
                              {selectedJob.items?.map((item, i) => (
                                <div
                                  key={i}
                                  className="relative flex w-full items-start gap-3"
                                >
                                  <div className="bg-[#f59e0b]/10 text-[#f59e0b] mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#f59e0b]/20">
                                    <ChevronRight className="h-3 w-3" />
                                  </div>
                                  <div className="flex w-full flex-col">
                                    <h4 className="mt-0 text-md font-bold text-zinc-800 dark:text-zinc-150">
                                      {item.role}
                                    </h4>
                                    <div className="mb-2 flex w-full items-center justify-between text-xs text-zinc-500 dark:text-zinc-450 font-mono">
                                      <span>{item.company}</span>
                                      <span>{item.period}</span>
                                    </div>
                                    <p className="my-0 text-sm leading-relaxed text-zinc-700 dark:text-zinc-350">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <ul className="space-y-3.5">
                              {selectedJob.description?.map((item, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.08 }}
                                  className="flex items-start gap-3 text-sm leading-relaxed"
                                >
                                  <div className="bg-zinc-200 dark:bg-[#f59e0b]/10 text-zinc-700 dark:text-[#f59e0b] mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-300 dark:border-[#f59e0b]/20">
                                    <ChevronRight className="h-3 w-3" />
                                  </div>
                                  <span className="text-zinc-800 dark:text-zinc-350">
                                    {item}
                                  </span>
                                </motion.li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Playback status footer */}
                <div className="mt-8 border-t border-zinc-300 dark:border-zinc-800 pt-6">
                  <div className="flex items-center justify-between font-mono text-[9px]">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1 items-end h-3">
                        {[...Array(4)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="bg-[#10b981] w-[2px] rounded-t-xs"
                            style={{
                              height: '4px',
                              transformOrigin: 'bottom',
                            }}
                            animate={{ scaleY: isPlaying ? [1, 2.5, 1] : 1 }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              delay: i * 0.12,
                            }}
                          />
                        ))}
                      </div>
                      <span className="font-bold tracking-wider text-zinc-600 dark:text-zinc-550 uppercase">
                        {isPlaying ? "STATUS: ROLLING TAPE" : "STATUS: STANDBY"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-zinc-500 font-bold">
                      <ListMusic className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-650" />
                      <span>
                        0{selectedId} / 0{EXPERIENCES.length}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
