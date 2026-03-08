
-- Allow authenticated users to read all orders (sellers need to filter by their products client-side)
CREATE POLICY "Authenticated users can view orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (true);
