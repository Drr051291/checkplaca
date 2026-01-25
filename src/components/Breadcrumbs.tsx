import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { createBreadcrumbSchema } from "./SEO";
import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const BASE_URL = "https://checkplaca.lovable.app";

export const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  // Create schema items
  const schemaItems = [
    { name: "Início", url: BASE_URL },
    ...items.map(item => ({
      name: item.label,
      url: item.href ? `${BASE_URL}${item.href}` : BASE_URL
    }))
  ];

  const breadcrumbSchema = createBreadcrumbSchema(schemaItems);

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      
      <Breadcrumb className={className}>
        <BreadcrumbList className="flex-wrap">
          {/* Home */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to="/" 
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="sr-only sm:not-sr-only">Início</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {items.map((item, index) => (
            <BreadcrumbItem key={index}>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5" />
              </BreadcrumbSeparator>
              
              {item.href && index < items.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link 
                    to={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-foreground font-medium">
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
};
