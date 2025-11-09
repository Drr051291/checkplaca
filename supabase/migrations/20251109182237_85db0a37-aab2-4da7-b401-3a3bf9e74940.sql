-- Create blog_post_versions table to store post history
CREATE TABLE public.blog_post_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  change_summary TEXT,
  UNIQUE(post_id, version_number)
);

-- Create index for faster queries
CREATE INDEX idx_blog_post_versions_post_id ON public.blog_post_versions(post_id);
CREATE INDEX idx_blog_post_versions_created_at ON public.blog_post_versions(created_at);

-- Enable RLS
ALTER TABLE public.blog_post_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all versions"
  ON public.blog_post_versions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create versions"
  ON public.blog_post_versions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Function to automatically create version on post update
CREATE OR REPLACE FUNCTION public.create_post_version()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to save version before update
CREATE TRIGGER save_post_version_before_update
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_post_version();