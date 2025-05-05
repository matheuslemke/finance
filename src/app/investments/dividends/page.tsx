"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useInvestments } from "@/contexts/InvestmentsContext";
import { DividendEvent, DividendType } from "@/types";

export default function DividendsPage() {
  const { investments, addDividend, removeDividend } = useInvestments();
  const { toast } = useToast();
  const [isAddingDividend, setIsAddingDividend] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<string>();
  const [dividendType, setDividendType] = useState<DividendType>("dividend");
  const [announcementDate, setAnnouncementDate] = useState("");
  const [exDate, setExDate] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [baseValue, setBaseValue] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const stockInvestments = investments.filter(
    (inv) => inv.assetType === "stocks" || inv.assetType === "real_estate"
  );

  const handleAddDividend = () => {
    if (!selectedInvestment) {
      toast({
        title: "Erro",
        description: "Selecione um ativo",
        variant: "destructive",
      });
      return;
    }

    const investment = investments.find((inv) => inv.id === selectedInvestment);
    if (!investment) return;

    const baseValueNum = parseFloat(baseValue);
    const quantityNum = parseFloat(quantity);

    if (isNaN(baseValueNum) || isNaN(quantityNum)) {
      toast({
        title: "Erro",
        description: "Valores inválidos",
        variant: "destructive",
      });
      return;
    }

    const dividend: DividendEvent = {
      id: crypto.randomUUID(),
      investmentId: selectedInvestment,
      type: dividendType,
      announcementDate: new Date(announcementDate),
      exDate: new Date(exDate),
      paymentDate: new Date(paymentDate),
      baseValue: baseValueNum,
      totalValue: baseValueNum * quantityNum,
      quantity: quantityNum,
      notes,
    };

    addDividend(dividend);
    setIsAddingDividend(false);
    resetForm();

    toast({
      title: "Sucesso",
      description: "Dividendo registrado com sucesso",
    });
  };

  const resetForm = () => {
    setSelectedInvestment(undefined);
    setDividendType("dividend");
    setAnnouncementDate("");
    setExDate("");
    setPaymentDate("");
    setBaseValue("");
    setQuantity("");
    setNotes("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const getDividendTypeLabel = (type: DividendType) => {
    const types = {
      dividend: "Dividendo",
      jcp: "JCP",
      return: "Retorno de Capital",
      subscription: "Direito de Subscrição",
      stock: "Bonificação em Ações",
      split: "Desdobramento",
      grouping: "Grupamento",
      income: "Rendimento",
      amortization: "Amortização",
    };
    return types[type];
  };

  return (
    <div className="space-y-4 p-4 pb-32">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dividendos</h1>
        <Dialog open={isAddingDividend} onOpenChange={setIsAddingDividend}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Dividendo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Dividendo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="investment">Ativo</Label>
                <Select
                  value={selectedInvestment}
                  onValueChange={setSelectedInvestment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ativo" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockInvestments.map((investment) => (
                      <SelectItem key={investment.id} value={investment.id}>
                        {investment.ticker || investment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select 
                  value={dividendType} 
                  onValueChange={(value: string) => setDividendType(value as DividendType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dividend">Dividendo</SelectItem>
                    <SelectItem value="jcp">JCP</SelectItem>
                    <SelectItem value="return">Retorno de Capital</SelectItem>
                    <SelectItem value="subscription">
                      Direito de Subscrição
                    </SelectItem>
                    <SelectItem value="stock">Bonificação em Ações</SelectItem>
                    <SelectItem value="split">Desdobramento</SelectItem>
                    <SelectItem value="grouping">Grupamento</SelectItem>
                    <SelectItem value="income">Rendimento</SelectItem>
                    <SelectItem value="amortization">Amortização</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="announcementDate">Data do Anúncio</Label>
                <Input
                  id="announcementDate"
                  type="date"
                  value={announcementDate}
                  onChange={(e) => setAnnouncementDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exDate">Data Ex</Label>
                <Input
                  id="exDate"
                  type="date"
                  value={exDate}
                  onChange={(e) => setExDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="paymentDate">Data do Pagamento</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baseValue">Valor por Ação/Cota</Label>
                <Input
                  id="baseValue"
                  type="number"
                  step="0.01"
                  value={baseValue}
                  onChange={(e) => setBaseValue(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleAddDividend}>Registrar</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stockInvestments.map((investment) => (
          <Card key={investment.id}>
            <CardHeader>
              <CardTitle>
                {investment.ticker || investment.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {investment.dividends?.map((dividend) => (
                  <div
                    key={dividend.id}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <div>
                      <p className="font-medium">
                        {getDividendTypeLabel(dividend.type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pagamento: {formatDate(dividend.paymentDate)}
                      </p>
                      <p className="text-sm">
                        {formatCurrency(dividend.baseValue)} por ação
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(dividend.totalValue)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeDividend(dividend.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
                {!investment.dividends?.length && (
                  <p className="text-center text-sm text-muted-foreground">
                    Nenhum dividendo registrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 