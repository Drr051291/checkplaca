import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Search, DollarSign, FileText, TrendingUp, CreditCard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";

interface DashboardStats {
  totalSearches: number;
  totalRevenue: number;
  paidReports: number;
  paymentMethods: { pix: number; boleto: number; card: number };
}

interface RecentSearch {
  id: string;
  plate: string;
  created_at: string;
  payment_status: string | null;
  payment_method: string | null;
  amount: number | null;
}

const AdminDashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSearches: 0,
    totalRevenue: 0,
    paidReports: 0,
    paymentMethods: { pix: 0, boleto: 0, card: 0 }
  });
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
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
        // Fetch all vehicle reports
        const { data: reports, error: reportsError } = await supabase
          .from('vehicle_reports')
          .select('id, plate, created_at');

        if (reportsError) throw reportsError;

        // Fetch all payments with status 'paid' or 'confirmed'
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .in('status', ['paid', 'confirmed']);

        if (paymentsError) throw paymentsError;

        // Calculate stats
        const totalSearches = reports?.length || 0;
        const paidReports = payments?.length || 0;
        const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

        // Count payment methods
        const paymentMethods = payments?.reduce((acc, p) => {
          const method = p.payment_method?.toLowerCase() || 'pix';
          if (method === 'pix') acc.pix++;
          else if (method === 'boleto') acc.boleto++;
          else if (method === 'credit_card' || method === 'card') acc.card++;
          return acc;
        }, { pix: 0, boleto: 0, card: 0 }) || { pix: 0, boleto: 0, card: 0 };

        setStats({
          totalSearches,
          totalRevenue,
          paidReports,
          paymentMethods
        });

        // Fetch recent searches with payment info
        const { data: recentData, error: recentError } = await supabase
          .from('vehicle_reports')
          .select(`
            id,
            plate,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentError) throw recentError;

        // Get payment info for each report
        const recentWithPayments = await Promise.all(
          (recentData || []).map(async (report) => {
            const { data: payment } = await supabase
              .from('payments')
              .select('status, payment_method, amount')
              .eq('report_id', report.id)
              .in('status', ['paid', 'confirmed'])
              .single();

            return {
              ...report,
              payment_status: payment?.status || null,
              payment_method: payment?.payment_method || null,
              amount: payment?.amount || null
            };
          })
        );

        setRecentSearches(recentWithPayments);
      } catch (error) {
        console.error('[AdminDashboard] Erro ao buscar dados:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do dashboard.",
          variant: "destructive"
        });
      }
    };

    fetchDashboardData();
  }, [isAdmin, toast]);

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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral das consultas e receita</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="shadow-soft hover:shadow-strong transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Consultas
              </CardTitle>
              <Search className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalSearches.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Todas as consultas realizadas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compras
              </CardTitle>
              <FileText className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.paidReports}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Relatórios pagos
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Total
              </CardTitle>
              <DollarSign className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Pagamentos confirmados
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Meio de Pagamento
              </CardTitle>
              <CreditCard className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PIX:</span>
                  <span className="font-semibold">{stats.paymentMethods.pix}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Boleto:</span>
                  <span className="font-semibold">{stats.paymentMethods.boleto}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cartão:</span>
                  <span className="font-semibold">{stats.paymentMethods.card}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Conversão
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.totalSearches > 0 
                  ? ((stats.paidReports / stats.totalSearches) * 100).toFixed(1)
                  : '0'}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Gratuito → Pago
              </p>
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
                  Últimas {recentSearches.length} consultas realizadas na plataforma
                </p>
              </div>
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
                  {recentSearches.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Nenhuma consulta encontrada
                      </td>
                    </tr>
                  ) : (
                    recentSearches.map((search) => (
                      <tr key={search.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                        <td className="py-4 px-4">
                          <span className="font-mono font-bold tracking-wider">{search.plate}</span>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {formatDate(search.created_at)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            className={search.payment_status 
                              ? "bg-accent text-accent-foreground" 
                              : "bg-secondary text-secondary-foreground"
                            }
                          >
                            {search.payment_status ? "Pago" : "Gratuito"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right font-semibold">
                          {search.amount ? formatCurrency(Number(search.amount)) : "-"}
                        </td>
                      </tr>
                    ))
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
