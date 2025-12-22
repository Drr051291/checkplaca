import { cn } from "@/lib/utils";

interface InfoItemProps {
  label: string;
  value?: string | number | null;
  highlight?: boolean;
  mono?: boolean;
}

export const InfoItem = ({ label, value, highlight, mono }: InfoItemProps) => (
  <div className="min-w-0">
    <div className="text-xs text-muted-foreground mb-1 font-medium print:text-[10px]">{label}</div>
    <div className={cn(
      "truncate print:text-sm",
      highlight ? "font-semibold" : "font-medium",
      mono && "font-mono text-sm"
    )}>
      {value || "Não disponível"}
    </div>
  </div>
);

interface InfoGridProps {
  items: Array<{
    label: string;
    value?: string | number | null;
    highlight?: boolean;
    mono?: boolean;
  }>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const InfoGrid = ({ items, columns = 3, className }: InfoGridProps) => {
  const colsClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3 print:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4 print:grid-cols-4",
  };

  return (
    <div className={cn(
      "grid gap-x-6 gap-y-4 print:gap-x-4 print:gap-y-2",
      colsClass[columns],
      className
    )}>
      {items.map((item, i) => (
        <InfoItem key={i} {...item} />
      ))}
    </div>
  );
};