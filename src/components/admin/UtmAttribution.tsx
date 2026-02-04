import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Globe, Megaphone } from "lucide-react";

interface Customer {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  amount: number;
}

interface UtmAttributionProps {
  customers: Customer[];
}

export const UtmAttribution = ({ customers }: UtmAttributionProps) => {
  if (customers.length === 0) return null;

  const getUtmStats = (field: keyof Customer) => {
    return Object.entries(
      customers.reduce((acc, c) => {
        const value = (c[field] as string) || 'Direto/Orgânico';
        if (!acc[value]) {
          acc[value] = { count: 0, revenue: 0 };
        }
        acc[value].count += 1;
        acc[value].revenue += c.amount || 0;
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>)
    )
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const sourceStats = getUtmStats('utm_source');
  const mediumStats = getUtmStats('utm_medium');
  const campaignStats = getUtmStats('utm_campaign');

  return (
    <Card className="shadow-soft mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-4 h-4" />
          Atribuição de Vendas por Origem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* By Source */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">Por Origem (Source)</h4>
            </div>
            <div className="space-y-2">
              {sourceStats.map(([source, data]) => (
                <div key={source} className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm truncate flex-1">{source}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {data.count}
                    </Badge>
                    <span className="text-xs font-semibold text-accent">
                      R$ {data.revenue.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Medium */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">Por Mídia (Medium)</h4>
            </div>
            <div className="space-y-2">
              {mediumStats.map(([medium, data]) => (
                <div key={medium} className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm truncate flex-1">{medium}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {data.count}
                    </Badge>
                    <span className="text-xs font-semibold text-accent">
                      R$ {data.revenue.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Campaign */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">Por Campanha</h4>
            </div>
            <div className="space-y-2">
              {campaignStats.map(([campaign, data]) => (
                <div key={campaign} className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm truncate flex-1">{campaign}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {data.count}
                    </Badge>
                    <span className="text-xs font-semibold text-accent">
                      R$ {data.revenue.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
