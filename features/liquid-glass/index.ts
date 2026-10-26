/**
 * Side Two — the public surface of this feature module.
 *
 * Routes import from here only; anything not exported is an implementation
 * detail that is free to change.
 */

export { HomeView } from './views/home-view'
export { NotesIndexView } from './views/notes-index-view'
export { NoteReaderView } from './components/notes/reader'
export { WorldChrome } from './components/world-chrome'
export { cms } from './lib/cms'
export type { Note, Project, Track, PortfolioSource } from './types'
