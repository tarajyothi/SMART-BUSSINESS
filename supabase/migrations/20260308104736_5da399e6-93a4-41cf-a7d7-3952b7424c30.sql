ALTER TABLE public.products ADD COLUMN instagram_caption TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN hashtags TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN ai_generated BOOLEAN DEFAULT false;