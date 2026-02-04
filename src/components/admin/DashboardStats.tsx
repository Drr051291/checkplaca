import { Search, ShoppingCart, DollarSign, Target, TrendingUp, Users, Eye, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatsProps {
  visitors: number;
  totalConsultations: number;
  paidConsultations: number;
  totalRevenue: number;
  consultationToSaleRate: number;
  avgTicket: number;
  totalCustomers: number;
}

export const DashboardStats = ({
  visitors,
  totalConsultations,
  paidConsultations,
  totalRevenue,
  consultationToSaleRate,
  avgTicket,
  totalCustomers
}: DashboardStatsProps) => {
  const stats = [
    {
      title: "Visitantes",
      value: visitors.toLocaleString('pt-BR'),
      subtitle: "Acessos únicos",
      icon: Eye,
      color: "text-indigo-500",
      borderColor: "border-l-indigo-500",
    },
    {
      title: "Consultas",
      value: totalConsultations.toLocaleString('pt-BR'),
      subtitle: "Placas consultadas",
      icon: Search,
      color: "text-primary",
      borderColor: "border-l-primary",
    },
    {
      title: "Vendas",
      value: paidConsultations.toLocaleString('pt-BR'),
      subtitle: "Relatórios pagos",
      icon: ShoppingCart,
      color: "text-accent",
      borderColor: "border-l-accent",
    },
    {
      title: "Receita Total",
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: "Faturamento bruto",
      icon: DollarSign,
      color: "text-emerald-500",
      borderColor: "border-l-emerald-500",
    },
    {
      title: "Taxa de Conversão",
      value: `${consultationToSaleRate.toFixed(1)}%`,
      subtitle: "Consulta → Venda",
      icon: Target,
      color: "text-blue-500",
      borderColor: "border-l-blue-500",
    },
    {
      title: "Ticket Médio",
      value: `R$ ${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: "Por venda",
      icon: TrendingUp,
      color: "text-purple-500",
      borderColor: "border-l-purple-500",
    },
    {
      title: "Clientes",
      value: totalCustomers.toLocaleString('pt-BR'),
      subtitle: "Base total",
      icon: Users,
      color: "text-orange-500",
      borderColor: "border-l-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 mb-8">
      {stats.map((stat) => (
        <Card 
          key={stat.title}
          className={`shadow-soft hover:shadow-strong transition-smooth border-l-4 ${stat.borderColor}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
