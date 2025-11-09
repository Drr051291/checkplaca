import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Search, DollarSign, FileText, TrendingUp, Calendar, Eye, CreditCard, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardStats {
  totalSearches: number;
  totalRevenue: number;
  paidReports: number;
  conversionRate: number;
  visitors: number;
  planBreakdown: { [key: string]: number };
  paymentMethodBreakdown: { [key: string]: number };
}

interface RecentSearch {
  id: string;
  plate: string;
  created_at: string;
  plan_type: string | null;
  amount: number | null;
  payment_method: string | null;
  status: string | null;
}

const AdminDashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [period, setPeriod] = useState<string>("7");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication and admin role
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        setSession(session);

        // Check if user has admin role
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

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchDashboardData = async () => {
      try {
        const daysAgo = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);
        const startDateStr = startDate.toISOString();

        // Fetch vehicle reports (total searches and visitors)
        const { data: reports, error: reportsError } = await supabase
          .from('vehicle_reports')
          .select('id, created_at, user_id')
          .gte('created_at', startDateStr);

        if (reportsError) throw reportsError;

        // Fetch payments
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .gte('created_at', startDateStr);

        if (paymentsError) throw paymentsError;

        // Calculate statistics
        const totalSearches = reports?.length || 0;
        const paidPayments = payments?.filter(p => p.status === 'paid') || [];
        const paidReports = paidPayments.length;
        const totalRevenue = paidPayments.reduce((sum, p) => sum + (parseFloat(p.amount?.toString() || '0')), 0);
        
        // Calculate unique visitors (unique user_ids)
        const uniqueUserIds = new Set(reports?.map(r => r.user_id).filter(Boolean));
        const visitors = uniqueUserIds.size;

        // Calculate conversion rate
        const conversionRate = totalSearches > 0 
          ? ((paidReports / totalSearches) * 100).toFixed(1)
          : "0.0";

        // Plan breakdown
        const planBreakdown: { [key: string]: number } = {};
        paidPayments.forEach(p => {
          const plan = p.plan_type || 'Não especificado';
          planBreakdown[plan] = (planBreakdown[plan] || 0) + 1;
        });

        // Payment method breakdown
        const paymentMethodBreakdown: { [key: string]: number } = {};
        paidPayments.forEach(p => {
          const method = p.payment_method || 'Não especificado';
          paymentMethodBreakdown[method] = (paymentMethodBreakdown[method] || 0) + 1;
        });

        setStats({
          totalSearches,
          totalRevenue,
          paidReports,
          conversionRate: parseFloat(conversionRate),
          visitors,
          planBreakdown,
          paymentMethodBreakdown
        });

        // Fetch recent searches with payment info
        const { data: recentData, error: recentError } = await supabase
          .from('vehicle_reports')
          .select(`
            id,
            plate,
            created_at,
            payments (
              plan_type,
              amount,
              payment_method,
              status
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentError) throw recentError;

        const formattedSearches: RecentSearch[] = (recentData || []).map((item: any) => ({
          id: item.id,
          plate: item.plate,
          created_at: item.created_at,
          plan_type: item.payments?.[0]?.plan_type || null,
          amount: item.payments?.[0]?.amount || null,
          payment_method: item.payments?.[0]?.payment_method || null,
          status: item.payments?.[0]?.status || null
        }));

        setRecentSearches(formattedSearches);

      } catch (error) {
        console.error('[AdminDashboard] Erro ao buscar dados:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do dashboard.",
          variant: "destructive",
        });
      }
    };

    fetchDashboardData();
  }, [isAdmin, period, toast]);

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
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Checkplaca - Admin
            </h1>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={() => navigate("/admin/blog")}
              >
                Gerenciar Blog
              </Button>
              <p className="text-sm text-muted-foreground">
                {session?.user.email}
              </p>
              <Button 
                variant="ghost"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">Visão geral das consultas e receita</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <Card className="shadow-soft hover:shadow-strong transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Visitantes
              </CardTitle>
              <Eye className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.visitors.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Usuários únicos
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Consultas
              </CardTitle>
              <Search className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalSearches.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Total de buscas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendas
              </CardTitle>
              <DollarSign className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.paidReports} relatórios
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Conversão
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground mt-2">
                Gratuito → Pago
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Plano Popular
              </CardTitle>
              <FileText className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.planBreakdown).length > 0 
                  ? Object.entries(stats.planBreakdown).sort((a, b) => b[1] - a[1])[0][0]
                  : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Mais vendido
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plan and Payment Method Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Vendas por Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.planBreakdown).length > 0 ? (
                  Object.entries(stats.planBreakdown).map(([plan, count]) => (
                    <div key={plan} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{plan}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma venda no período</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Meios de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.paymentMethodBreakdown).length > 0 ? (
                  Object.entries(stats.paymentMethodBreakdown).map(([method, count]) => (
                    <div key={method} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{method}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum pagamento no período</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Searches Table */}
        <Card className="shadow-strong">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Consultas Recentes</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Últimas consultas realizadas na plataforma
                </p>
              </div>
              <Button variant="outline">
                <Calendar className="mr-2 w-4 h-4" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Placa
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Data/Hora
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Tipo
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentSearches.length > 0 ? (
                    recentSearches.map((search) => {
                      const isPaid = search.status === 'paid';
                      const formattedDate = new Date(search.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <tr key={search.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                          <td className="py-4 px-4">
                            <span className="font-mono font-bold tracking-wider">{search.plate}</span>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">
                            {formattedDate}
                          </td>
                          <td className="py-4 px-4">
                            <Badge 
                              className={isPaid
                                ? "bg-accent text-accent-foreground" 
                                : "bg-secondary text-secondary-foreground"
                              }
                            >
                              {isPaid ? search.plan_type || 'Pago' : 'Gratuito'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right font-semibold">
                            {isPaid && search.amount 
                              ? `R$ ${parseFloat(search.amount.toString()).toFixed(2)}`
                              : '-'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Nenhuma consulta registrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
