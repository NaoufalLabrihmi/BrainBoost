-- ENUM TYPES
CREATE TYPE quiz_status AS ENUM ('archived', 'draft', 'published');
CREATE TYPE user_role AS ENUM ('admin', 'student', 'teacher');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'short_answer', 'true_false');
CREATE TYPE purchase_status AS ENUM ('cancelled', 'completed', 'pending');

-- TABLES
CREATE TABLE forum_categories (
  id uuid DEFAULT gen_random_uuid(),
  name text,
  CONSTRAINT forum_categories_pkey PRIMARY KEY (id),
  CONSTRAINT forum_categories_name_key UNIQUE (name)
);

CREATE TABLE forum_comments (
  id uuid DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT forum_comments_pkey PRIMARY KEY (id)
);

CREATE TABLE forum_likes (
  id uuid DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT forum_likes_pkey PRIMARY KEY (id),
  CONSTRAINT forum_likes_post_id_user_id_key UNIQUE (post_id, user_id)
);

CREATE TABLE forum_posts (
  id uuid DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  title text,
  content text,
  solved boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  category_id uuid NOT NULL,
  CONSTRAINT forum_posts_pkey PRIMARY KEY (id)
);

CREATE TABLE participant_answers (
  id uuid DEFAULT gen_random_uuid(),
  session_id uuid,
  question_id uuid,
  participant_id uuid,
  answer text,
  is_correct boolean,
  response_time integer,
  points_earned integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT participant_answers_pkey PRIMARY KEY (id)
);

CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid(),
  name text,
  description text NOT NULL,
  points_required integer,
  image_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

CREATE TABLE profiles (
  id uuid,
  username text,
  role user_role DEFAULT 'student',
  points integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  email text NOT NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_username_key UNIQUE (username)
);

CREATE TABLE purchases (
  id uuid DEFAULT gen_random_uuid(),
  user_id uuid,
  product_id uuid,
  points_spent integer,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  status purchase_status DEFAULT 'pending',
  CONSTRAINT purchases_pkey PRIMARY KEY (id)
);

CREATE TABLE questions (
  id uuid DEFAULT gen_random_uuid(),
  quiz_id uuid,
  question_text text,
  question_type question_type,
  correct_answer text,
  options jsonb NOT NULL,
  points integer NOT NULL DEFAULT 5,
  time_limit integer DEFAULT 30,
  point_multiplier integer DEFAULT 1,
  order_number integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT questions_pkey PRIMARY KEY (id)
);

CREATE TABLE quiz_participants (
  id uuid DEFAULT gen_random_uuid(),
  quiz_id uuid,
  student_id uuid,
  user_id uuid,
  status text DEFAULT 'joined',
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  score integer NOT NULL DEFAULT 0,
  started_at timestamp with time zone NOT NULL,
  current_question_index integer NOT NULL DEFAULT 0,
  completed_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  session_id uuid NOT NULL,
  total_points integer DEFAULT 0,
  CONSTRAINT quiz_participants_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_participants_quiz_id_student_id_key UNIQUE (quiz_id, student_id),
  CONSTRAINT quiz_participants_session_id_user_id_key UNIQUE (session_id, user_id)
);

CREATE TABLE quiz_sessions (
  id uuid DEFAULT gen_random_uuid(),
  quiz_id uuid,
  started_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  ended_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_by uuid DEFAULT auth.uid(),
  current_question_index integer DEFAULT 0,
  time_remaining integer DEFAULT 0,
  CONSTRAINT quiz_sessions_pkey PRIMARY KEY (id)
);

CREATE TABLE quiz_state (
  id uuid DEFAULT uuid_generate_v4(),
  quiz_id uuid,
  current_question_index integer DEFAULT 0,
  time_remaining integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  skipped_questions integer[] NOT NULL DEFAULT '{}',
  CONSTRAINT quiz_state_pkey PRIMARY KEY (id)
);

CREATE TABLE quizzes (
  id uuid DEFAULT gen_random_uuid(),
  title text,
  description text NOT NULL,
  access_code text NOT NULL DEFAULT upper(SUBSTRING(md5((random())::text) FROM 1 FOR 6)),
  status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  question_count integer NOT NULL DEFAULT 0,
  profile_id uuid NOT NULL,
  CONSTRAINT quizzes_pkey PRIMARY KEY (id),
  CONSTRAINT quizzes_access_code_key UNIQUE (access_code)
);

CREATE TABLE session_participants (
  id uuid DEFAULT gen_random_uuid(),
  session_id uuid,
  user_id uuid,
  score integer NOT NULL DEFAULT 0,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  status text NOT NULL DEFAULT 'joined',
  CONSTRAINT session_participants_pkey PRIMARY KEY (id)
);

-- CONSTRAINTS (Foreign Keys)
ALTER TABLE purchases ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE quizzes ADD CONSTRAINT quizzes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE questions ADD CONSTRAINT questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;
ALTER TABLE quiz_sessions ADD CONSTRAINT quiz_sessions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;
ALTER TABLE session_participants ADD CONSTRAINT session_participants_session_id_fkey FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE CASCADE;
ALTER TABLE session_participants ADD CONSTRAINT session_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE participant_answers ADD CONSTRAINT participant_answers_session_id_fkey FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE CASCADE;
ALTER TABLE participant_answers ADD CONSTRAINT participant_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;
ALTER TABLE quiz_participants ADD CONSTRAINT quiz_participants_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;
ALTER TABLE quiz_participants ADD CONSTRAINT quiz_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE quiz_state ADD CONSTRAINT quiz_state_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;
ALTER TABLE forum_comments ADD CONSTRAINT forum_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE;
ALTER TABLE forum_likes ADD CONSTRAINT forum_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE;
ALTER TABLE forum_likes ADD CONSTRAINT forum_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE forum_comments ADD CONSTRAINT forum_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE quiz_participants ADD CONSTRAINT quiz_participants_student_id_fkey FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE forum_posts ADD CONSTRAINT forum_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE quizzes ADD CONSTRAINT quizzes_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE forum_posts ADD CONSTRAINT forum_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES forum_categories(id);
ALTER TABLE purchases ADD CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE purchases ADD CONSTRAINT purchases_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE quiz_sessions ADD CONSTRAINT quiz_sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE quiz_participants ADD CONSTRAINT quiz_participants_session_id_fkey FOREIGN KEY (session_id) REFERENCES quiz_sessions(id);
ALTER TABLE participant_answers ADD CONSTRAINT participant_answers_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES auth.users(id);

-- VIEWS
CREATE VIEW profiles_with_email AS  SELECT p.id, p.username, p.role, u.email FROM (profiles p JOIN auth.users u ON ((p.id = u.id)));
CREATE VIEW quizzes_with_creator AS  SELECT q.id, q.title, q.description, q.access_code, lower(q.access_code) AS access_code_lower, q.status, q.created_by, q.created_at, q.updated_at, q.question_count, p.id AS profile_id, p.username AS creator_username, p.role AS creator_role FROM (quizzes q LEFT JOIN profiles p ON ((q.created_by = p.id)));
CREATE VIEW quiz_with_questions AS  SELECT q.id, q.title, q.description, q.access_code, q.status, q.created_by, q.created_at, q.updated_at, q.question_count, q.profile_id, json_agg(que.*) AS questions FROM (quizzes q LEFT JOIN questions que ON ((que.quiz_id = q.id))) GROUP BY q.id;
