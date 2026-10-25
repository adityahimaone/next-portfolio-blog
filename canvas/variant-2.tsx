import React, { useState } from 'react'
import { useDialKit, DialRoot } from 'dialkit'
import { motion } from 'motion/react'
import { Sliders, Disc, Radio, RefreshCw, Zap, Volume2, Cpu } from 'lucide-react'

export default function CyberpunkAudioDeck() {
  const [pulseKey, setPulseKey] = useState(0)

  // DialKit Live Controls (https://www.dialkit.dev/agent)
  const dial = useDialKit('Cyberpunk Deck', {
    deckTitle: 'NEO-SEOUL RHYTHM LAB',
    bpm: [142, 60, 200],
    neonGlow: '#06b6d4',
    deckSurface: '#0b0f17',
    knobRadius: [16, 4, 32],
    faderHeight: [140, 80, 220],
    triggerPulse: { type: 'action' },
  }, {
    onAction: (path) => {
      if (path === 'triggerPulse') {
        setPulseKey(k => k + 1)
      }
    }
  })

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto font-mono text-neutral-200">
      <motion.div
        key={pulseKey}
        initial={{ opacity: 0.9, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        style={{
          backgroundColor: dial.deckSurface,
          borderRadius: `${dial.knobRadius + 8}px`,
          boxShadow: `0 0 35px ${dial.neonGlow}22`,
          borderColor: `${dial.neonGlow}44`,
        }}
        className="w-full border-2 p-6 transition-all"
      >
        {/* Top Console */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              style={{ color: dial.neonGlow, backgroundColor: `${dial.neonGlow}15`, borderColor: `${dial.neonGlow}33` }}
              className="p-2.5 rounded-lg border flex items-center justify-center animate-pulse"
            >
              <Cpu className="size-5" />
            </div>
            <div>
              <div className="text-[10px] tracking-widest text-neutral-400">HARDWARE EMULATOR v2.4</div>
              <div className="text-lg font-black tracking-wider text-white" style={{ color: dial.neonGlow }}>
                {dial.deckTitle}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[9px] text-neutral-500 uppercase">Tempo Clock</div>
              <div className="text-xl font-black text-amber-400">{dial.bpm} <span className="text-xs font-normal">BPM</span></div>
            </div>
          </div>
        </div>

        {/* Console Knobs & Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Fader 1 */}
          <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 flex flex-col items-center justify-between">
            <span className="text-[10px] text-neutral-400 font-bold uppercase">Sub Bass</span>
            <div
              style={{ height: `${dial.faderHeight}px` }}
              className="w-8 bg-neutral-900 border border-neutral-700 rounded-lg relative my-3 flex justify-center items-end p-1"
            >
              <div
                style={{ height: '70%', backgroundColor: dial.neonGlow, borderRadius: `${Math.max(4, dial.knobRadius - 8)}px` }}
                className="w-full shadow-lg"
              />
            </div>
            <span className="text-xs font-bold text-white">+3.2 dB</span>
          </div>

          {/* Fader 2 */}
          <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 flex flex-col items-center justify-between">
            <span className="text-[10px] text-neutral-400 font-bold uppercase">Lead Synth</span>
            <div
              style={{ height: `${dial.faderHeight}px` }}
              className="w-8 bg-neutral-900 border border-neutral-700 rounded-lg relative my-3 flex justify-center items-end p-1"
            >
              <div
                style={{ height: '85%', backgroundColor: '#ec4899', borderRadius: `${Math.max(4, dial.knobRadius - 8)}px` }}
                className="w-full shadow-lg"
              />
            </div>
            <span className="text-xs font-bold text-white">+5.8 dB</span>
          </div>

          {/* Fader 3 */}
          <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 flex flex-col items-center justify-between">
            <span className="text-[10px] text-neutral-400 font-bold uppercase">Hi-Hat Res</span>
            <div
              style={{ height: `${dial.faderHeight}px` }}
              className="w-8 bg-neutral-900 border border-neutral-700 rounded-lg relative my-3 flex justify-center items-end p-1"
            >
              <div
                style={{ height: '45%', backgroundColor: '#10b981', borderRadius: `${Math.max(4, dial.knobRadius - 8)}px` }}
                className="w-full shadow-lg"
              />
            </div>
            <span className="text-xs font-bold text-white">-1.4 dB</span>
          </div>

          {/* Deck Action Pad */}
          <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-neutral-400 font-bold uppercase mb-2">Beat Sync</div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(idx => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPulseKey(k => k + 1)}
                    style={{ borderRadius: `${dial.knobRadius / 2}px` }}
                    className="p-3 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-xs font-bold text-white border border-neutral-700 flex flex-col items-center justify-center transition-transform"
                  >
                    <Disc className="size-3.5 mb-1 text-cyan-400" />
                    CH {idx}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500">
              <span className="flex items-center gap-1 text-cyan-400"><Zap className="size-3" /> DIALKIT TUNED</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Official DialKit Dock (bottom-right inside iframe) */}
      <DialRoot position="bottom-right" theme="dark" productionEnabled={true} />
    </div>
  )
}
