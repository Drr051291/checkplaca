import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at?: string;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  variant?: "grid" | "compact" | "list";
  title?: string;
  className?: string;
}

export const RelatedPosts = ({ 
  posts, 
  variant = "grid",
  title = "Artigos Relacionados",
  className = "" 
}: RelatedPostsProps) => {
  if (posts.length === 0) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short"
    });
  };

  if (variant === "compact") {
    return (
      <div className={className}>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          {title}
        </h4>
        <div className="space-y-3">
          {posts.slice(0, 4).map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="flex items-start gap-3 group"
            >
              {post.featured_image && (
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h5>
                {post.published_at && (
                  <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.published_at)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
        <Link 
          to="/blog" 
          className="text-sm text-primary hover:underline mt-4 inline-flex items-center gap-1"
        >
          Ver todos os artigos
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={className}>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
            >
              {post.featured_image && (
                <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div className={className}>
      <h3 className="text-2xl font-bold mb-6">{title}</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden group hover:shadow-lg transition-all"
          >
            <Link to={`/blog/${post.slug}`}>
              {post.featured_image && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4">
                <h4 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                )}
                {post.published_at && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.published_at)}
                  </span>
                )}
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};
