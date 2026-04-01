import {
  pgTable,
  uuid,
  text,
  integer,
  smallint,
  boolean,
  date,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

// ── event_series ────────────────────────────────────────────
export const eventSeries = pgTable("event_series", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
});

// ── events ──────────────────────────────────────────────────
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  seriesId: uuid("series_id").references(() => eventSeries.id, {
    onDelete: "restrict",
  }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  edition: integer("edition"),
  venue: text("venue"),
  heldAt: date("held_at"),
  youtubePlaylistId: text("youtube_playlist_id"),
});

// ── emcees ──────────────────────────────────────────────────
export const emcees = pgTable("emcees", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  realName: text("real_name"),
  nickname: text("nickname"),
  region: text("region"),
  bio: text("bio"),
  profilePhotoKey: text("profile_photo_key"),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

// ── battles ─────────────────────────────────────────────────
export const battles = pgTable("battles", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").references(() => events.id, {
    onDelete: "set null",
  }),
  youtubeVideoId: text("youtube_video_id").notNull().unique(),
  format: smallint("format").notNull(), // 1=1v1  2=2v2  3=3v3
  rounds: smallint("rounds"),
  thumbnailKey: text("thumbnail_key"),
  durationSeconds: integer("duration_seconds"),
  publishedAt: date("published_at"),
  avgRating: numeric("avg_rating", { precision: 3, scale: 2 }).default("0"), // cached
  ratingCount: integer("rating_count").notNull().default(0), // cached
  ...timestamps,
});

// ── battle_emcees (junction) ─────────────────────────────────
export const battleEmcees = pgTable(
  "battle_emcees",
  {
    battleId: uuid("battle_id")
      .notNull()
      .references(() => battles.id, { onDelete: "cascade" }),
    emceeId: uuid("emcee_id")
      .notNull()
      .references(() => emcees.id, { onDelete: "cascade" }),
    team: text("team").notNull(), // 'A' | 'B'
    position: smallint("position").notNull().default(1),
  },
  (t) => [{ name: "battle_emcees_pkey", columns: [t.battleId, t.emceeId] }],
);

// ── users ───────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  ...timestamps,
});

// ── watches (user watched a battle) ─────────────────────────
export const watches = pgTable("watches", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  battleId: uuid("battle_id")
    .notNull()
    .references(() => battles.id, { onDelete: "cascade" }),
  watchedAt: timestamp("watched_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── ratings (user rated a battle) ───────────────────────────
export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  battleId: uuid("battle_id")
    .notNull()
    .references(() => battles.id, { onDelete: "cascade" }),
  score: smallint("score").notNull(), // e.g. 1–5
  ...timestamps,
});

// ── saved_battles (user bookmarked a battle) ────────────────
export const savedBattles = pgTable("saved_battles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  battleId: uuid("battle_id")
    .notNull()
    .references(() => battles.id, { onDelete: "cascade" }),
  savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── saved_emcees (user bookmarked an emcee) ─────────────────
export const savedEmcees = pgTable("saved_emcees", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  emceeId: uuid("emcee_id")
    .notNull()
    .references(() => emcees.id, { onDelete: "cascade" }),
  savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Relations ────────────────────────────────────────────────
export const eventSeriesRelations = relations(eventSeries, ({ many }) => ({
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  series: one(eventSeries, {
    fields: [events.seriesId],
    references: [eventSeries.id],
  }),
  battles: many(battles),
}));

export const emceesRelations = relations(emcees, ({ many }) => ({
  battleEmcees: many(battleEmcees),
  savedByUsers: many(savedEmcees),
}));

export const battlesRelations = relations(battles, ({ one, many }) => ({
  event: one(events, { fields: [battles.eventId], references: [events.id] }),
  battleEmcees: many(battleEmcees),
  watches: many(watches),
  ratings: many(ratings),
  savedBy: many(savedBattles),
}));

export const battleEmceesRelations = relations(battleEmcees, ({ one }) => ({
  battle: one(battles, {
    fields: [battleEmcees.battleId],
    references: [battles.id],
  }),
  emcee: one(emcees, {
    fields: [battleEmcees.emceeId],
    references: [emcees.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  watches: many(watches),
  ratings: many(ratings),
  savedBattles: many(savedBattles),
  savedEmcees: many(savedEmcees),
}));

export const watchesRelations = relations(watches, ({ one }) => ({
  user: one(users, { fields: [watches.userId], references: [users.id] }),
  battle: one(battles, {
    fields: [watches.battleId],
    references: [battles.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, { fields: [ratings.userId], references: [users.id] }),
  battle: one(battles, {
    fields: [ratings.battleId],
    references: [battles.id],
  }),
}));

export const savedBattlesRelations = relations(savedBattles, ({ one }) => ({
  user: one(users, {
    fields: [savedBattles.userId],
    references: [users.id],
  }),
  battle: one(battles, {
    fields: [savedBattles.battleId],
    references: [battles.id],
  }),
}));

export const savedEmceesRelations = relations(savedEmcees, ({ one }) => ({
  user: one(users, {
    fields: [savedEmcees.userId],
    references: [users.id],
  }),
  emcee: one(emcees, {
    fields: [savedEmcees.emceeId],
    references: [emcees.id],
  }),
}));
