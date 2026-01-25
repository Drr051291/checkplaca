import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  published_at: string;
  category: {
    name: string;
    slug: string;
  } | null;
}

export const LatestBlogPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const fetchLatestPosts = async () => {
    try {
      const { data } = await supabase
        .from("blog_posts")
        .select(`
          id,
          title,
          slug,
          excerpt,
          featured_image,
          published_at,
          category:blog_categories(name, slug)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);

      if (data) {
        setPosts(data as any);
      }
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  if (loading || posts.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Últimas do Blog
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Dicas, comparativos e guias completos sobre consulta veicular e compra de carros
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {posts.map((post, index) => (
            <Card 
              key={post.id}
              className={`
                group cursor-pointer overflow-hidden border-border/50 bg-card
                transition-all duration-300 ease-out
                hover:shadow-xl hover:-translate-y-2 hover:border-primary/20
                animate-fade-in
              `}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(`/blog/${post.slug}`)}
            >
              {post.featured_image && (
                <div className="aspect-video overflow-hidden bg-muted relative">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
              <CardHeader className="pb-3">
                {post.category && (
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full transition-all duration-200 group-hover:bg-primary/20 group-hover:shadow-sm">
                      {post.category.name}
                    </span>
                  </div>
                )}
                <CardTitle className="text-lg sm:text-xl leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.excerpt && (
                  <CardDescription className="text-sm line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Ler mais</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/blog")}
            className="group hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
          >
            Ver todos os artigos
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
};
