-- ===============================
-- Brain Boost Database Full Schema (for Local Postgres)
-- Includes: Extensions, Types, Minimal Auth, Functions, Tables, Triggers, RLS
-- ===============================

-- === Extensions ===
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- === Custom Types ===
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer');
CREATE TYPE purchase_status AS ENUM ('pending', 'completed', 'cancelled');

-- === Minimal Auth Schema (for local use) ===
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE
);

-- === Functions/Procedures ===
-- Check if a column exists in a table
CREATE OR REPLACE FUNCTION public.check_column_exists(
  table_name text,
  column_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = check_column_exists.table_name
    AND column_name = check_column_exists.column_name
  ) INTO column_exists;
  RETURN column_exists;
END;
$$;

-- Submit answer and update points
CREATE OR REPLACE FUNCTION public.submit_answer(
  p_session_id uuid,
  p_question_id uuid,
  p_participant_id uuid,
  p_answer text,
  p_is_correct boolean,
  p_points_earned integer,
  p_response_time integer
) 
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points integer;
  profile_points integer;
  new_total_points integer;
  new_profile_points integer;
  result json;
BEGIN
  -- Begin transaction
  BEGIN
    -- Insert answer record
    INSERT INTO public.participant_answers(
      session_id,
      question_id,
      participant_id,
      answer,
      is_correct,
      points_earned,
      response_time
    ) VALUES (
      p_session_id,
      p_question_id,
      p_participant_id,
      p_answer,
      p_is_correct,
      p_points_earned,
      p_response_time
    );
    -- Only update points if answer is correct
    IF p_is_correct THEN
      -- Get current points from quiz_participants
      SELECT total_points INTO current_points
      FROM public.quiz_participants
      WHERE session_id = p_session_id AND user_id = p_participant_id;
      -- Calculate new total
      new_total_points := COALESCE(current_points, 0) + p_points_earned;
      -- Update quiz_participants points
      UPDATE public.quiz_participants
      SET total_points = new_total_points
      WHERE session_id = p_session_id AND user_id = p_participant_id;
      -- Also update profile points for shop integration
      SELECT points INTO profile_points
      FROM public.profiles
      WHERE id = p_participant_id;
      -- Calculate new profile total
      new_profile_points := COALESCE(profile_points, 0) + p_points_earned;
      -- Update profile points
      UPDATE public.profiles
      SET points = new_profile_points
      WHERE id = p_participant_id;
    END IF;
    -- Prepare result
    result := json_build_object(
      'success', true,
      'participant_id', p_participant_id,
      'points_earned', p_points_earned,
      'new_total_points', new_total_points,
      'new_profile_points', new_profile_points
    );
    -- Commit transaction
    RETURN result;
  EXCEPTION
    WHEN OTHERS THEN
      -- Handle error and rollback transaction
      RAISE;
  END;
END;
$$;

-- ===============================
-- Brain Boost Database Table Definitions (MCP Export, with Foreign Keys, Triggers, RLS Policies)
-- ===============================

-- Table: forum_categories
CREATE TABLE forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- Table: quiz_state
CREATE TABLE quiz_state (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id),
  current_question_index integer NOT NULL DEFAULT 0,
  time_remaining integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  skipped_questions integer[]
);

-- Table: profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE CHECK (char_length(username) >= 3),
  role user_role NOT NULL DEFAULT 'student',
  points integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  email text
  -- Foreign keys:
  -- id REFERENCES auth.users(id)
);

-- Table: session_participants
CREATE TABLE session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES quiz_sessions(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  score integer DEFAULT 0,
  joined_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  status text DEFAULT 'joined' CHECK (status = ANY (ARRAY['joined', 'active', 'completed']))
);

-- Table: quizzes
CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  access_code text UNIQUE,
  status text DEFAULT 'draft' CHECK (status = ANY (ARRAY['draft', 'scheduled', 'published', 'active', 'completed', 'archived'])),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  question_count integer DEFAULT 0,
  profile_id uuid REFERENCES profiles(id)
);

