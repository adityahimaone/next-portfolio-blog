import {
  StepSequencer,
  SpectrumAnalyzer,
  BeatPad,
  AudioReactiveBg,
  VinylRecordPlayer,
  VUMeters,
  Oscilloscope,
  TapeDeck,
  PianoRoll,
  WinampVisualizer,
  SynthKnobs,
  WaveformPlayer,
} from '@/features/music'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UI Components — adityahimaone',
  description: 'Interactive music components playground.',
}

function ComponentSection({
  number,
  title,
  description,
  code,
  children,
  narrow = false,
}: {
  number: string
  title: string
  description: string
  code: string
  children: React.ReactNode
  narrow?: boolean
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xs font-bold text-zinc-600">{number}</span>
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            {title}
          </h2>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
        <code className="ml-auto hidden rounded border border-zinc-200 bg-zinc-100 px-2 py-1 font-mono text-[10px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 sm:block">
          {code}
        </code>
      </div>
      {narrow ? (
        <div className="mx-auto max-w-lg">{children}</div>
      ) : (
        children
      )}
    </section>
  )
}

export default function UIPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <div className="border-b border-zinc-200 bg-zinc-50/50 px-4 py-12 dark:border-zinc-800 dark:bg-zinc-900/30 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            Interactive Playground
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
            UI Components
          </h1>
          <p className="mt-3 max-w-lg text-sm text-zinc-500 dark:text-zinc-400">
            A collection of interactive music components built with React, Tone.js,
            and Canvas. Attach, detach, and compose them anywhere.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-16 px-4 py-12 sm:px-6 sm:py-20">
        {/* Sequencers & Players */}
        <ComponentSection
          number="01"
          title="StepSequencer"
          description="808-style 4-track × 16-step drum sequencer. Toggle steps, adjust BPM, hit play."
          code="<StepSequencer />"
        >
          <StepSequencer />
        </ComponentSection>

        <ComponentSection
          number="02"
          title="SpectrumAnalyzer"
          description="Real-time FFT visualizer. Mic input or demo synth mode. 128-bin FFT."
          code="<SpectrumAnalyzer />"
        >
          <SpectrumAnalyzer />
        </ComponentSection>

        <ComponentSection
          number="03"
          title="BeatPad"
          description="4×4 drum pad grid with keyboard mapping. Click or press Q-V keys to trigger."
          code="<BeatPad />"
          narrow
        >
          <BeatPad />
        </ComponentSection>

        <ComponentSection
          number="04"
          title="AudioReactiveBg"
          description="Background layer that reacts to microphone input. 3 modes: gradient, bars, orb."
          code='<AudioReactiveBg mode="gradient" />'
        >
          <AudioReactiveBg
            mode="gradient"
            intensity="medium"
            className="h-80 rounded-xl border border-zinc-200 dark:border-zinc-800"
          >
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
        </ComponentSection>

        {/* NEW: Visual Components */}
        <ComponentSection
          number="05"
          title="VinylRecordPlayer"
          description="Spinning vinyl turntable with tonearm animation, track selection, and 33/45 RPM toggle."
          code="<VinylRecordPlayer />"
        >
          <VinylRecordPlayer />
        </ComponentSection>

        <ComponentSection
          number="06"
          title="VUMeters"
          description="Dual analog VU meters with needle physics. Left/Right channel peak detection from mic."
          code="<VUMeters />"
        >
          <VUMeters />
        </ComponentSection>

        <ComponentSection
          number="07"
          title="Oscilloscope"
          description="CRT-style oscilloscope with phosphor persistence, scanlines, and waveform drawing from mic."
          code="<Oscilloscope />"
        >
          <Oscilloscope />
        </ComponentSection>

        <ComponentSection
          number="08"
          title="TapeDeck"
          description="Retro cassette tape deck with spinning reels, play/record/rewind, and tape counter."
          code="<TapeDeck />"
          narrow
        >
          <TapeDeck />
        </ComponentSection>

        <ComponentSection
          number="09"
          title="PianoRoll"
          description="FL Studio-style piano roll with 16-bar grid, note blocks, and animated playhead."
          code="<PianoRoll />"
        >
          <PianoRoll />
        </ComponentSection>

        <ComponentSection
          number="10"
          title="WinampVisualizer"
          description="Nostalgic bouncing bar visualizer with 4 color presets and mic input."
          code="<WinampVisualizer />"
        >
          <WinampVisualizer />
        </ComponentSection>

        <ComponentSection
          number="11"
          title="SynthKnobs"
          description="8 rotary knobs panel for synth parameters with drag-to-adjust and ADSR envelope preview."
          code="<SynthKnobs />"
        >
          <SynthKnobs />
        </ComponentSection>

        <ComponentSection
          number="12"
          title="WaveformPlayer"
          description="SoundCloud-style audio player with seekable waveform, hover preview, and volume control."
          code="<WaveformPlayer />"
        >
          <WaveformPlayer />
        </ComponentSection>

        {/* Integration Notes */}
        <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
          <h2 className="mb-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Usage
          </h2>
          <div className="space-y-3">
            <div className="rounded border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <code className="block font-mono text-xs text-zinc-700 dark:text-zinc-300">
                import{' '}
                {'{ StepSequencer, SpectrumAnalyzer, BeatPad, VinylRecordPlayer, ... }'}
                {' '}
                from &quot;@/features/music&quot;
              </code>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              All components are self-contained{' '}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">
                {'<ClientComponent />'}
              </code>{' '}
              with their own audio lifecycle. They lazy-load Tone.js on first
              interaction. No global state, no side effects on unmount.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
