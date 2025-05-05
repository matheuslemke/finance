"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInvestments } from "@/contexts/InvestmentsContext";
import { AssetType } from "@/types";

export default function InvestmentAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"1m" | "3m" | "6m" | "1y" | "all">("all");
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<AssetType[]>([]);
  const { investments } = useInvestments();

  const totalPortfolio = investments.reduce((total, investment) => total + investment.currentValue, 0);
  
  const assetDistribution = investments.reduce((acc, investment) => {
    const { assetType, currentValue } = investment;
    if (!acc[assetType]) acc[assetType] = 0;
    acc[assetType] += currentValue;
    return acc;
  }, {} as Record<AssetType, number>);

  const totalReturn = investments.reduce((total, investment) => {
    return total + (investment.currentValue - investment.initialValue);
  }, 0);

  const percentReturn = investments.length > 0 
    ? (totalReturn / investments.reduce((total, investment) => total + investment.initialValue, 0)) * 100 
    : 0;

  const getAssetTypeLabel = (type: AssetType) => {
    switch (type) {
      case "fixed_income": return "Renda Fixa";
      case "stocks": return "Ações BR";
      case "etf": return "ETF BR";
      case "foreign_stocks": return "Ações Internacionais";
      case "foreign_etf": return "ETFs Internacionais";
      case "crypto": return "Criptomoedas";
      case "real_estate": return "Imóveis/FIIs";
      case "others": return "Outros";
      default: return type;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const toggleAssetTypeFilter = (assetType: AssetType) => {
    setSelectedAssetTypes(prev => 
      prev.includes(assetType) 
        ? prev.filter(t => t !== assetType)
        : [...prev, assetType]
    );
  };

  const filteredInvestments = selectedAssetTypes.length > 0
    ? investments.filter(investment => selectedAssetTypes.includes(investment.assetType))
    : investments;

  const assetTypeColors: Record<AssetType, string> = {
    fixed_income: "#4338ca",
    stocks: "#0891b2",
    etf: "#0d9488",
    foreign_stocks: "#7c3aed",
    foreign_etf: "#8b5cf6",
    crypto: "#f59e0b",
    real_estate: "#10b981",
    others: "#6b7280"
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Análise de Investimentos</h1>
          <div className="flex space-x-2">
            <Select 
              value={timeRange} 
              onValueChange={(value) => setTimeRange(value as "1m" | "3m" | "6m" | "1y" | "all")}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Último mês</SelectItem>
                <SelectItem value="3m">3 meses</SelectItem>
                <SelectItem value="6m">6 meses</SelectItem>
                <SelectItem value="1y">1 ano</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Exportar</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Patrimônio Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPortfolio)}</div>
              <p className="text-xs text-muted-foreground">Valor total investido</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Retorno Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalReturn)}</div>
              <p className={`text-xs ${totalReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                {percentReturn.toFixed(2)}% {totalReturn >= 0 ? "de ganho" : "de perda"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rentabilidade Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{percentReturn.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">
                Rentabilidade média dos investimentos
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Evolução Patrimonial</CardTitle>
              <CardDescription>
                Evolução do patrimônio ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">
                  Aqui seria exibido um gráfico de linha mostrando a evolução patrimonial ao longo do tempo
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Distribuição de Ativos</CardTitle>
              <CardDescription>
                Por tipo de investimento
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="space-y-4">
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Aqui seria exibido um gráfico de pizza mostrando a distribuição por tipo de ativo
                  </p>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(assetDistribution).map(([type, value]) => {
                    const assetType = type as AssetType;
                    const percentage = ((value / totalPortfolio) * 100).toFixed(1);
                    
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: assetTypeColors[assetType] }} 
                        />
                        <div className="flex justify-between items-center w-full">
                          <span className="text-sm">{getAssetTypeLabel(assetType)}</span>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">{formatCurrency(value)}</span>
                            <span className="text-xs text-muted-foreground">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Análise por Tipo de Ativo</CardTitle>
            <CardDescription>
              Desempenho comparativo entre diferentes tipos de ativos
            </CardDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.keys(assetTypeColors).map(type => (
                <Button
                  key={type}
                  variant={selectedAssetTypes.includes(type as AssetType) ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => toggleAssetTypeFilter(type as AssetType)}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: assetTypeColors[type as AssetType] }} 
                  />
                  {getAssetTypeLabel(type as AssetType)}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="performance">
              <TabsList className="mb-4">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="comparison">Comparação</TabsTrigger>
                <TabsTrigger value="risk">Risco/Retorno</TabsTrigger>
              </TabsList>
              <TabsContent value="performance">
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Aqui seria exibido um gráfico de barras comparando o desempenho dos diferentes tipos de ativos
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="comparison">
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Aqui seria exibido um gráfico de linha comparando o desempenho de diferentes ativos ao longo do tempo
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="risk">
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Aqui seria exibido um gráfico de dispersão mostrando a relação risco/retorno dos investimentos
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Melhores Investimentos</CardTitle>
              <CardDescription>
                Investimentos com melhor desempenho
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredInvestments
                .sort((a, b) => {
                  const returnA = (a.currentValue - a.initialValue) / a.initialValue;
                  const returnB = (b.currentValue - b.initialValue) / b.initialValue;
                  return returnB - returnA;
                })
                .slice(0, 5)
                .map((investment, index) => {
                  const percentReturn = ((investment.currentValue - investment.initialValue) / investment.initialValue) * 100;
                  
                  return (
                    <div key={investment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-sm w-5">{index + 1}</div>
                        <div>
                          <div className="font-medium">{investment.name}</div>
                          <div className="text-xs text-muted-foreground">{getAssetTypeLabel(investment.assetType)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-500">+{percentReturn.toFixed(2)}%</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(investment.currentValue)}</div>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Piores Investimentos</CardTitle>
              <CardDescription>
                Investimentos com pior desempenho
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredInvestments
                .sort((a, b) => {
                  const returnA = (a.currentValue - a.initialValue) / a.initialValue;
                  const returnB = (b.currentValue - b.initialValue) / b.initialValue;
                  return returnA - returnB;
                })
                .slice(0, 5)
                .map((investment, index) => {
                  const percentReturn = ((investment.currentValue - investment.initialValue) / investment.initialValue) * 100;
                  const isNegative = percentReturn < 0;
                  
                  return (
                    <div key={investment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-sm w-5">{index + 1}</div>
                        <div>
                          <div className="font-medium">{investment.name}</div>
                          <div className="text-xs text-muted-foreground">{getAssetTypeLabel(investment.assetType)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${isNegative ? "text-red-500" : "text-green-500"}`}>
                          {isNegative ? "" : "+"}{percentReturn.toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(investment.currentValue)}</div>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 