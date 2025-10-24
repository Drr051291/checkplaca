import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Search, DollarSign, FileText, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";

const AdminDashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
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

  // Mock statistics data
  const stats = {
    totalSearches: 1247,
    totalRevenue: 12293.30,
    freeSearches: 892,
    paidReports: 355,
    conversionRate: 28.5
  };

  const recentSearches = [
    { id: 1, plate: "ABC1234", date: "2025-01-18 14:32", type: "Pago", value: "R$ 9,90" },
    { id: 2, plate: "XYZ5678", date: "2025-01-18 14:15", type: "Gratuito", value: "-" },
    { id: 3, plate: "DEF9012", date: "2025-01-18 13:58", type: "Pago", value: "R$ 9,90" },
    { id: 4, plate: "GHI3456", date: "2025-01-18 13:42", type: "Gratuito", value: "-" },
    { id: 5, plate: "JKL7890", date: "2025-01-18 13:21", type: "Pago", value: "R$ 9,90" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Consulta Placa - Admin
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +12% vs. mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth">
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
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +18% vs. mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Relatórios Pagos
              </CardTitle>
              <FileText className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.paidReports}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.freeSearches} consultas gratuitas
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
                  {recentSearches.map((search) => (
                    <tr key={search.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold tracking-wider">{search.plate}</span>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {search.date}
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          className={search.type === "Pago" 
                            ? "bg-accent text-accent-foreground" 
                            : "bg-secondary text-secondary-foreground"
                          }
                        >
                          {search.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold">
                        {search.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-center">
              <Button variant="outline">
                Carregar mais
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
