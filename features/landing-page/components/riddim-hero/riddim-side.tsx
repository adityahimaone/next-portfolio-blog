import { COPY, SIDE_COPY } from './riddim-content'
import styles from './riddim-hero.module.css'

/**
 * What stands either side of the machine while the camera is pulled back and
 * the key is pressed.
 *
 * Left is the pitch and the two things to do; right is the track list (the
 * page's own sections, read as a playlist) and the signal chain (About's three
 * tracks, one line each). While the second screen wipes in, the "now playing"
 * name and the track marker move on from 01 to 02 with it, so the panels and
 * the machine are one gesture. Both are real links; `data-side` takes them out
 * of the tab order when they are off screen.
 */

const link = (href: string, external: boolean) =>
  external ? { href, target: '_blank', rel: 'noreferrer' } : { href }

export function RiddimSide() {
  return (
    <>
      <aside className={`${styles.side} ${styles.sideLeft}`}>
        <p className={styles.sideKicker}>
          <i aria-hidden="true" />
          <span>{COPY.kicker}</span>
          <em>{COPY.place}</em>
        </p>
        <strong className={styles.sideLine}>{COPY.line}</strong>
        <p className={styles.sideSub}>{COPY.sub}</p>

        <div className={styles.sideNow} aria-hidden="true">
          <small>{SIDE_COPY.now[0]}</small>
          <b className={styles.nowName}>
            <span>{SIDE_COPY.playing[0]}</span>
            <span>{SIDE_COPY.playing[1]}</span>
          </b>
        </div>

        <ul className={styles.sideActions}>
          {SIDE_COPY.actions.map((action) => (
            <li key={action.label}>
              <a
                className={styles.sideAction}
                data-side-link
                {...link(action.href, action.external)}
              >
                {action.label}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <aside className={`${styles.side} ${styles.sideRight}`}>
        <div>
          <p className={styles.sideHead}>Track list</p>
          <ol className={styles.tracks}>
            <span className={styles.trackNow} aria-hidden="true" />
            {SIDE_COPY.tracks.map((track) => {
              const body = (
                <>
                  <span className={styles.trackN}>{track.n}</span>
                  <span className={styles.trackTitle}>
                    <b>{track.title}</b>
                    <span>{track.note}</span>
                  </span>
                </>
              )
              return (
                <li key={track.n} className={styles.track}>
                  {track.href ? (
                    <a
                      className={styles.trackLink}
                      data-side-link
                      href={track.href}
                    >
                      {body}
                    </a>
                  ) : (
                    <span className={styles.trackStatic}>{body}</span>
                  )}
                </li>
              )
            })}
          </ol>
        </div>

        <div>
          <p className={styles.sideHead}>Signal chain</p>
          <ul className={styles.chain}>
            {SIDE_COPY.chain.map((row) => (
              <li key={row.title} className={styles.chainRow}>
                <b>{row.title}</b>
                <span>{row.note}</span>
                <em title={row.label}>{row.metric}</em>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <i className={`${styles.lead} ${styles.leadLeft}`} aria-hidden="true" />
      <i className={`${styles.lead} ${styles.leadRight}`} aria-hidden="true" />
    </>
  )
}
