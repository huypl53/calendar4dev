-- Migrate existing 'all_day' event_type rows: set all_day boolean and reclassify as 'standard'
UPDATE "events" SET "all_day" = true, "event_type" = 'standard' WHERE "event_type" = 'all_day';--> statement-breakpoint

-- Recreate event_type enum without 'all_day' value (PostgreSQL requires full recreation)
ALTER TYPE "public"."event_type" RENAME TO "event_type_old";--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('standard', 'task', 'reminder', 'out_of_office', 'focus_time', 'working_location');--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "event_type" TYPE "public"."event_type" USING "event_type"::text::"public"."event_type";--> statement-breakpoint
DROP TYPE "public"."event_type_old";
