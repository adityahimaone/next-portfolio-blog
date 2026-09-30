import styles from '@/features/bookmarks/library.module.css'

/**
 * The library is now filtered on the server, so every keystroke in the search
 * box and every chip in the sidebar is a navigation with a real round trip
 * behind it. Without a fallback the list blanks out and refills on each one.
 *
 * The rows are inert: no links, no buttons, no focusable children. A skeleton
 * full of tab stops is worse than a blank for anyone navigating by keyboard,
 * and there is nothing here a screen reader can usefully announce either — the
 * real heading and count arrive with the page that replaces this.
 */
export default function Loading() {
  return (
    <main className={styles.page} id="main-content" aria-busy="true">
      <div className={styles.library}>
        <aside
          className={`${styles.sidebar} glass`}
          aria-hidden="true"
          data-loading
        >
          <p className={styles.sidebarTitle}>Playlists</p>
          <div className={styles.sidebarScroll}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={styles.skeletonRow} />
            ))}
          </div>
        </aside>

        <div>
          <div className={styles.trackHead}>
            <h2 className={styles.trackTitle}>Loading library…</h2>
          </div>
          <ul className={styles.trackList} aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <li key={i} className={styles.skeletonRow} />
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
