import type { CSSProperties } from 'react'
import { Fader, Knob, Led, Silk } from './patch-kit'
import { PATCH_LOOP, PATCH_MODULE_LIST } from './patch-data'
import styles from './patch.module.css'

/**
 * The Patch: About as the clip's editor, a hardware synth front panel.
 *
 * Presentational. The hook owns the scroll and writes `--patch-*` on the seam;
 * this reads them through the stylesheet and holds no scroll state of its own.
 * It receives which module is active and a way to jump to one, and that is the
 * whole interface.
 *
 * Contract with the hook: `data-patch-module` on each module, one per
 * `PATCH_MODULE_LIST` entry, in order.
 */
export function PatchPanel({
  active,
  onSelect,
}: {
  active: number
  onSelect: (index: number) => void
}) {
  const clamped = Math.min(Math.max(0, active), PATCH_MODULE_LIST.length - 1)

  return (
    <section className={styles.patch} aria-label="Profile" data-patch>
      {/* A — nameplate. The PROFILE clip's own header strip, grown. */}
      <header
        className={styles.nameplate}
        style={{ '--clip-color': PATCH_LOOP.color } as CSSProperties}
      >
        <strong>{PATCH_LOOP.label}</strong>
        <span aria-hidden="true">
          LOOP BAR {PATCH_LOOP.from} → {PATCH_LOOP.to}
        </span>
      </header>

      {/* B — the modules. Column widths are the channel counts: 6fr 4fr 4fr. */}
      <div
        className={styles.modules}
        style={
          {
            gridTemplateColumns: PATCH_MODULE_LIST.map(
              (m) => `${m.controls.length}fr`,
            ).join(' '),
          } as CSSProperties
        }
      >
        {PATCH_MODULE_LIST.map((module) => (
          <div
            key={module.id}
            className={styles.module}
            data-patch-module
            data-active={module.index === clamped}
            style={
              {
                '--module-color': module.color,
                '--m': module.index,
                '--sweep': `var(--patch-sweep-${module.index}, 1)`,
                '--room': module.room,
              } as CSSProperties
            }
          >
            {/* The select button is a sibling of the story, never its parent:
                the résumé link lives in the story, and a link inside a button
                is invalid. */}
            <button
              type="button"
              className={styles.moduleHead}
              aria-pressed={module.index === clamped}
              onClick={() => onSelect(module.index)}
            >
              <Led on={module.index === clamped} color={module.color} />
              <Silk>
                {String(module.index + 1).padStart(2, '0')} · {module.stage}
              </Silk>
              <Silk>{module.label}</Silk>
            </button>

            <div className={styles.bank} data-control={module.control}>
              {module.controls.map((control, i) =>
                module.control === 'fader' ? (
                  <Fader key={control.name} {...control} index={i} />
                ) : (
                  <Knob key={control.name} {...control} index={i} />
                ),
              )}
            </div>
          </div>
        ))}

        {/* The cursor walks the modules. One element; position is one property. */}
        <span className={styles.cursor} aria-hidden="true" />
      </div>

      {/* C — the LCD. All three takes stay in the DOM, stacked in one grid cell;
          the inactive ones are `inert`. With no script, on phones and under
          reduced motion the grid collapses and all three read in sequence. */}
      <div className={styles.lcd}>
        <p className={styles.lcdBoot} aria-hidden="true">
          Make the complicated part feel obvious.
        </p>
        {PATCH_MODULE_LIST.map(({ take, index, stage, color }) => (
          <article
            key={take.title}
            className={styles.take}
            data-active={index === clamped}
            inert={index !== clamped}
            style={{ '--module-color': color } as CSSProperties}
          >
            <Silk>
              TAKE {String(index + 1).padStart(2, '0')} / {stage} · {take.note}
            </Silk>
            <Silk as="h3">{take.heading}</Silk>
            <p>{take.story}</p>
            {take.credits ? (
              <ul>
                {take.credits.map((credit) => (
                  <li key={credit.name}>
                    <b>{credit.name}</b> <span>{credit.note}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {take.aside ? <p className={styles.aside}>{take.aside}</p> : null}
            {take.resumeLink ? (
              <a className={styles.resume} href={take.resumeLink}>
                Résumé →
              </a>
            ) : null}
          </article>
        ))}
      </div>

      {/* D — the output stage. Decoration, and deliberately not a readout.
          This footer used to print the same three numbers the hero's proof
          strip prints, which made the panel an echo of the section above it.
          The numbers live in one place on the page, and it is not here.

          What is left is the hardware an amp ends in — a finned heatsink, a
          speaker grille and a power lamp. `--settle` is the panel's own
          power-on act and `--p` its power state, so the lamp and the fins
          report something true rather than blinking for effect. It is
          `aria-hidden`: there is nothing here to read. */}
      <footer className={styles.outStage} aria-hidden="true">
        <span className={styles.outFins} />
        <span className={styles.outGrille} />
        <span className={styles.outLamp} />
      </footer>
    </section>
  )
}
