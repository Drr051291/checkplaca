import { useState } from "react";
import { FileText, AlertTriangle, Car, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const ReportExampleSection = () => {
  const exampleData = {
    veiculo: {
      placa: "ABC-1D34",
      renavam: "***456789**",
      chassi: "9BW***********123",
      marca: "VOLKSWAGEN",
      modelo: "GOL 1.0 TOTAL FLEX 8V 4P",
      anoFabricacao: "2020",
      anoModelo: "2021",
      cor: "PRATA",
      tipo: "AUTOMOVEL",
      especie: "PASSAGEIRO",
      categoria: "PARTICULAR",
      procedencia: "NACIONAL"
    },
    detran: {
      situacao: "CIRCULAÇÃO",
      uf: "SP",
      municipio: "SÃO PAULO",
      restricoes: "NADA CONSTA",
      debitosRENAINF: "SEM DÉBITOS"
    },
    tecnicos: {
      potencia: "82 cv",
      cilindradas: "999",
      combustivel: "ÁLCOOL/GASOLINA",
      numeroMotor: "CKW***123",
      cambio: "MANUAL",
      eixos: "2",
      carroceria: "INEXISTENTE",
      capacidadePassageiros: "5",
      lotacao: "5"
    },
    carga: {
      PBT: "1.520 kg",
      CMT: "1.520 kg",
      capacidadeCarga: "390 kg",
      tara: "1.130 kg"
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
          <Tabs defaultValue="veiculo" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 sm:mb-8 gap-1 h-auto p-1">
              <TabsTrigger value="veiculo" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <Car className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Veículo</span>
              </TabsTrigger>
              <TabsTrigger value="detran" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">DETRAN</span>
              </TabsTrigger>
              <TabsTrigger value="tecnicos" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <Wrench className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Técnicos</span>
              </TabsTrigger>
              <TabsTrigger value="carga" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Carga</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="veiculo" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Dados do Veículo
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-x-6 gap-y-5">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">PLACA</p>
                      <p className="font-semibold text-base">{exampleData.veiculo.placa}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">RENAVAM</p>
                      <p className="font-semibold text-base">{exampleData.veiculo.renavam}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">CHASSI</p>
                      <p className="font-semibold text-base">{exampleData.veiculo.chassi}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">MARCA</p>
                      <p className="font-semibold text-base">{exampleData.veiculo.marca}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">MODELO</p>
                      <p className="font-semibold text-base">{exampleData.veiculo.modelo}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">ANO FABRICAÇÃO</p>
                      <p className="font-semibold text-base">{exampleData.veiculo.anoFabricacao}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">ANO MODELO</p>
                      <p className="font-semibold text-base">{exampleData.veiculo.anoModelo}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">COR</p>
                      <p className="font-semibold text-base">{exampleData.veiculo.cor}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">TIPO</p>
                      <p className="font-semibold text-base">{exampleData.veiculo.tipo}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">ESPÉCIE</p>
                      <p className="font-semibold text-base">{exampleData.veiculo.especie}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">CATEGORIA</p>
                      <p className="font-semibold text-base">{exampleData.veiculo.categoria}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">PROCEDÊNCIA</p>
                      <p className="font-semibold text-base">{exampleData.veiculo.procedencia}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detran" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Situação DETRAN
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">SITUAÇÃO</p>
                      <Badge className="bg-accent text-accent-foreground">
                        {exampleData.detran.situacao}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">UF</p>
                      <p className="font-semibold text-base">{exampleData.detran.uf}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">MUNICÍPIO</p>
                      <p className="font-semibold text-base">{exampleData.detran.municipio}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">RESTRIÇÕES</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {exampleData.detran.restricoes}
                      </Badge>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">DÉBITOS RENAINF</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {exampleData.detran.debitosRENAINF}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tecnicos" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Dados Técnicos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-x-6 gap-y-5">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">POTÊNCIA</p>
                      <p className="font-semibold text-base">{exampleData.tecnicos.potencia}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">CILINDRADAS</p>
                      <p className="font-semibold text-base">{exampleData.tecnicos.cilindradas}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">COMBUSTÍVEL</p>
                      <p className="font-semibold text-base">{exampleData.tecnicos.combustivel}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">NÚMERO MOTOR</p>
                      <p className="font-semibold text-base">{exampleData.tecnicos.numeroMotor}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">CÂMBIO</p>
                      <p className="font-semibold text-base">{exampleData.tecnicos.cambio}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">EIXOS</p>
                      <p className="font-semibold text-base">{exampleData.tecnicos.eixos}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">CARROCERIA</p>
                      <p className="font-semibold text-base">{exampleData.tecnicos.carroceria}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">CAPACIDADE PASSAGEIROS</p>
                      <p className="font-semibold text-base">{exampleData.tecnicos.capacidadePassageiros}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">LOTAÇÃO</p>
                      <p className="font-semibold text-base">{exampleData.tecnicos.lotacao}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="carga" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Dados de Carga
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">PBT (Peso Bruto Total)</p>
                      <p className="font-semibold text-base">{exampleData.carga.PBT}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">CMT (Capacidade Máxima Tração)</p>
                      <p className="font-semibold text-base">{exampleData.carga.CMT}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">CAPACIDADE DE CARGA</p>
                      <p className="font-semibold text-base">{exampleData.carga.capacidadeCarga}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">TARA</p>
                      <p className="font-semibold text-base">{exampleData.carga.tara}</p>
                    </div>
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
