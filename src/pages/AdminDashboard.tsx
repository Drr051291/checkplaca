import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Calendar, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { UtmAttribution } from "@/components/admin/UtmAttribution";
import { CustomersTable } from "@/components/admin/CustomersTable";

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
  const [visitors, setVisitors] = useState(0);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [paidConsultations, setPaidConsultations] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [consultationToSaleRate, setConsultationToSaleRate] = useState(0);
  const [avgTicket, setAvgTicket] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [originData, setOriginData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<{ stage: string; value: number; color: string }[]>([]);
  const [period, setPeriod] = useState<string>("thisMonth");
  const [customDateStart, setCustomDateStart] = useState<string>("");
  const [customDateEnd, setCustomDateEnd] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSyncCustomers = async () => {
    try {
      setIsSyncing(true);
      const { data, error } = await supabase.functions.invoke('sync-customers');
      
      if (error) throw error;
      
      toast({
        title: "Sincronização concluída",
        description: `${data.synced} novos clientes importados do Asaas.`,
      });
      
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error: any) {
      console.error('[AdminDashboard] Erro ao sincronizar:', error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível sincronizar clientes do Asaas.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

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
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    return { startDate, endDate };
  };

  const prepareDailyChartData = (plateQueries: any[], orders: any[], startDate: string, endDate: string) => {
    const dailyMap = new Map<string, { consultas: number; vendas: number; receita: number }>();
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyMap.set(dateKey, { consultas: 0, vendas: 0, receita: 0 });
    }

    plateQueries.forEach(query => {
      const dateKey = new Date(query.created_at).toISOString().split('T')[0];
      if (dailyMap.has(dateKey)) {
        const existing = dailyMap.get(dateKey)!;
        dailyMap.set(dateKey, { ...existing, consultas: existing.consultas + 1 });
      }
    });

    orders.forEach(order => {
      const dateKey = new Date(order.created_at).toISOString().split('T')[0];
      if (dailyMap.has(dateKey)) {
        const existing = dailyMap.get(dateKey)!;
        const amount = (order.amount_cents || 0) / 100;
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
      .slice(-30);
  };

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const { startDate, endDate } = getDateRange();

      // Fetch plate queries (consultations + visitors)
      const { data: plateQueries, error: plateError } = await supabase
        .from('plate_queries')
        .select('id, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (plateError) throw plateError;

      // Fetch paid orders (sales + revenue)
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, amount_cents')
        .eq('payment_status', 'paid')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (ordersError) throw ordersError;

      // Fetch customers for UTM data
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      // Calculate statistics from correct tables
      const consultations = plateQueries?.length || 0;
      const sales = orders?.length || 0;
      const revenue = orders?.reduce((sum, o) => sum + ((o.amount_cents || 0) / 100), 0) || 0;
      const convRate = consultations > 0 ? ((sales / consultations) * 100) : 0;
      const ticket = sales > 0 ? revenue / sales : 0;
      
      // Visitors = plate queries (unique searches)
      const visitorCount = consultations;

      setVisitors(visitorCount);
      setTotalConsultations(consultations);
      setPaidConsultations(sales);
      setTotalRevenue(revenue);
      setConsultationToSaleRate(convRate);
      setAvgTicket(ticket);
      setCustomers(customersData || []);

      // Prepare chart data using plate_queries and orders
      const dailyData = prepareDailyChartData(plateQueries || [], orders || [], startDate, endDate);
      setChartData(dailyData);

      // Prepare origin data for pie chart from customers UTM
      const origins = (customersData || []).reduce((acc, c) => {
        const source = c.utm_source || 'Direto';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // If no UTM data, show "Direto" as fallback
      if (Object.keys(origins).length === 0 && sales > 0) {
        origins['Direto'] = sales;
      }

      setOriginData(
        Object.entries(origins)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 7)
          .map(([name, value]) => ({ name, value, color: '' }))
      );

      // Prepare conversion funnel
      setConversionFunnel([
        { stage: 'Visitantes', value: visitorCount, color: '#8B5CF6' },
        { stage: 'Consultas', value: consultations, color: 'hsl(var(--primary))' },
        { stage: 'Vendas', value: sales, color: 'hsl(var(--accent))' },
      ]);

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
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-gradient-hero sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-white" />
              <h1 className="text-xl font-bold text-white">
                Checkplaca Admin
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleSyncCustomers}
                disabled={isSyncing}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <RefreshCw className={`mr-1.5 w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Sync Asaas'}
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/blog")}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Blog
              </Button>
              <span className="text-xs text-white/70 hidden sm:inline">
                {session?.user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Title and Period Filter */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-sm text-muted-foreground">Métricas e performance do Checkplaca</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={fetchDashboardData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px]">
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
          <div className="mb-6 flex gap-4 items-end bg-background p-4 rounded-lg border">
            <div className="flex-1">
              <Label htmlFor="startDate" className="text-xs">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={customDateStart}
                onChange={(e) => setCustomDateStart(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate" className="text-xs">Data Final</Label>
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
        <DashboardStats
          visitors={visitors}
          totalConsultations={totalConsultations}
          paidConsultations={paidConsultations}
          totalRevenue={totalRevenue}
          consultationToSaleRate={consultationToSaleRate}
          avgTicket={avgTicket}
          totalCustomers={customers.length}
        />

        {/* Charts */}
        <DashboardCharts
          chartData={chartData}
          originData={originData}
          conversionFunnel={conversionFunnel}
        />

        {/* UTM Attribution */}
        <UtmAttribution customers={customers} />

        {/* Customers Table */}
        <CustomersTable customers={customers} />
      </div>
    </div>
  );
};

export default AdminDashboard;
