import { BlogCTABanner } from "./BlogCTABanner";
import { RelatedPosts } from "./RelatedPosts";

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at?: string;
}

interface BlogSidebarProps {
  relatedPosts?: RelatedPost[];
  className?: string;
}

export const BlogSidebar = ({ relatedPosts = [], className = "" }: BlogSidebarProps) => {
  return (
    <aside className={`space-y-6 ${className}`}>
      {/* Main CTA Banner */}
      <div className="sticky top-24">
        <BlogCTABanner variant="sidebar" />
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-6">
            <RelatedPosts 
              posts={relatedPosts} 
              variant="compact" 
              title="Leia também"
            />
          </div>
        )}
      </div>
    </aside>
  );
};
