import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Tag, ArrowRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  published_at: string;
  views: number;
  category: {
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    name: string;
    slug: string;
  }>;
}

const Blog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ name: string; slug: string }>>([]);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("blog_categories")
      .select("name, slug")
      .order("name");
    
    if (data) setCategories(data);
  };

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from("blog_posts")
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image,
        published_at,
        views,
        category:blog_categories(name, slug)
      `)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (selectedCategory) {
      const { data: categoryData } = await supabase
        .from("blog_categories")
        .select("id")
        .eq("slug", selectedCategory)
        .single();
      
      if (categoryData) {
        query = query.eq("category_id", categoryData.id);
      }
    }

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    const { data } = await query;
    
    if (data) {
      setPosts(data as any);
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

  // Schema.org structured data for blog listing
  const schemaOrgBlog = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Blog CheckPlaca",
    "description": "Dicas essenciais sobre consulta veicular, como verificar débitos de veículos, identificar carros com restrições e fazer compras seguras.",
    "url": "https://checkplaca.com.br/blog",
    "publisher": {
      "@type": "Organization",
      "name": "CheckPlaca",
      "logo": {
        "@type": "ImageObject",
        "url": "https://checkplaca.com.br/logo.png"
      }
    }
  };

  const pageTitle = selectedCategory 
    ? `${categories.find(c => c.slug === selectedCategory)?.name || ''} - Blog CheckPlaca`
    : "Blog CheckPlaca - Dicas sobre Consulta Veicular e Compra de Carros";
  
  const pageDescription = selectedCategory
    ? `Artigos sobre ${categories.find(c => c.slug === selectedCategory)?.name || ''} - Consulta veicular, débitos, restrições e compra segura de veículos.`
    : "Dicas essenciais sobre consulta veicular, como verificar débitos de veículos, identificar carros com restrições e fazer compras seguras.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="blog veicular, consulta de veículos, débitos veiculares, compra de carros usados, dicas automotivas, checkplaca" />
        <link rel="canonical" href={selectedCategory ? `https://checkplaca.com.br/blog?category=${selectedCategory}` : "https://checkplaca.com.br/blog"} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://checkplaca.com.br/blog" />
        <meta property="og:site_name" content="CheckPlaca" />
        <meta property="og:locale" content="pt_BR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:site" content="@checkplaca" />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaOrgBlog)}
        </script>
      </Helmet>

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
              <Button variant="ghost" onClick={() => navigate("/")}>
                Início
              </Button>
              <Button onClick={() => navigate("/")}>
                Consultar Placa
              </Button>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Blog CheckPlaca
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Tudo que você precisa saber sobre consulta veicular, débitos, restrições e compra segura de veículos
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-2xl mx-auto mb-12 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Pesquisar artigos..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  Todos
                </Badge>
                {categories.map((cat) => (
                  <Badge
                    key={cat.slug}
                    variant={selectedCategory === cat.slug ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(cat.slug)}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted" />
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum artigo encontrado.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    {post.featured_image && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      {post.category && (
                        <Badge variant="secondary" className="w-fit mb-2">
                          {post.category.name}
                        </Badge>
                      )}
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(post.published_at)}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-muted/50 py-8">
          <div className="container text-center text-sm text-muted-foreground">
            <p>© 2025 CheckPlaca. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Blog;
