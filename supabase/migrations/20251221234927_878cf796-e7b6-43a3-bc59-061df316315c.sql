-- Create plate_queries table for storing basic lookup results
CREATE TABLE IF NOT EXISTS public.plate_queries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  placa text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  preview jsonb, -- { marca, modelo, ano, cor }
  basic_raw jsonb, -- full response from consultarPlaca (server-only)
  basic_cost_cents integer DEFAULT 37,
  status text DEFAULT 'preview_ready' CHECK (status IN ('preview_ready', 'paid_pending', 'paid_confirmed', 'enriched')),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

-- Create orders table for payment tracking
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  plate_query_id uuid REFERENCES public.plate_queries(id) NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'expired', 'failed')),
  pix_txid text,
  asaas_payment_id text,
  asaas_customer_id text,
  amount_cents integer NOT NULL, -- what user pays
  provider_total_cost_cents integer DEFAULT 37, -- start with basic cost
  paid_at timestamptz,
  public_access_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')
);

-- Create enrichments table for FIPE and RENAINF data
CREATE TABLE IF NOT EXISTS public.enrichments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plate_query_id uuid REFERENCES public.plate_queries(id) UNIQUE NOT NULL,
  fipe_raw jsonb,
  renainf_raw jsonb,
  fipe_cost_cents integer DEFAULT 450,
  renainf_cost_cents integer DEFAULT 99,
  enriched_at timestamptz
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plate_queries_placa ON public.plate_queries(placa);
CREATE INDEX IF NOT EXISTS idx_plate_queries_status ON public.plate_queries(status);
CREATE INDEX IF NOT EXISTS idx_orders_plate_query_id ON public.orders(plate_query_id);
CREATE INDEX IF NOT EXISTS idx_orders_public_access_token ON public.orders(public_access_token);
CREATE INDEX IF NOT EXISTS idx_orders_asaas_payment_id ON public.orders(asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_enrichments_plate_query_id ON public.enrichments(plate_query_id);

-- Enable RLS on all tables
ALTER TABLE public.plate_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichments ENABLE ROW LEVEL SECURITY;

-- RLS policies for plate_queries (service role only access, read via edge functions)
CREATE POLICY "Service role can manage plate_queries" 
ON public.plate_queries 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS policies for orders (service role and public_access_token based read)
CREATE POLICY "Service role can manage orders" 
ON public.orders 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS policies for enrichments (service role only)
CREATE POLICY "Service role can manage enrichments" 
ON public.enrichments 
FOR ALL 
USING (true)
WITH CHECK (true);