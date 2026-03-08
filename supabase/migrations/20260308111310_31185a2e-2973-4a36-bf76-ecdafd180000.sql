
-- Add auto_post_enabled setting to profiles
ALTER TABLE public.profiles ADD COLUMN auto_post_enabled boolean NOT NULL DEFAULT false;

-- Table to track social media posts per product per platform
CREATE TABLE public.social_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  platform text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  caption text,
  hashtags text,
  posted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own posts"
  ON public.social_posts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own posts"
  ON public.social_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.social_posts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
