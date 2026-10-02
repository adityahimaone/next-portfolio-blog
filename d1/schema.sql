-- Bookmarks catalogue. Previously content/bookmarks.json on local disk, read
-- and written by app/api/bookmarks/route.ts. `id` is a text primary key because
-- existing rows use the `bm-<timestamp>` form the old generator produced and
-- are seeded from that file.
CREATE TABLE IF NOT EXISTS bookmarks (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL,
  -- JSON array. SQLite has no array type; marshalling stays in the route so
  -- the client contract (string[]) is unchanged.
  tags        TEXT NOT NULL DEFAULT '[]',
  favicon_url TEXT,
  featured    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);

-- Category counts and the {n} saved figure are counted over the whole table,
-- so an index on category keeps those off a full scan as the table grows.
CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks (category);
CREATE INDEX IF NOT EXISTS idx_bookmarks_featured ON bookmarks (featured);

-- View counters, previously .views.json mutated with fs.writeFileSync.
CREATE TABLE IF NOT EXISTS views (
  slug  TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);