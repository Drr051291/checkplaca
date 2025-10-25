-- Habilitar realtime na tabela payments para atualização automática
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;