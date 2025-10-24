-- Atualizar constraint para remover BOLETO
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;

ALTER TABLE public.payments 
ADD CONSTRAINT payments_payment_method_check 
CHECK (payment_method IN ('PIX', 'CREDIT_CARD'));