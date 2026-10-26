-- FitQuest application schema
-- Order per table: CREATE -> GRANT -> ENABLE RLS -> POLICIES

-- ---------- 1. profiles ----------
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  age INT NOT NULL,
  experience TEXT NOT NULL CHECK (experience IN ('beginner','intermediate','advanced')),
  goal TEXT NOT NULL CHECK (goal IN ('muscle_gain','fat_loss','general_fitness','strength','endurance')),
  workout_days TEXT[] NOT NULL DEFAULT '{}',
  typical_duration INT NOT NULL DEFAULT 30,
  preferred_location TEXT NOT NULL CHECK (preferred_location IN ('gym','home','outdoor')),
  equipment TEXT[] NOT NULL DEFAULT '{}',
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light','dark')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY profiles_delete_own ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---------- 2. check_ins ----------
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  available_min INT NOT NULL CHECK (available_min > 0),
  energy TEXT NOT NULL CHECK (energy IN ('low','medium','high')),
  sleep TEXT NOT NULL CHECK (sleep IN ('lt5','5to7','7plus')),
  location TEXT NOT NULL CHECK (location IN ('gym','home','outdoor')),
  equipment TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX check_ins_user_idx ON public.check_ins (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.check_ins TO authenticated;
GRANT ALL ON public.check_ins TO service_role;

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY check_ins_select_own ON public.check_ins
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY check_ins_insert_own ON public.check_ins
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY check_ins_update_own ON public.check_ins
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY check_ins_delete_own ON public.check_ins
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---------- 3. workouts (generated daily plans) ----------
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  duration_min INT NOT NULL CHECK (duration_min > 0),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy','Moderate','Challenging')),
  muscles TEXT[] NOT NULL DEFAULT '{}',
  exercises JSONB NOT NULL DEFAULT '[]',
  reasons TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX workouts_user_idx ON public.workouts (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workouts TO authenticated;
GRANT ALL ON public.workouts TO service_role;

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY workouts_select_own ON public.workouts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY workouts_insert_own ON public.workouts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY workouts_update_own ON public.workouts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY workouts_delete_own ON public.workouts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---------- 4. workout_sessions (live logging) ----------
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  logs JSONB NOT NULL DEFAULT '[]',
  notes TEXT
);

CREATE INDEX workout_sessions_user_idx ON public.workout_sessions (user_id, started_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_sessions TO authenticated;
GRANT ALL ON public.workout_sessions TO service_role;

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY sessions_select_own ON public.workout_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY sessions_insert_own ON public.workout_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY sessions_update_own ON public.workout_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY sessions_delete_own ON public.workout_sessions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);