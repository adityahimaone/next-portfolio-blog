import type { CSSProperties } from 'react'
import { nameWave, type ArrangementClip as ClipData } from './arrangement-data'
import styles from './arrangement.module.css'

const NAME_WAVE = nameWave('ADITYA HIMAWAN')

/** The name's samples as a mirrored waveform path in a 0..100 x 0..100 box. */
const WAVE_PATH = (() => {
  const step = 100 / (NAME_WAVE.length - 1)
  const top = NAME_WAVE.map(
    (v, i) =>
      `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(2)} ${(50 - v * 48).toFixed(2)}`,
  )
  const bottom = NAME_WAVE.map(
    (v, i) =>
      `L${(100 - i * step).toFixed(2)} ${(50 + NAME_WAVE[NAME_WAVE.length - 1 - i] * 48).toFixed(2)}`,
  )
  return `${top.join(' ')} ${bottom.join(' ')} Z`
})()

/**
 * One clip, the way a DAW playlist draws it: a coloured header strip carrying
 * the name, and a darker body carrying a preview of what is inside.
 *
 * - a pattern clip's body is a piano-roll preview — one note per listed
 *   technology, as long as that technology's level;
 * - the name clip's body is the name as a waveform;
 * - the profile clip's body is its one line of detail, and it is the clip the
 *   dive opens into, so its fill is a wash that the page colour replaces.
 *
 * A clip is a `<div>` unless it is selectable, in which case it is a `<button>`.
 *
 * `source` marks the one clip the handoff reads its opening geometry from. It
 * is an attribute rather than a class because the reader of it is a different
 * component entirely — see `components/matter/use-matter-motion.ts`.
 */
export function ArrangementClip({
  clip,
  index = 0,
  onSelect,
  selected,
  source,
}: {
  clip: ClipData
  /** The clip's position in the arrangement, for the one-time record-in. */
  index?: number
  onSelect?: () => void
  selected?: boolean
  /** Marks this clip as the source region the matter handoff grows from. */
  source?: boolean
}) {
  const className = [
    styles.clip,
    clip.kind === 'name' ? styles.clipName : '',
    clip.kind === 'profile' ? styles.clipProfile : '',
    selected ? styles.clipSelected : '',
  ]
    .filter(Boolean)
    .join(' ')

  const style = {
    '--clip-start': clip.start,
    '--clip-end': clip.end,
    '--clip-color': clip.color,
    // Overlapping clips share a lane in rows rather than on top of each other.
    '--clip-top': clip.top ?? 0,
    '--clip-height': clip.height ?? 1,
    '--i': index,
  } as CSSProperties

  const count = clip.notes?.length ?? 0

  const body = (
    <>
      {clip.kind === 'profile' ? (
        <span className={styles.clipWash} aria-hidden="true" />
      ) : null}
      <span className={styles.clipHead}>
        {clip.kind === 'name' ? (
          <>
            <span aria-hidden="true">AUDIO</span>
            <span aria-hidden="true">FRONTEND ENGINEER · JAKARTA</span>
          </>
        ) : (
          <strong>{clip.label}</strong>
        )}
      </span>
      <span className={styles.clipBody}>
        {clip.kind === 'name' ? (
          <>
            <svg
              className={styles.clipWave}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d={WAVE_PATH} />
            </svg>
            <h1 className={styles.clipNameTitle}>
              {clip.label.split(' ').map((word) => (
                <span key={word}>{word}</span>
              ))}
            </h1>
            <span className={styles.srOnly}> — Frontend Engineer, Jakarta</span>
          </>
        ) : clip.notes ? (
          <span className={styles.notes} aria-hidden="true">
            {clip.notes.map((note, index) => (
              <i
                key={index}
                style={
                  {
                    '--note': note,
                    '--row': index,
                    '--rows': count,
                    // Where in the world this note sits. The notes spread across
                    // the first 36% of their clip's span, which is how a pattern
                    // sits inside a region in a DAW, and the playhead lights each
                    // one as it arrives.
                    '--at':
                      clip.start +
                      (clip.end - clip.start) * ((index / count) * 0.36),
                  } as CSSProperties
                }
              />
            ))}
          </span>
        ) : clip.detail ? (
          <span className={styles.clipDetail}>{clip.detail}</span>
        ) : null}
      </span>
    </>
  )

  if (!onSelect) {
    return (
      <div
        className={className}
        style={style}
        data-matter-source={source ? '' : undefined}
      >
        {body}
      </div>
    )
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-pressed={selected}
      onClick={onSelect}
      data-matter-source={source ? '' : undefined}
    >
      {body}
    </button>
  )
}
