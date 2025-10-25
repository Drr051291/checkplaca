-- Add user_id to payments table for proper access control
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- For existing vehicle_reports without user_id, we'll keep them accessible to all for now
-- Future reports will require authentication

-- Drop overly permissive policies on payments table
DROP POLICY IF EXISTS "Anyone can view payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can create payments" ON public.payments;
DROP POLICY IF EXISTS "System can update payments" ON public.payments;

-- Create secure policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create payments" ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can update payments" ON public.payments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Drop overly permissive policies on vehicle_reports table
DROP POLICY IF EXISTS "Anyone can view reports" ON public.vehicle_reports;
DROP POLICY IF EXISTS "Anyone can create reports" ON public.vehicle_reports;

-- Create secure policies for vehicle_reports
-- Allow viewing own reports OR reports without user_id (legacy)
CREATE POLICY "Users can view own reports" ON public.vehicle_reports
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all reports" ON public.vehicle_reports
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create reports" ON public.vehicle_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);