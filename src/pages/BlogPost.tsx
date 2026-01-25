import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Eye, ArrowLeft, Tag, Home } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  AuthorBox,
  TableOfContents,
  BlogCTABanner,
  SocialShare,
  RelatedPosts,
  BlogSidebar,
} from "@/components/blog";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  published_at: string;
  views: number;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  category: {
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    name: string;
    slug: string;
  }>;
}

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    
    const { data: postData } = await supabase
      .from("blog_posts")
      .select(`
        *,
        category:blog_categories(name, slug)
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (postData) {
      // Increment views
      await supabase
        .from("blog_posts")
        .update({ views: (postData.views || 0) + 1 })
        .eq("id", postData.id);

      // Fetch tags
      const { data: tagsData } = await supabase
        .from("post_tags")
        .select("tag:blog_tags(name, slug)")
        .eq("post_id", postData.id);

      setPost({
        ...postData,
        tags: tagsData?.map((t: any) => t.tag) || []
      } as Post);

      // Fetch related posts
      if (postData.category_id) {
        const { data: related } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, featured_image, published_at")
          .eq("category_id", postData.category_id)
          .eq("status", "published")
          .neq("id", postData.id)
          .limit(4);
        
        if (related) setRelatedPosts(related);
      }
    }
    
    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
        <Button onClick={() => navigate("/blog")}>Voltar ao Blog</Button>
      </div>
    );
  }

  const articleUrl = `https://checkplaca.lovable.app/blog/${post.slug}`;
  
  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Blog", href: "/blog" },
    ...(post.category ? [{ label: post.category.name, href: `/blog?categoria=${post.category.slug}` }] : []),
    { label: post.title }
  ];

  // Schema.org structured data for article
  const schemaOrgArticle = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featured_image || "https://checkplaca.lovable.app/og-image.png",
    "datePublished": post.published_at,
    "dateModified": post.published_at,
    "author": {
      "@type": "Organization",
      "name": "Checkplaca",
      "url": "https://checkplaca.lovable.app"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Checkplaca",
      "logo": {
        "@type": "ImageObject",
        "url": "https://checkplaca.lovable.app/favicon.ico"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "articleSection": post.category?.name,
    "keywords": post.tags.map(t => t.name).join(", "),
    "wordCount": post.content.split(/\s+/).length,
    "inLanguage": "pt-BR",
    "isAccessibleForFree": true
  };

  const articleKeywords = [
    post.category?.name,
    ...post.tags.map(t => t.name),
    "consulta veicular",
    "checkplaca"
  ].filter(Boolean).join(", ");

  return (
    <>
      <Helmet>
        <title>{post.meta_title || `${post.title} - Blog Checkplaca`}</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <meta name="keywords" content={articleKeywords} />
        <link rel="canonical" href={post.canonical_url || articleUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:site_name" content="Checkplaca" />
        <meta property="og:locale" content="pt_BR" />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
        {post.featured_image && <meta property="og:image:alt" content={post.title} />}
        {post.featured_image && <meta property="og:image:width" content="1200" />}
        {post.featured_image && <meta property="og:image:height" content="630" />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.meta_title || post.title} />
        <meta name="twitter:description" content={post.meta_description || post.excerpt} />
        {post.featured_image && <meta name="twitter:image" content={post.featured_image} />}
        {post.featured_image && <meta name="twitter:image:alt" content={post.title} />}
        
        {/* Article Meta */}
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:modified_time" content={post.published_at} />
        {post.category && <meta property="article:section" content={post.category.name} />}
        <meta property="article:author" content="Checkplaca" />
        {post.tags.map((tag) => (
          <meta key={tag.slug} property="article:tag" content={tag.name} />
        ))}
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaOrgArticle)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Checkplaca
              </h1>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/blog")}>
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Blog</span>
              </Button>
              <Button size="sm" onClick={() => navigate("/")}>
                <Home className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Consultar Placa</span>
              </Button>
            </nav>
          </div>
        </header>

        {/* Hero Image */}
        {post.featured_image && (
          <div className="relative w-full h-[200px] sm:h-[300px] lg:h-[400px] overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            
            {/* Category Badge on Image */}
            {post.category && (
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                <Badge className="bg-primary text-primary-foreground shadow-lg">
                  {post.category.name}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <main className="container py-6 sm:py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
            {/* Main Column */}
            <article className="min-w-0">
              {/* Title & Meta */}
              <header className="mb-8">
                {!post.featured_image && post.category && (
                  <Badge variant="secondary" className="mb-4">
                    {post.category.name}
                  </Badge>
                )}
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  {post.title}
                </h1>
                
                <p className="text-lg sm:text-xl text-muted-foreground mb-6">
                  {post.excerpt}
                </p>

                {/* Meta Info Row */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{estimateReadingTime(post.content)} min de leitura</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.views} visualizações</span>
                  </div>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {post.tags.map((tag) => (
                      <Badge key={tag.slug} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Social Share */}
                <SocialShare 
                  url={articleUrl}
                  title={post.title}
                  description={post.excerpt}
                  className="mt-4"
                />
              </header>

              <Separator className="mb-8" />

              {/* Table of Contents (Mobile) */}
              <div className="lg:hidden mb-8">
                <TableOfContents content={post.content} />
              </div>

              {/* Article Content */}
              <div 
                className="prose prose-lg dark:prose-invert max-w-none mb-8
                  prose-headings:scroll-mt-24
                  prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-lg prose-img:shadow-md
                  prose-ul:my-4 prose-li:text-muted-foreground
                  prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                "
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Inline CTA Banner */}
              <BlogCTABanner variant="inline" />

              <Separator className="my-8" />

              {/* Author Box */}
              <AuthorBox className="mb-8" />

              {/* Final CTA */}
              <BlogCTABanner variant="footer" className="mb-8" />

              {/* Social Share (Bottom) */}
              <div className="flex items-center justify-center py-6 border-t border-b">
                <SocialShare 
                  url={articleUrl}
                  title={post.title}
                  description={post.excerpt}
                />
              </div>

              {/* Related Posts (Mobile) */}
              <div className="lg:hidden mt-8">
                <RelatedPosts posts={relatedPosts} variant="grid" />
              </div>
            </article>

            {/* Sidebar (Desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Table of Contents */}
                <TableOfContents content={post.content} />
                
                {/* Sidebar CTA & Related */}
                <BlogSidebar relatedPosts={relatedPosts} />
              </div>
            </div>
          </div>

          {/* Related Posts Grid (Desktop - Full Width) */}
          <div className="hidden lg:block mt-16">
            <RelatedPosts posts={relatedPosts} variant="grid" />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-muted/50 py-8 mt-12">
          <div className="container">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link to="/" className="text-lg font-bold text-primary">
                Checkplaca
              </Link>
              <p className="text-sm text-muted-foreground text-center">
                © 2025 Checkplaca. Todos os direitos reservados.
              </p>
              <nav className="flex items-center gap-4 text-sm">
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Consultar Placa
                </Link>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default BlogPost;
