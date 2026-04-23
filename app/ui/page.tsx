import { StepSequencer, SpectrumAnalyzer, BeatPad, AudioReactiveBg } from '@/features/music'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UI Components — adityahimaone',
  description: 'Interactive music components playground.',
}

export default function UIPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <div className="border-b border-zinc-200 bg-zinc-50/50 px-4 py-12 dark:border-zinc-800 dark:bg-zinc-900/30 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Interactive Playground
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
            UI Components
          </h1>
          <p className="mt-3 max-w-lg text-sm text-zinc-500 dark:text-zinc-400">
            A collection of interactive music components built with React, Tone.js, and Canvas.
            Attach, detach, and compose them anywhere.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-16 px-4 py-12 sm:px-6 sm:py-20">
        {/* Step Sequencer */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-bold text-zinc-600">01</span>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                StepSequencer
              </h2>
              <p className="text-xs text-zinc-500">
                808-style 4-track × 16-step drum sequencer. Toggle steps, adjust BPM, hit play.
              </p>
            </div>
            <code className="ml-auto hidden rounded border border-zinc-200 bg-zinc-100 px-2 py-1 font-mono text-[10px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 sm:block">
              {'<StepSequencer />'}
            </code>
          </div>
          <StepSequencer />
        </section>

        {/* Spectrum Analyzer */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-bold text-zinc-600">02</span>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                SpectrumAnalyzer
              </h2>
              <p className="text-xs text-zinc-500">
                Real-time FFT visualizer. Mic input or demo synth mode. 128-bin FFT.
              </p>
            </div>
            <code className="ml-auto hidden rounded border border-zinc-200 bg-zinc-100 px-2 py-1 font-mono text-[10px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 sm:block">
              {'<SpectrumAnalyzer />'}
            </code>
          </div>
          <SpectrumAnalyzer />
        </section>

        {/* Beat Pad */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-bold text-zinc-600">03</span>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                BeatPad
              </h2>
              <p className="text-xs text-zinc-500">
                4×4 drum pad grid with keyboard mapping. Click or press Q-V keys to trigger.
              </p>
            </div>
            <code className="ml-auto hidden rounded border border-zinc-200 bg-zinc-100 px-2 py-1 font-mono text-[10px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 sm:block">
              {'<BeatPad />'}
            </code>
          </div>
          <div className="mx-auto max-w-lg">
            <BeatPad />
          </div>
        </section>

        {/* Audio Reactive Background */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-bold text-zinc-600">04</span>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                AudioReactiveBg
              </h2>
              <p className="text-xs text-zinc-500">
                Background layer that reacts to microphone input. 3 modes: gradient, bars, orb.
              </p>
            </div>
            <code className="ml-auto hidden rounded border border-zinc-200 bg-zinc-100 px-2 py-1 font-mono text-[10px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 sm:block">
              {'<AudioReactiveBg mode="gradient" />'}
            </code>
          </div>
          <AudioReactiveBg mode="gradient" intensity="medium" className="h-80 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
                <span className="text-lg">🎤</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Audio-Reactive Background
              </h3>
              <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
                Click the MIC button in the top-right corner and make some noise.
                The background will react to your microphone input in real-time.
              </p>
            </div>
          </AudioReactiveBg>
        </section>

        {/* Integration Notes */}
        <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
          <h2 className="mb-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Usage
          </h2>
          <div className="space-y-3">
            <div className="rounded border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <code className="block font-mono text-xs text-zinc-700 dark:text-zinc-300">
                {'import { StepSequencer, SpectrumAnalyzer, BeatPad, AudioReactiveBg } from "@/features/music"'}
              </code>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              All components are self-contained <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">{'<ClientComponent />'}</code> with
              their own audio lifecycle. They lazy-load Tone.js on first interaction.
              No global state, no side effects on unmount.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
