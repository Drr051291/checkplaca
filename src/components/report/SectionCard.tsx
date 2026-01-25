import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  actions?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  children: React.ReactNode;
}

export const SectionCard = ({
  title,
  icon: Icon,
  badge,
  badgeVariant = "outline",
  actions,
  className,
  headerClassName,
  children
}: SectionCardProps) => {
  return (
    <Card className={cn(
      "shadow-soft print:shadow-none print:border print:border-border break-inside-avoid",
      "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out",
      "group",
      className
    )}>
      <CardHeader className={cn("pb-4", headerClassName)}>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            {Icon && (
              <Icon className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
            )}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {badge && (
              <Badge variant={badgeVariant} className="text-xs font-normal transition-all duration-200 group-hover:shadow-sm">
                {badge}
              </Badge>
            )}
            {actions}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};