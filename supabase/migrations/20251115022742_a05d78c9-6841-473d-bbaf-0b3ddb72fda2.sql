-- Fix security issue: add search_path to the function
CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If status is being changed to 'published' and published_at is NULL, set it to now
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;