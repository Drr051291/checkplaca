import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

const AdminCustomerSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('sync-customers');

      if (error) {
        console.error('[AdminCustomerSync] Erro:', error);
        toast({
          title: "Erro na sincronização",
          description: error.message || "Não foi possível sincronizar os clientes.",
          variant: "destructive",
        });
        return;
      }

      setResult(data);

      if (data.success) {
        toast({
          title: "Sincronização concluída!",
          description: `${data.synced} clientes sincronizados com sucesso.`,
        });
      }
    } catch (error: any) {
      console.error('[AdminCustomerSync] Erro:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os clientes.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Sincronizar Dados de Clientes
          </CardTitle>
          <CardDescription>
            Esta ferramenta busca os dados dos clientes do Asaas e popula a tabela de clientes
            com informações de pagamentos anteriores que não têm dados salvos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleSync} 
            disabled={syncing}
            className="w-full"
            size="lg"
          >
            {syncing ? (
              <>
                <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 w-4 h-4" />
                Iniciar Sincronização
              </>
            )}
          </Button>

          {result && (
            <div className="mt-4 p-4 rounded-lg border bg-muted/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {result.success ? 'Sincronização bem-sucedida' : 'Erro na sincronização'}
                  </span>
                </div>
                
                {result.success && (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Total de pagamentos processados: {result.total}</p>
                    <p>• Clientes sincronizados: {result.synced}</p>
                    <p>• Erros: {result.errors}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomerSync;
