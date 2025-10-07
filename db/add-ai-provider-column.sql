-- Migration: add ai_provider column to prompts table
-- Run in Supabase SQL editor or via psql against your database

ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS ai_provider text NOT NULL DEFAULT 'OpenAI';

-- Optionally add a check constraint to restrict values
ALTER TABLE public.prompts
  ADD CONSTRAINT prompts_ai_provider_check
  CHECK (ai_provider IN ('xAI','OpenAI','Gemini','Other'));

-- If you want to backfill existing rows differently, run an UPDATE before the constraint
-- UPDATE public.prompts SET ai_provider = 'OpenAI' WHERE ai_provider IS NULL;
