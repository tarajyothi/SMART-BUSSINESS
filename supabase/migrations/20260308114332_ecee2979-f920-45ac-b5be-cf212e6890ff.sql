
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS store_name text DEFAULT '',
ADD COLUMN IF NOT EXISTS product_category text DEFAULT '',
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
