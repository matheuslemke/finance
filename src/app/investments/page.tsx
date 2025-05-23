"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, TrendingUp, ArrowUpRight, ArrowDownRight, BarChart } from "lucide-react";
import { useInvestments } from "@/context/investment-context";
import { useAccounts } from "@/context/account-context";
import { AssetType, Investment } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function InvestmentsPage() {
  const { investments, loading, addInvestment, updateInvestment, deleteInvestment, addInvestmentHistory } = useInvestments();
  const { accounts } = useAccounts();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddHistoryDialogOpen, setIsAddHistoryDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState<Omit<Investment, "id" | "history">>({
    name: "",
    accountId: "",
    assetType: "fixed_income",
    initialValue: 0,
    currentValue: 0,
    purchaseDate: new Date(2024, 0, 1),
  });
  const [historyData, setHistoryData] = useState({
    date: new Date(2024, 0, 1),
    value: 0,
    change: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    setFormData(prev => ({ ...prev, purchaseDate: today }));
    setHistoryData(prev => ({ ...prev, date: today }));
  }, []);

  const filteredInvestments = investments.filter(investment => 
    investment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPortfolio = investments.reduce((total, investment) => total + investment.currentValue, 0);
  
  const assetDistribution = investments.reduce((acc, investment) => {
    const { assetType, currentValue } = investment;
    if (!acc[assetType]) acc[assetType] = 0;
    acc[assetType] += currentValue;
    return acc;
  }, {} as Record<AssetType, number>);

  const handleAddInvestment = async () => {
    if (!formData.name.trim() || !formData.accountId) return;
    
    setIsSubmitting(true);
    try {
      await addInvestment({
        ...formData,
        initialValue: Number(formData.initialValue),
        currentValue: Number(formData.currentValue),
      });
      setIsAddDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInvestment = async () => {
    if (!selectedInvestment || !formData.name.trim() || !formData.accountId) return;
    
    setIsSubmitting(true);
    try {
      await updateInvestment(selectedInvestment.id, {
        ...formData,
        initialValue: Number(formData.initialValue),
        currentValue: Number(formData.currentValue),
      });
      setIsEditDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvestment = async () => {
    if (!selectedInvestment) return;
    
    setIsSubmitting(true);
    try {
      await deleteInvestment(selectedInvestment.id);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsSubmitting(false);
      setSelectedInvestment(null);
    }
  };

  const handleAddHistory = async () => {
    if (!selectedInvestment) return;
    
    setIsSubmitting(true);
    try {
      await addInvestmentHistory(selectedInvestment.id, {
        date: historyData.date,
        value: Number(historyData.value),
        change: Number(historyData.change),
      });
      setIsAddHistoryDialogOpen(false);
      resetHistoryForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (investment: Investment) => {
    setSelectedInvestment(investment);
    setFormData({
      name: investment.name,
      accountId: investment.accountId,
      assetType: investment.assetType,
      initialValue: investment.initialValue,
      currentValue: investment.currentValue,
      purchaseDate: investment.purchaseDate,
      expiryDate: investment.expiryDate,
      notes: investment.notes,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (investment: Investment) => {
    setSelectedInvestment(investment);
    setIsDeleteDialogOpen(true);
  };

  const openAddHistoryDialog = (investment: Investment) => {
    setSelectedInvestment(investment);
    const today = isClient ? new Date() : new Date(2024, 0, 1);
    setHistoryData({
      date: today,
      value: investment.currentValue,
      change: 0,
    });
    setIsAddHistoryDialogOpen(true);
  };

  const resetForm = () => {
    const today = isClient ? new Date() : new Date(2024, 0, 1);
    setFormData({
      name: "",
      accountId: "",
      assetType: "fixed_income",
      initialValue: 0,
      currentValue: 0,
      purchaseDate: today,
    });
    setSelectedInvestment(null);
  };

  const resetHistoryForm = () => {
    const today = isClient ? new Date() : new Date(2024, 0, 1);
    setHistoryData({
      date: today,
      value: 0,
      change: 0,
    });
  };

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

  const calculateReturn = (investment: Investment) => {
    const percentReturn = ((investment.currentValue - investment.initialValue) / investment.initialValue) * 100;
    const absoluteReturn = investment.currentValue - investment.initialValue;
    return { percentReturn, absoluteReturn };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date) => {
    if (!isClient) {
      return date.toLocaleDateString('pt-BR');
    }
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Investimentos</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/investments/analytics">
                <BarChart className="mr-2 h-4 w-4" />
                Análise Detalhada
              </Link>
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Investimento
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Patrimônio Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPortfolio)}</div>
              <p className="text-xs text-muted-foreground">Todos os investimentos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Distribuição por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(assetDistribution).map(([type, value]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm">{getAssetTypeLabel(type as AssetType)}</span>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium">{formatCurrency(value)}</span>
                      <span className="text-xs text-muted-foreground">
                        {((value / totalPortfolio) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Evolução Patrimonial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-24 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Gráfico de evolução patrimonial seria exibido aqui
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Carteira de Investimentos</CardTitle>
                <CardDescription>Gerencie seus investimentos</CardDescription>
              </div>
              <div className="w-full sm:w-auto">
                <Input
                  type="search"
                  placeholder="Pesquisar investimentos..."
                  className="w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando investimentos...</span>
              </div>
            ) : (
              <>
                {filteredInvestments.length > 0 ? (
                  <div className="overflow-hidden rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="py-3 px-4 text-left font-medium text-sm">Nome</th>
                            <th className="py-3 px-4 text-left font-medium text-sm">Tipo</th>
                            <th className="py-3 px-4 text-right font-medium text-sm">Valor Inicial</th>
                            <th className="py-3 px-4 text-right font-medium text-sm">Valor Atual</th>
                            <th className="py-3 px-4 text-right font-medium text-sm">Retorno</th>
                            <th className="py-3 px-4 text-right font-medium text-sm">Data</th>
                            <th className="py-3 px-4 text-right font-medium text-sm">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInvestments.map((investment) => {
                            const { percentReturn, absoluteReturn } = calculateReturn(investment);
                            const isPositive = percentReturn >= 0;
                            
                            return (
                              <tr key={investment.id} className="border-b">
                                <td className="py-3 px-4 text-sm font-medium">{investment.name}</td>
                                <td className="py-3 px-4 text-sm">{getAssetTypeLabel(investment.assetType)}</td>
                                <td className="py-3 px-4 text-sm text-right">{formatCurrency(investment.initialValue)}</td>
                                <td className="py-3 px-4 text-sm text-right">{formatCurrency(investment.currentValue)}</td>
                                <td className="py-3 px-4 text-sm text-right">
                                  <div className="flex items-center justify-end">
                                    {isPositive ? 
                                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" /> : 
                                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                                    }
                                    <span className={isPositive ? "text-green-500" : "text-red-500"}>
                                      {percentReturn.toFixed(2)}% ({formatCurrency(absoluteReturn)})
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-right">{formatDate(investment.purchaseDate)}</td>
                                <td className="py-3 px-4 text-sm text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => openAddHistoryDialog(investment)}
                                      title="Atualizar valor"
                                    >
                                      <TrendingUp className="h-4 w-4 text-primary" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => openEditDialog(investment)}
                                      title="Editar"
                                    >
                                      <Pencil className="h-4 w-4 text-blue-500" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => openDeleteDialog(investment)}
                                      title="Excluir"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    {searchTerm ? "Nenhum investimento encontrado para sua pesquisa." : "Nenhum investimento ainda. Adicione um para começar."}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para adicionar investimento */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Investimento</DialogTitle>
            <DialogDescription>
              Adicione um novo investimento à sua carteira.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: CDB Banco XYZ"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account">Conta</Label>
              <Select 
                value={formData.accountId} 
                onValueChange={(value) => setFormData({ ...formData, accountId: value })}
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assetType">Tipo de Ativo</Label>
              <Select 
                value={formData.assetType} 
                onValueChange={(value) => setFormData({ ...formData, assetType: value as AssetType })}
              >
                <SelectTrigger id="assetType">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_income">Renda Fixa</SelectItem>
                  <SelectItem value="stocks">Ações BR</SelectItem>
                  <SelectItem value="etf">ETF BR</SelectItem>
                  <SelectItem value="foreign_stocks">Ações Internacionais</SelectItem>
                  <SelectItem value="foreign_etf">ETFs Internacionais</SelectItem>
                  <SelectItem value="crypto">Criptomoedas</SelectItem>
                  <SelectItem value="real_estate">Imóveis/FIIs</SelectItem>
                  <SelectItem value="others">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="initialValue">Valor Inicial (R$)</Label>
                <Input
                  id="initialValue"
                  type="number"
                  value={formData.initialValue}
                  onChange={(e) => setFormData({ ...formData, initialValue: parseFloat(e.target.value), currentValue: parseFloat(e.target.value) })}
                  placeholder="0,00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchaseDate">Data de Compra</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate instanceof Date 
                    ? formData.purchaseDate.toISOString().split('T')[0] 
                    : new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: new Date(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Input
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Anotações sobre o investimento"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAddInvestment} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar investimento */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Investimento</DialogTitle>
            <DialogDescription>
              Atualize os detalhes do investimento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-account">Conta</Label>
              <Select 
                value={formData.accountId} 
                onValueChange={(value) => setFormData({ ...formData, accountId: value })}
              >
                <SelectTrigger id="edit-account">
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-assetType">Tipo de Ativo</Label>
              <Select 
                value={formData.assetType} 
                onValueChange={(value) => setFormData({ ...formData, assetType: value as AssetType })}
              >
                <SelectTrigger id="edit-assetType">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_income">Renda Fixa</SelectItem>
                  <SelectItem value="stocks">Ações BR</SelectItem>
                  <SelectItem value="etf">ETF BR</SelectItem>
                  <SelectItem value="foreign_stocks">Ações Internacionais</SelectItem>
                  <SelectItem value="foreign_etf">ETFs Internacionais</SelectItem>
                  <SelectItem value="crypto">Criptomoedas</SelectItem>
                  <SelectItem value="real_estate">Imóveis/FIIs</SelectItem>
                  <SelectItem value="others">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Observações (opcional)</Label>
              <Input
                id="edit-notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleEditInvestment} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para excluir investimento */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Investimento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este investimento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteInvestment} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para adicionar histórico de investimento */}
      <Dialog open={isAddHistoryDialogOpen} onOpenChange={setIsAddHistoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar Valor</DialogTitle>
            <DialogDescription>
              Atualize o valor atual do investimento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="history-date">Data</Label>
              <Input
                id="history-date"
                type="date"
                value={historyData.date instanceof Date 
                  ? historyData.date.toISOString().split('T')[0] 
                  : new Date().toISOString().split('T')[0]}
                onChange={(e) => setHistoryData({ ...historyData, date: new Date(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="history-value">Valor Atual (R$)</Label>
              <Input
                id="history-value"
                type="number"
                value={historyData.value}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value);
                  const initialValue = selectedInvestment?.initialValue || 0;
                  const percentChange = initialValue > 0 ? ((newValue - initialValue) / initialValue) * 100 : 0;
                  
                  setHistoryData({ 
                    ...historyData, 
                    value: newValue,
                    change: percentChange
                  });
                }}
                placeholder="0,00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="history-change">Variação (%)</Label>
              <Input
                id="history-change"
                type="number"
                value={historyData.change.toFixed(2)}
                onChange={(e) => setHistoryData({ ...historyData, change: parseFloat(e.target.value) })}
                placeholder="0,00"
                disabled
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddHistoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAddHistory} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 