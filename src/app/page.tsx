"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, Loader2 } from "lucide-react";
import { useTransactions } from "@/context/transaction-context";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Transaction } from "@/types";

export default function Home() {
  const { transactions, loading, addTransaction } = useTransactions();

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalBalance = totalIncome - totalExpenses;
  
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingBills = transactions
    .filter(t => t.type === "expense" && t.date > today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 4);

  const handleAddTransaction = async (transaction: Omit<Transaction, "id">) => {
    await addTransaction(transaction);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Carregando seus dados financeiros...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Painel</h1>
          <AddTransactionDialog onTransactionAdded={handleAddTransaction}>
            <Button className="w-full sm:w-auto">
              <span className="mr-1">Adicionar Transação</span>
            </Button>
          </AddTransactionDialog>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">R${totalBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {totalBalance >= 0 ? "Você está indo bem!" : "Hora de reduzir as despesas"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">R${totalIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(t => t.type === "income").length} transações de receita
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">R${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(t => t.type === "expense").length} transações de despesa
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Economia</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {totalIncome > 0 
                  ? `${(((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)}%` 
                  : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalIncome > 0 && (totalIncome - totalExpenses) / totalIncome > 0.2 
                  ? "Ótima taxa de economia!" 
                  : "Tente economizar mais"}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Sua atividade financeira recente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center space-x-3 max-w-[70%]">
                        <div className={`p-2 rounded-full ${transaction.type === "expense" ? 'bg-red-100' : 'bg-green-100'}`}>
                          {transaction.type === "expense" ? (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(transaction.date, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <p className={`font-medium text-sm ${transaction.type === "expense" ? 'text-red-500' : 'text-green-500'}`}>
                        {transaction.type === "expense" ? '-' : '+'}R${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    Nenhuma transação ainda. Adicione uma para começar.
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Link href="/transactions">
                  <Button variant="outline" className="w-full">Ver Todas as Transações</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contas Futuras</CardTitle>
              <CardDescription>Contas a vencer nos próximos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBills.length > 0 ? (
                  upcomingBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between border-b pb-2">
                      <div className="max-w-[70%]">
                        <p className="font-medium text-sm truncate">{bill.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Vence em {format(bill.date, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <p className="font-medium text-sm">
                        R${bill.amount.toFixed(2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    Nenhuma conta futura.
                  </div>
                )}
              </div>
              <div className="mt-4">
                <AddTransactionDialog onTransactionAdded={handleAddTransaction}>
                  <Button variant="outline" className="w-full">Adicionar Nova Conta</Button>
                </AddTransactionDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
