import React, { useState } from 'react'
import { useDialKit, DialRoot } from 'dialkit'
import { motion } from 'motion/react'
import { Sparkles, Music, Activity, Volume2, ShieldCheck, Zap } from 'lucide-react'

export default function GlassBentoShowcase() {
  const [isPlaying, setIsPlaying] = useState(true)

  // DialKit Live Controls (https://www.dialkit.dev/agent)
  const dial = useDialKit('Glass Bento Showcase', {
    title: 'Audio Visualizer Bento',
    subtitle: 'Real-time interactive canvas stage',
    badgeText: 'LIVE REACT COMPONENT',
    radius: [24, 4, 48],
    padding: [28, 12, 60],
    accent: '#6366f1',
    cardBg: '#12151c',
    hoverScale: [1.025, 1.0, 1.15],
    springBounce: [0.25, 0.0, 0.8],
  })

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto font-sans">
      <motion.div
        whileHover={{ scale: dial.hoverScale }}
        transition={{ type: 'spring', bounce: dial.springBounce, duration: 0.4 }}
        style={{
          borderRadius: `${dial.radius}px`,
          padding: `${dial.padding}px`,
          backgroundColor: dial.cardBg,
          borderColor: `${dial.accent}33`,
        }}
        className="w-full border shadow-2xl backdrop-blur-2xl transition-all"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: `${dial.accent}20`, borderColor: `${dial.accent}40`, color: dial.accent }}
              className="p-2.5 rounded-xl border flex items-center justify-center"
            >
              <Music className="size-5" />
            </div>
            <div>
              <span
                style={{ color: dial.accent, backgroundColor: `${dial.accent}15` }}
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
              >
                {dial.badgeText}
              </span>
              <h1 className="text-xl font-bold text-white mt-1">{dial.title}</h1>
              <p className="text-xs text-neutral-400">{dial.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              backgroundColor: isPlaying ? dial.accent : '#262626',
              borderRadius: `${Math.max(8, dial.radius - 8)}px`,
            }}
            className="px-4 py-2 text-xs font-semibold text-white shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Activity className="size-3.5" />
            {isPlaying ? 'ACTIVE FREQUENCY' : 'MUTED'}
          </button>
        </div>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Waveform */}
          <div
            style={{ borderRadius: `${Math.max(12, dial.radius - 6)}px` }}
            className="md:col-span-2 p-5 bg-black/40 border border-white/5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-4">
              <span className="flex items-center gap-1.5 font-medium text-white">
                <Sparkles className="size-3.5 text-amber-400" /> Stereo Harmonic Spectrum
              </span>
              <span className="font-mono text-[11px]">96.4 kHz · 24-bit PCM</span>
            </div>
            {/* Visualizer Bars */}
            <div className="flex items-end gap-1.5 h-28 px-2 py-3 bg-black/60 rounded-xl border border-white/5">
              {[45, 78, 62, 90, 34, 85, 100, 72, 60, 88, 55, 92, 40, 68, 80, 50].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: isPlaying ? [`${h * 0.4}%`, `${h}%`, `${h * 0.6}%`] : '15%',
                  }}
                  transition={{
                    repeat: Infinity,
                    repeatType: 'mirror',
                    duration: 0.8 + (i % 4) * 0.15,
                    ease: 'easeInOut',
                  }}
                  style={{
                    backgroundColor: i % 2 === 0 ? dial.accent : '#38bdf8',
                    borderRadius: '4px',
                  }}
                  className="flex-1 opacity-90"
                />
              ))}
            </div>
          </div>

          {/* Card 2: Quick Metrics */}
          <div
            style={{ borderRadius: `${Math.max(12, dial.radius - 6)}px` }}
            className="p-5 bg-black/40 border border-white/5 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Dynamic Range</div>
              <div className="text-2xl font-black text-white mt-1">+14.2 dB</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Output Gain</span>
                <span className="font-mono text-white font-semibold">82%</span>
              </div>
              <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div style={{ backgroundColor: dial.accent, width: '82%' }} className="h-full rounded-full" />
              </div>
            </div>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
              <span className="flex items-center gap-1"><ShieldCheck className="size-3.5 text-emerald-400" /> Bit-perfect</span>
              <span className="font-mono text-[10px] text-neutral-500">DIALKIT ENABLED</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Official DialKit Dock (bottom-right inside iframe) */}
      <DialRoot position="bottom-right" theme="dark" productionEnabled={true} />
    </div>
  )
}
