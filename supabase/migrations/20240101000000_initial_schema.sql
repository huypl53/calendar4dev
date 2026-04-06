CREATE TYPE "public"."permission_level" AS ENUM('free_busy', 'details', 'edit', 'admin');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('busy', 'free');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('standard', 'all_day', 'task', 'reminder', 'out_of_office', 'focus_time', 'working_location');--> statement-breakpoint
CREATE TYPE "public"."event_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."exception_type" AS ENUM('cancelled', 'modified');--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password_hash" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "calendar_members" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"calendar_id" varchar(128) NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"permission_level" "permission_level" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendars" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"color" varchar(7) DEFAULT '#1f2937' NOT NULL,
	"timezone" varchar(64) DEFAULT 'UTC' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_exceptions" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"event_id" varchar(128) NOT NULL,
	"exception_date" timestamp with time zone NOT NULL,
	"exception_type" "exception_type" NOT NULL,
	"modified_event_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"calendar_id" varchar(128) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"all_day" boolean DEFAULT false NOT NULL,
	"location" varchar(500),
	"color" varchar(7),
	"status" "event_status" DEFAULT 'busy' NOT NULL,
	"visibility" "event_visibility" DEFAULT 'public' NOT NULL,
	"event_type" "event_type" DEFAULT 'standard' NOT NULL,
	"recurrence_rule" text,
	"search_vector" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce("events"."title", '')), 'A') || setweight(to_tsvector('english', coalesce("events"."description", '')), 'B') || setweight(to_tsvector('english', coalesce("events"."location", '')), 'C')) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_members" ADD CONSTRAINT "calendar_members_calendar_id_calendars_id_fk" FOREIGN KEY ("calendar_id") REFERENCES "public"."calendars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_members" ADD CONSTRAINT "calendar_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_exceptions" ADD CONSTRAINT "event_exceptions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_calendar_id_calendars_id_fk" FOREIGN KEY ("calendar_id") REFERENCES "public"."calendars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sessions_user_id" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_expires_at" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_calendar_members_unique" ON "calendar_members" USING btree ("calendar_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_calendar_members_user_id" ON "calendar_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_calendars_user_name" ON "calendars" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "idx_calendars_user_id" ON "calendars" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_event_exceptions_unique" ON "event_exceptions" USING btree ("event_id","exception_date");--> statement-breakpoint
CREATE INDEX "idx_events_calendar_id" ON "events" USING btree ("calendar_id");--> statement-breakpoint
CREATE INDEX "idx_events_start_time" ON "events" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "idx_events_calendar_start" ON "events" USING btree ("calendar_id","start_time");--> statement-breakpoint
CREATE INDEX "idx_events_search" ON "events" USING gin ("search_vector");