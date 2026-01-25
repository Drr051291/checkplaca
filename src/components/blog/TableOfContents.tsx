import { useState, useEffect } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export const TableOfContents = ({ content, className = "" }: TableOfContentsProps) => {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');
    
    const tocItems: TOCItem[] = [];
    headings.forEach((heading, index) => {
      const id = `heading-${index}`;
      const text = heading.textContent || '';
      const level = heading.tagName === 'H2' ? 2 : 3;
      
      if (text.trim()) {
        tocItems.push({ id, text, level });
      }
    });
    
    setItems(tocItems);
  }, [content]);

  useEffect(() => {
    // Add IDs to actual headings in the DOM
    const articleContent = document.querySelector('.prose');
    if (articleContent) {
      const headings = articleContent.querySelectorAll('h2, h3');
      headings.forEach((heading, index) => {
        heading.id = `heading-${index}`;
      });
    }
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className={`bg-muted/30 rounded-lg border border-border/50 ${className}`}>
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between p-4 h-auto"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Neste artigo</span>
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      
      {isExpanded && (
        <ul className="px-4 pb-4 space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`
                  w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors
                  ${item.level === 3 ? 'ml-3' : ''}
                  ${activeId === item.id 
                    ? 'text-primary bg-primary/10 font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};
