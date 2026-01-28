import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Search, DollarSign, TrendingUp, Calendar, Eye, Download, Users, ShoppingCart, Target, BarChart3, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface DashboardStats {
  totalConsultations: number;
  paidConsultations: number;
  totalRevenue: number;
  consultationToSaleRate: number;
  avgTicket: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  plate: string;
  amount: number;
  created_at: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
}

interface ChartData {
  date: string;
  consultas: number;
  vendas: number;
  receita: number;
}

const AdminDashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [period, setPeriod] = useState<string>("7");
  const [customDateStart, setCustomDateStart] = useState<string>("");
  const [customDateEnd, setCustomDateEnd] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        setSession(session);

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();

        if (roleError || !roleData) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta área.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          navigate("/");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("[AdminDashboard] Erro ao verificar autenticação:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const getDateRange = () => {
    const endDate = new Date().toISOString();
    let startDate: string;

    switch (period) {
      case "today":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate = today.toISOString();
        break;
      case "7":
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        startDate = last7Days.toISOString();
        break;
      case "thisMonth":
        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);
        thisMonthStart.setHours(0, 0, 0, 0);
        startDate = thisMonthStart.toISOString();
        break;
      case "lastMonth":
        const lastMonthStart = new Date();
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        lastMonthStart.setDate(1);
        lastMonthStart.setHours(0, 0, 0, 0);
        const lastMonthEnd = new Date();
        lastMonthEnd.setDate(0);
        lastMonthEnd.setHours(23, 59, 59, 999);
        return { startDate: lastMonthStart.toISOString(), endDate: lastMonthEnd.toISOString() };
      case "thisYear":
        const thisYearStart = new Date();
        thisYearStart.setMonth(0, 1);
        thisYearStart.setHours(0, 0, 0, 0);
        startDate = thisYearStart.toISOString();
        break;
      case "custom":
        if (customDateStart && customDateEnd) {
          return {
            startDate: new Date(customDateStart).toISOString(),
            endDate: new Date(customDateEnd + 'T23:59:59').toISOString()
          };
        }
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    return { startDate, endDate };
  };

  const prepareDailyChartData = (reports: any[], payments: any[], startDate: string, endDate: string) => {
    const dailyMap = new Map<string, { consultas: number; vendas: number; receita: number }>();
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Initialize all dates in range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyMap.set(dateKey, { consultas: 0, vendas: 0, receita: 0 });
    }

    // Count consultations per day
    reports.forEach(report => {
      const dateKey = new Date(report.created_at).toISOString().split('T')[0];
      if (dailyMap.has(dateKey)) {
        const existing = dailyMap.get(dateKey)!;
        dailyMap.set(dateKey, { ...existing, consultas: existing.consultas + 1 });
      }
    });

    // Count sales and revenue per day
    payments.forEach(payment => {
      const dateKey = new Date(payment.created_at).toISOString().split('T')[0];
      if (dailyMap.has(dateKey)) {
        const existing = dailyMap.get(dateKey)!;
        const amount = parseFloat(payment.amount?.toString() || '0');
        dailyMap.set(dateKey, { 
          ...existing, 
          vendas: existing.vendas + 1,
          receita: existing.receita + amount
        });
      }
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        ...data
      }))
      .slice(-30); // Show last 30 days max
  };

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const { startDate, endDate } = getDateRange();

      // Fetch all vehicle reports (total consultations)
      const { data: reports, error: reportsError } = await supabase
        .from('vehicle_reports')
        .select('id, created_at, user_id')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (reportsError) throw reportsError;

      // Fetch all payments (paid sales)
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'paid')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (paymentsError) throw paymentsError;

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      // Calculate statistics
      const totalConsultations = reports?.length || 0;
      const paidConsultations = payments?.length || 0;
      const totalRevenue = payments?.reduce((sum, p) => sum + (parseFloat(p.amount?.toString() || '0')), 0) || 0;

      // Conversion rate
      const consultationToSaleRate = totalConsultations > 0 
        ? ((paidConsultations / totalConsultations) * 100)
        : 0;

      // Average ticket
      const avgTicket = paidConsultations > 0 
        ? totalRevenue / paidConsultations
        : 0;

      setStats({
        totalConsultations,
        paidConsultations,
        totalRevenue,
        consultationToSaleRate,
        avgTicket
      });

      setCustomers(customersData || []);

      // Prepare chart data
      const dailyData = prepareDailyChartData(reports || [], payments || [], startDate, endDate);
      setChartData(dailyData);

    } catch (error) {
      console.error('[AdminDashboard] Erro ao buscar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchDashboardData();
  }, [isAdmin, period, customDateStart, customDateEnd]);

  const handleExportCustomers = () => {
    if (customers.length === 0) {
      toast({
        title: "Nenhum cliente",
        description: "Não há clientes para exportar no período selecionado.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Nome', 'Email', 'Telefone', 'CPF', 'Placa', 'Valor', 'Data', 'Origem (Source)', 'Mídia (Medium)', 'Campanha', 'Termo', 'Conteúdo', 'Referrer', 'Landing Page'],
      ...customers.map(c => [
        c.name,
        c.email,
        c.phone,
        c.cpf,
        c.plate,
        `R$ ${c.amount.toFixed(2)}`,
        new Date(c.created_at).toLocaleString('pt-BR'),
        c.utm_source || 'Direto',
        c.utm_medium || '-',
        c.utm_campaign || '-',
        c.utm_term || '-',
        c.utm_content || '-',
        c.referrer || '-',
        c.landing_page || '-'
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Exportação concluída",
      description: `${customers.length} clientes exportados com sucesso.`,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate("/");
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-hero sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-white">
              Checkplaca - Admin
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <Button 
                variant="outline"
                onClick={() => navigate("/admin/customer-sync")}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <RefreshCw className="mr-2 w-4 h-4" />
                Sincronizar Clientes
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/admin/blog")}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Gerenciar Blog
              </Button>
              <p className="text-sm text-white/80">
                {session?.user.email}
              </p>
              <Button 
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:text-white hover:bg-white/10"
              >
                <LogOut className="mr-2 w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Title and Period Filter */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">Visão geral das métricas de negócio</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className="mr-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="lastMonth">Mês passado</SelectItem>
                <SelectItem value="thisYear">Este ano</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom Date Range */}
        {period === "custom" && (
          <div className="mb-8 flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={customDateStart}
                onChange={(e) => setCustomDateStart(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={customDateEnd}
                onChange={(e) => setCustomDateEnd(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <Card className="shadow-soft hover:shadow-strong transition-smooth border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Consultas
              </CardTitle>
              <Search className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalConsultations.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Total no período
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendas
              </CardTitle>
              <ShoppingCart className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {stats.paidConsultations.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Relatórios pagos
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Total
              </CardTitle>
              <DollarSign className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Via PIX
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Conversão
              </CardTitle>
              <Target className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{stats.consultationToSaleRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-2">
                Consulta → Venda
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ticket Médio
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                R$ {stats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Por venda
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Consultas vs Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  consultas: {
                    label: "Consultas",
                    color: "hsl(var(--primary))",
                  },
                  vendas: {
                    label: "Vendas",
                    color: "hsl(var(--accent))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="consultas" fill="hsl(var(--primary))" />
                    <Bar dataKey="vendas" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Evolução da Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  receita: {
                    label: "Receita (R$)",
                    color: "hsl(var(--accent))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="receita" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* UTM Attribution Summary */}
        {customers.length > 0 && (
          <Card className="shadow-soft mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Atribuição de Vendas (UTM)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* By Source */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Por Origem (Source)</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      customers.reduce((acc, c) => {
                        const source = c.utm_source || 'Direto';
                        acc[source] = (acc[source] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([source, count]) => (
                        <div key={source} className="flex justify-between items-center">
                          <span className="text-sm truncate">{source}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </div>

                {/* By Medium */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Por Mídia (Medium)</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      customers.reduce((acc, c) => {
                        const medium = c.utm_medium || 'Não definido';
                        acc[medium] = (acc[medium] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([medium, count]) => (
                        <div key={medium} className="flex justify-between items-center">
                          <span className="text-sm truncate">{medium}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </div>

                {/* By Campaign */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Por Campanha</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      customers.reduce((acc, c) => {
                        const campaign = c.utm_campaign || 'Sem campanha';
                        acc[campaign] = (acc[campaign] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([campaign, count]) => (
                        <div key={campaign} className="flex justify-between items-center">
                          <span className="text-sm truncate">{campaign}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customers Table */}
        <Card className="shadow-strong">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Base de Clientes
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {customers.length} clientes no período selecionado
                </p>
              </div>
              <Button onClick={handleExportCustomers} variant="outline">
                <Download className="mr-2 w-4 h-4" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell className="font-mono font-bold">{customer.plate}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {customer.utm_source && (
                              <Badge variant="secondary" className="text-xs">
                                {customer.utm_source}
                              </Badge>
                            )}
                            {customer.utm_medium && (
                              <div className="text-xs text-muted-foreground">
                                Mídia: {customer.utm_medium}
                              </div>
                            )}
                            {customer.utm_campaign && (
                              <div className="text-xs text-muted-foreground">
                                Campanha: {customer.utm_campaign}
                              </div>
                            )}
                            {!customer.utm_source && !customer.utm_medium && !customer.utm_campaign && (
                              <span className="text-xs text-muted-foreground">Direto</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-accent">
                          R$ {customer.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(customer.created_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum cliente no período selecionado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
