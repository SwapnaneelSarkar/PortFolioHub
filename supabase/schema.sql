-- PM PortfolioHub Supabase Database Schema
-- Run this script in the Supabase SQL Editor to configure your MVP backend tables and Row Level Security policies.

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  headline TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  location TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  links JSONB[] DEFAULT '{}',
  contact_email TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create case_studies table
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT DEFAULT '',
  role TEXT DEFAULT '',
  company TEXT DEFAULT '',
  timeframe TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- Enable RLS for case_studies
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

-- Create case_study_blocks table (Guided Story Blocks)
CREATE TABLE IF NOT EXISTS public.case_study_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID NOT NULL REFERENCES public.case_studies(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- problem, context, role, research, strategy, execution, metrics, learnings, custom
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for case_study_blocks
ALTER TABLE public.case_study_blocks ENABLE ROW LEVEL SECURITY;

-- Create attachments table (PDF, DOC/DOCX, PPT/PPTX supported files)
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID NOT NULL REFERENCES public.case_studies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for attachments
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR PROFILES
CREATE POLICY profiles_public_select ON public.profiles 
  FOR SELECT USING (published = true OR auth.uid() = id);

CREATE POLICY profiles_owner_insert ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_owner_update ON public.profiles 
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_owner_delete ON public.profiles 
  FOR DELETE USING (auth.uid() = id);


-- RLS POLICIES FOR CASE STUDIES
CREATE POLICY case_studies_public_select ON public.case_studies 
  FOR SELECT USING (
    published = true AND EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = case_studies.user_id AND p.published = true
    ) OR auth.uid() = user_id
  );

CREATE POLICY case_studies_owner_all ON public.case_studies 
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- RLS POLICIES FOR STORY BLOCKS
CREATE POLICY blocks_public_select ON public.case_study_blocks 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.case_studies cs
      JOIN public.profiles p ON p.id = cs.user_id
      WHERE cs.id = case_study_blocks.case_study_id AND cs.published = true AND p.published = true
    ) OR EXISTS (
      SELECT 1 FROM public.case_studies cs
      WHERE cs.id = case_study_blocks.case_study_id AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY blocks_owner_all ON public.case_study_blocks 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.case_studies cs
      WHERE cs.id = case_study_blocks.case_study_id AND cs.user_id = auth.uid()
    )
  );


-- RLS POLICIES FOR ATTACHMENTS
CREATE POLICY attachments_public_select ON public.attachments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.case_studies cs
      JOIN public.profiles p ON p.id = cs.user_id
      WHERE cs.id = attachments.case_study_id AND cs.published = true AND p.published = true
    ) OR EXISTS (
      SELECT 1 FROM public.case_studies cs
      WHERE cs.id = attachments.case_study_id AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY attachments_owner_all ON public.attachments 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.case_studies cs
      WHERE cs.id = attachments.case_study_id AND cs.user_id = auth.uid()
    )
  );


-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username TEXT;
  clean_username TEXT;
  uname_suffix INTEGER := 0;
  final_username TEXT;
BEGIN
  -- Extract email prefix for clean default username
  base_username := split_part(new.email, '@', 1);
  -- Clean special characters
  clean_username := regexp_replace(lower(base_username), '[^a-z0-9]', '', 'g');
  -- Ensure username is not empty
  IF clean_username = '' THEN
    clean_username := 'pmuser';
  END IF;
  
  final_username := clean_username;
  
  -- Prevent collision loops
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    uname_suffix := uname_suffix + 1;
    final_username := clean_username || uname_suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name, contact_email, published, skills, links)
  VALUES (
    new.id,
    final_username,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email,
    false,
    ARRAY[]::TEXT[],
    ARRAY[]::JSONB[]
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- UPDATE UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trigger_case_studies_updated_at
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trigger_case_study_blocks_updated_at
  BEFORE UPDATE ON public.case_study_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- INSTRUCTIONS FOR ATTACHMENT BUCKET:
-- In Supabase Storage, create a public bucket named "portfolio-attachments".
-- Enable public access so file URLs can be resolved.
-- Add storage policy to allow authenticated users to upload and delete files under the "portfolio-attachments" bucket if they are authenticated:
--   INSERT Policy: auth.role() = 'authenticated'
--   DELETE Policy: auth.role() = 'authenticated'
