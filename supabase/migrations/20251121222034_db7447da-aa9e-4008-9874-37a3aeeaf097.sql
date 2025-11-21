-- Create customers table to store customer data from checkout
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.vehicle_reports(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT NOT NULL,
  plate TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for customer data access
CREATE POLICY "Admins can view all customers"
ON public.customers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage customers"
ON public.customers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert customer data from edge functions
CREATE POLICY "Service role can insert customers"
ON public.customers
FOR INSERT
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_cpf ON public.customers(cpf);
CREATE INDEX idx_customers_created_at ON public.customers(created_at DESC);
CREATE INDEX idx_customers_payment_id ON public.customers(payment_id);