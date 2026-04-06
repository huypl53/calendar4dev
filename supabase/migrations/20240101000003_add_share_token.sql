ALTER TABLE "calendars" ADD COLUMN "share_token" varchar(64);
CREATE UNIQUE INDEX "idx_calendars_share_token" ON "calendars" ("share_token") WHERE "share_token" IS NOT NULL;
