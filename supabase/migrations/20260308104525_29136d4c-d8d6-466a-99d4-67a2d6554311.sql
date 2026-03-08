-- Add description and slug to products
ALTER TABLE public.products ADD COLUMN description TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN slug TEXT UNIQUE;

-- Create index on slug for fast lookups
CREATE INDEX idx_products_slug ON public.products (slug);

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION public.generate_product_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(regexp_replace(trim(NEW.name), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  new_slug := base_slug;
  
  LOOP
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.products WHERE slug = new_slug AND id != NEW.id);
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := new_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_product_slug
  BEFORE INSERT OR UPDATE OF name ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.generate_product_slug();