-- Table: forum_posts
CREATE TABLE forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  content text NOT NULL,
  solved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  category_id uuid REFERENCES forum_categories(id)
);

-- Table: questions
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id),
  question_text text NOT NULL,
  question_type question_type NOT NULL,
  correct_answer text NOT NULL,
  options jsonb,
  points integer DEFAULT 5 CHECK (points >= 1 AND points <= 10),
  time_limit integer NOT NULL DEFAULT 30 CHECK (time_limit >= 1 AND time_limit <= 120),
  point_multiplier integer NOT NULL DEFAULT 1 CHECK (point_multiplier = ANY (ARRAY[1, 2])),
  order_number integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table: products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  points_required integer NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Table: quiz_sessions
CREATE TABLE quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id),
  started_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  ended_at timestamp with time zone,
  status text DEFAULT 'waiting' CHECK (status = ANY (ARRAY['waiting', 'active', 'paused', 'question_ended', 'ended'])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by uuid NOT NULL DEFAULT auth.uid(),
  current_question_index integer NOT NULL DEFAULT 0,
  time_remaining integer NOT NULL DEFAULT 0
);

-- Table: purchases
CREATE TABLE purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  product_id uuid NOT NULL REFERENCES products(id),
  points_spent integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  status purchase_status NOT NULL DEFAULT 'pending'
);

-- Table: quiz_participants
CREATE TABLE quiz_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id),
  student_id uuid NOT NULL REFERENCES profiles(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'joined' CHECK (status = ANY (ARRAY['waiting', 'joined', 'started', 'active', 'completed'])),
  joined_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  score integer DEFAULT 0,
  started_at timestamp with time zone,
  current_question_index integer DEFAULT 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  session_id uuid REFERENCES quiz_sessions(id),
  total_points integer NOT NULL DEFAULT 0
);

-- Table: forum_likes
CREATE TABLE forum_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES forum_posts(id),
  user_id uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Table: participant_answers
CREATE TABLE participant_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES quiz_sessions(id),
  question_id uuid NOT NULL REFERENCES questions(id),
  participant_id uuid NOT NULL REFERENCES auth.users(id),
  answer text NOT NULL,
  is_correct boolean NOT NULL,
  response_time integer NOT NULL,
  points_earned integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table: forum_comments
CREATE TABLE forum_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES forum_posts(id),
  author_id uuid REFERENCES profiles(id),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- ===============================
-- Triggers
-- ===============================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quiz_sessions_updated_at
  BEFORE UPDATE ON quiz_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_participants_updated_at
  BEFORE UPDATE ON quiz_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_participant_answers_updated_at
  BEFORE UPDATE ON quiz_participant_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===============================
-- Row Level Security (RLS) Policies
-- ===============================

ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_participant_answers ENABLE ROW LEVEL SECURITY;

-- Quiz sessions policies
CREATE POLICY "Quiz sessions are viewable by creator and participants" ON quiz_sessions
  FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM quiz_participants 
      WHERE session_id = quiz_sessions.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Quiz sessions can be created by quiz creator" ON quiz_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE id = quiz_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Quiz sessions can be updated by creator" ON quiz_sessions
  FOR UPDATE USING (created_by = auth.uid());

-- Quiz participants policies
CREATE POLICY "Quiz participants are viewable by session creator and participants" ON quiz_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions 
      WHERE id = session_id AND created_by = auth.uid()
    ) OR 
    user_id = auth.uid()
  );

CREATE POLICY "Users can join as quiz participants" ON quiz_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Quiz participants can update their own points" ON quiz_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Quiz participant answers policies
CREATE POLICY "Quiz answers are viewable by session creator and answer owner" ON quiz_participant_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions 
      WHERE id = session_id AND created_by = auth.uid()
    ) OR 
    participant_id = auth.uid()
  );

CREATE POLICY "Users can submit their own answers" ON quiz_participant_answers
  FOR INSERT WITH CHECK (participant_id = auth.uid());

-- ===============================
-- Indexes (add custom indexes below as needed)
-- ===============================
-- Example:
-- CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
-- 