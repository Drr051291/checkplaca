-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL,
  asaas_payment_id TEXT NOT NULL,
  asaas_customer_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('completo', 'premium')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'canceled', 'refunded')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('PIX', 'BOLETO', 'CREDIT_CARD')),
  payment_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Anyone can view payments (needed for status checking)
CREATE POLICY "Anyone can view payments"
ON public.payments
FOR SELECT
USING (true);

-- Anyone can create payments
CREATE POLICY "Anyone can create payments"
ON public.payments
FOR INSERT
WITH CHECK (true);

-- Only system can update payments (via edge functions)
CREATE POLICY "System can update payments"
ON public.payments
FOR UPDATE
USING (true);

-- Add index for faster lookups
CREATE INDEX idx_payments_asaas_id ON public.payments(asaas_payment_id);
CREATE INDEX idx_payments_report_id ON public.payments(report_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Trigger for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();