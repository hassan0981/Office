-- Enable Row Level Security (RLS) on User and Task tables

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;

-- Policies for "User" table
CREATE POLICY "Users can view their own profile"
  ON "User" FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can insert their own profile"
  ON "User" FOR INSERT
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile"
  ON "User" FOR UPDATE
  USING (auth.uid()::text = id);

-- Policies for "Task" table
CREATE POLICY "Users can view their own tasks"
  ON "Task" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create their own tasks"
  ON "Task" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own tasks"
  ON "Task" FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own tasks"
  ON "Task" FOR DELETE
  USING (auth.uid()::text = "userId");

-- Automatic User Sync Trigger (optional but recommended in Supabase dashboard SQL)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."User" (id, email, name, "createdAt")
  VALUES (
    new.id::text,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution after auth.users sign-up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
