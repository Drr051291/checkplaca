import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Target } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Tooltip 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ChartData {
  date: string;
  consultas: number;
  vendas: number;
  receita: number;
  visitantes?: number;
}

interface OriginData {
  name: string;
  value: number;
  color: string;
}

interface DashboardChartsProps {
  chartData: ChartData[];
  originData: OriginData[];
  conversionFunnel: { stage: string; value: number; color: string }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#10B981'];

export const DashboardCharts = ({ chartData, originData, conversionFunnel }: DashboardChartsProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Consultas vs Vendas */}
      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Consultas vs Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              consultas: { label: "Consultas", color: "hsl(var(--primary))" },
              vendas: { label: "Vendas", color: "hsl(var(--accent))" },
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="consultas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vendas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Evolução da Receita */}
      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Evolução da Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              receita: { label: "Receita (R$)", color: "hsl(var(--accent))" },
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorReceita)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Origens de Tráfego */}
      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            Origens de Tráfego
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center">
            {originData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={originData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {originData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, 'Vendas']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full text-center text-muted-foreground">
                Sem dados de origem
              </div>
            )}
            <div className="w-1/2 space-y-2">
              {originData.slice(0, 6).map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs truncate flex-1">{item.name}</span>
                  <span className="text-xs font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funil de Conversão */}
      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4" />
            Funil de Conversão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex flex-col justify-center space-y-3">
            {conversionFunnel.map((stage, index) => {
              const maxValue = conversionFunnel[0]?.value || 1;
              const width = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
              const prevValue = index > 0 ? conversionFunnel[index - 1].value : stage.value;
              const dropOff = prevValue > 0 ? ((prevValue - stage.value) / prevValue * 100).toFixed(1) : 0;
              
              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{stage.value.toLocaleString('pt-BR')}</span>
                      {index > 0 && (
                        <span className="text-destructive text-[10px]">
                          (-{dropOff}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(width, 5)}%`,
                        backgroundColor: stage.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
