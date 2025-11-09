-- Fix function search path for security (drop cascade)
DROP FUNCTION IF EXISTS public.create_post_version() CASCADE;

CREATE OR REPLACE FUNCTION public.create_post_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM public.blog_post_versions
  WHERE post_id = NEW.id;

  -- Insert new version with OLD data (before update)
  INSERT INTO public.blog_post_versions (
    post_id,
    version_number,
    title,
    slug,
    excerpt,
    content,
    featured_image,
    category_id,
    status,
    meta_title,
    meta_description,
    canonical_url,
    created_by
  ) VALUES (
    OLD.id,
    next_version,
    OLD.title,
    OLD.slug,
    OLD.excerpt,
    OLD.content,
    OLD.featured_image,
    OLD.category_id,
    OLD.status,
    OLD.meta_title,
    OLD.meta_description,
    OLD.canonical_url,
    auth.uid()
  );

  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER save_post_version_before_update
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_post_version();