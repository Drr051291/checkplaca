import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  status?: "success" | "warning" | "error" | "neutral";
  className?: string;
}

const statusStyles = {
  success: "bg-accent/10 border-accent/30 text-accent",
  warning: "bg-amber-50 border-amber-200 text-amber-700",
  error: "bg-destructive/10 border-destructive/30 text-destructive",
  neutral: "bg-muted/50 border-border text-muted-foreground",
};

const iconStyles = {
  success: "text-accent",
  warning: "text-amber-600",
  error: "text-destructive",
  neutral: "text-muted-foreground",
};

export const StatTile = ({ icon: Icon, label, value, status = "neutral", className }: StatTileProps) => {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border",
      "transition-all duration-300 ease-out",
      "hover:shadow-md hover:-translate-y-0.5",
      "cursor-default group",
      statusStyles[status],
      className
    )}>
      <div className={cn(
        "p-2 rounded-lg bg-background/50",
        "transition-transform duration-300 group-hover:scale-110",
        iconStyles[status]
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium opacity-80">{label}</div>
        <div className="font-semibold text-sm truncate">{value}</div>
      </div>
    </div>
  );
};