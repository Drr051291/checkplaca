import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Eye, ArrowLeft, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";

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
          .limit(3);
        
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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                CheckPlaca
              </h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/blog")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Blog
              </Button>
              <Button onClick={() => navigate("/")}>
                Consultar Placa
              </Button>
            </nav>
          </div>
        </header>

        {/* Article */}
        <article className="py-8 px-4">
          <div className="container max-w-4xl">
            {/* Featured Image */}
            {post.featured_image && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-auto max-h-[500px] object-cover"
                />
              </div>
            )}

            {/* Meta Info */}
            <div className="mb-6">
              {post.category && (
                <Badge variant="secondary" className="mb-4">
                  {post.category.name}
                </Badge>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {post.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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

              {post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {post.tags.map((tag) => (
                    <Badge key={tag.slug} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator className="mb-8" />

            {/* Content */}
            <div 
              className="prose prose-lg dark:prose-invert max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <Separator className="mb-8" />

            {/* CTA */}
            <Card className="p-8 text-center bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <h3 className="text-2xl font-bold mb-4">
                Consulte seu Veículo Agora
              </h3>
              <p className="text-muted-foreground mb-6">
                Descubra tudo sobre qualquer veículo em segundos
              </p>
              <Button size="lg" onClick={() => navigate("/")}>
                Fazer Consulta Grátis
              </Button>
            </Card>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Artigos Relacionados</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((related) => (
                    <Card
                      key={related.id}
                      className="cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => navigate(`/blog/${related.slug}`)}
                    >
                      {related.featured_image && (
                        <div className="h-32 overflow-hidden">
                          <img
                            src={related.featured_image}
                            alt={related.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {related.excerpt}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Footer */}
        <footer className="border-t bg-muted/50 py-8 mt-12">
          <div className="container text-center text-sm text-muted-foreground">
            <p>© 2025 CheckPlaca. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default BlogPost;
