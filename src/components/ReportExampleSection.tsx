import { useState } from "react";
import { FileText, AlertTriangle, Car, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const ReportExampleSection = () => {
  const exampleData = {
    resumo: {
      placa: "ABC1D34",
      marca: "VOLKSWAGEN",
      modelo: "GOL 1.0",
      ano: "2020/2021",
      cor: "PRATA",
      renavam: "***456789",
      chassi: "9BW***********123"
    },
    debitos: [
      { tipo: "IPVA 2024", valor: "R$ 0,00", status: "Pago" },
      { tipo: "Licenciamento 2024", valor: "R$ 0,00", status: "Pago" },
      { tipo: "Multas", valor: "R$ 0,00", status: "Sem pendências" }
    ],
    sinistros: {
      total: 0,
      descricao: "Nenhum registro de sinistro encontrado"
    },
    especificacoes: {
      motor: "1.0 Total Flex",
      combustivel: "Flex",
      potencia: "82 cv",
      cambio: "Manual",
      portas: "4 portas"
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="bg-accent/10 text-accent border-accent/20 px-3 sm:px-4 py-1.5 mb-4 text-xs sm:text-sm">
            Demonstração de Relatório
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
            Veja o que você recebe em cada consulta
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Exemplo real de relatório completo (dados anonimizados para demonstração)
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="resumo" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 sm:mb-8 gap-1 h-auto p-1">
              <TabsTrigger value="resumo" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Resumo</span>
              </TabsTrigger>
              <TabsTrigger value="debitos" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Débitos</span>
              </TabsTrigger>
              <TabsTrigger value="sinistros" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <Car className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sinistros</span>
              </TabsTrigger>
              <TabsTrigger value="especificacoes" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <Wrench className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Especif.</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resumo" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Identificação do Veículo</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Placa</p>
                    <p className="font-semibold text-lg">{exampleData.resumo.placa}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marca/Modelo</p>
                    <p className="font-semibold text-lg">{exampleData.resumo.marca} {exampleData.resumo.modelo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ano</p>
                    <p className="font-semibold text-lg">{exampleData.resumo.ano}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cor</p>
                    <p className="font-semibold text-lg">{exampleData.resumo.cor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">RENAVAM</p>
                    <p className="font-semibold text-lg">{exampleData.resumo.renavam}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chassi</p>
                    <p className="font-semibold text-lg">{exampleData.resumo.chassi}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="debitos" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Débitos e Pendências</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {exampleData.debitos.map((debito, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                      <div>
                        <p className="font-semibold">{debito.tipo}</p>
                        <p className="text-sm text-muted-foreground">{debito.status}</p>
                      </div>
                      <Badge variant={debito.valor === "R$ 0,00" ? "default" : "destructive"}>
                        {debito.valor}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sinistros" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Histórico de Sinistros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                      <Car className="w-8 h-8 text-accent" />
                    </div>
                    <p className="font-semibold text-lg mb-2">✓ Veículo sem sinistros</p>
                    <p className="text-sm text-muted-foreground">Nenhum registro de colisão, roubo ou sinistro encontrado nas bases oficiais</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="especificacoes" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Especificações Técnicas</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Motor</p>
                    <p className="font-semibold text-lg">{exampleData.especificacoes.motor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Combustível</p>
                    <p className="font-semibold text-lg">{exampleData.especificacoes.combustivel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Potência</p>
                    <p className="font-semibold text-lg">{exampleData.especificacoes.potencia}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Câmbio</p>
                    <p className="font-semibold text-lg">{exampleData.especificacoes.cambio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Portas</p>
                    <p className="font-semibold text-lg">{exampleData.especificacoes.portas}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-6 sm:mt-8 px-4">
            <Button 
              size="lg" 
              variant="outline"
              className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Fazer minha consulta agora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
