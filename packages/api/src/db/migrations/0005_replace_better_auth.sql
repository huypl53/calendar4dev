-- Drop Better Auth-specific tables (Supabase Auth manages these in auth.* schema)
DROP TABLE IF EXISTS "accounts";--> statement-breakpoint
DROP TABLE IF EXISTS "verifications";--> statement-breakpoint
DROP TABLE IF EXISTS "sessions";--> statement-breakpoint

-- Remove Better Auth-specific columns from users profile table
ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verified";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "image";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_hash";--> statement-breakpoint

-- Trigger: auto-create public.users profile when a new Supabase Auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;--> statement-breakpoint

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
