import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface CustomersTableProps {
  customers: Customer[];
}

const ITEMS_PER_PAGE = 10;

export const CustomersTable = ({ customers }: CustomersTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleExportCustomers = () => {
    if (filteredCustomers.length === 0) {
      toast({
        title: "Nenhum cliente",
        description: "Não há clientes para exportar.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Nome', 'Email', 'Telefone', 'CPF', 'Placa', 'Valor', 'Data', 'Origem', 'Mídia', 'Campanha', 'Termo', 'Conteúdo', 'Referrer', 'Landing Page'],
      ...filteredCustomers.map(c => [
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
      description: `${filteredCustomers.length} clientes exportados com sucesso.`,
    });
  };

  return (
    <Card className="shadow-strong">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Base de Clientes
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredCustomers.length} clientes encontrados
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 w-full sm:w-[200px]"
              />
            </div>
            <Button onClick={handleExportCustomers} variant="outline" size="sm">
              <Download className="mr-2 w-4 h-4" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.cpf}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{customer.email}</div>
                        <div className="text-xs text-muted-foreground">{customer.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-primary">
                      {customer.plate}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {customer.utm_source && (
                          <Badge variant="secondary" className="text-[10px]">
                            {customer.utm_source}
                          </Badge>
                        )}
                        {customer.utm_medium && (
                          <Badge variant="outline" className="text-[10px]">
                            {customer.utm_medium}
                          </Badge>
                        )}
                        {!customer.utm_source && !customer.utm_medium && (
                          <span className="text-xs text-muted-foreground">Direto</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-accent">
                      R$ {customer.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                      <br />
                      {new Date(customer.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'Nenhum cliente encontrado para a busca' : 'Nenhum cliente no período'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length)} de {filteredCustomers.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
