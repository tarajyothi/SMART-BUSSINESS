-- Analytics events table
CREATE TABLE public.product_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'order')),
  revenue NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;

-- Product owners can view their own product events
CREATE POLICY "Owners can view their product events"
  ON public.product_events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.products WHERE products.id = product_events.product_id AND products.user_id = auth.uid())
  );

-- Anyone can insert view/click events (public tracking)
CREATE POLICY "Anyone can insert events"
  ON public.product_events FOR INSERT
  WITH CHECK (event_type IN ('view', 'click', 'order'));

CREATE INDEX idx_product_events_product ON public.product_events (product_id);
CREATE INDEX idx_product_events_type ON public.product_events (event_type);
CREATE INDEX idx_product_events_created ON public.product_events (created_at);