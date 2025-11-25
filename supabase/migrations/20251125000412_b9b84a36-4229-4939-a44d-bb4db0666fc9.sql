-- Adiciona campos de rastreamento de origem na tabela customers
ALTER TABLE public.customers
ADD COLUMN utm_source TEXT,
ADD COLUMN utm_medium TEXT,
ADD COLUMN utm_campaign TEXT,
ADD COLUMN utm_term TEXT,
ADD COLUMN utm_content TEXT,
ADD COLUMN referrer TEXT,
ADD COLUMN landing_page TEXT;