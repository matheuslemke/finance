"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownRight, Search, Filter, Trash2, Loader2 } from "lucide-react";
import { useTransactions } from "@/context/transaction-context";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { TransactionClass } from "@/types";

export default function TransactionsPage() {
  const { transactions, loading, addTransaction, deleteTransaction } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.account.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClassDisplayName = (classValue: TransactionClass | undefined): string => {
    if (!classValue) return "Desconhecido";
    
    const classNames: Record<TransactionClass, string> = {
      "essential": "Essencial",
      "non-essential": "Não Essencial",
      "investment": "Investimento",
      "income": "Receita",
      "business": "Negócio"
    };
    
    return classNames[classValue] || classValue.charAt(0).toUpperCase() + classValue.slice(1);
  };

  const getClassStyling = (classValue: TransactionClass | undefined): string => {
    if (!classValue) return "bg-gray-100 text-gray-800";
    
    switch (classValue) {
      case "essential":
        return "bg-blue-100 text-blue-800";
      case "non-essential":
        return "bg-yellow-100 text-yellow-800";
      case "investment":
        return "bg-purple-100 text-purple-800";
      case "income":
        return "bg-green-100 text-green-800";
      case "business":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Transações</h1>
          <AddTransactionDialog onTransactionAdded={addTransaction} />
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Todas as Transações</CardTitle>
                <CardDescription>Uma lista de todas as suas transações</CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Pesquisar..."
                    className="pl-8 w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando transações...</span>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium text-sm">Data</th>
                        <th className="py-3 px-4 text-left font-medium text-sm">Descrição</th>
                        <th className="py-3 px-4 text-left font-medium text-sm">Categoria</th>
                        <th className="py-3 px-4 text-left font-medium text-sm">Conta</th>
                        <th className="py-3 px-4 text-left font-medium text-sm">Classe</th>
                        <th className="py-3 px-4 text-right font-medium text-sm">Valor</th>
                        <th className="py-3 px-4 text-right font-medium text-sm">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b">
                            <td className="py-3 px-4 text-sm">
                              {format(transaction.date, "dd/MM/yyyy")}
                            </td>
                            <td className="py-3 px-4 text-sm">{transaction.description}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100">
                                {transaction.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">{transaction.account}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getClassStyling(transaction.class)}`}>
                                {getClassDisplayName(transaction.class)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-right">
                              <div className="flex items-center justify-end">
                                {transaction.type === "income" ? (
                                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                                ) : (
                                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                                )}
                                <span
                                  className={
                                    transaction.type === "income"
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }
                                >
                                  {transaction.type === "income" ? "+" : "-"}R$
                                  {transaction.amount.toFixed(2)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(transaction.id)}
                                disabled={deletingId === transaction.id}
                              >
                                {deletingId === transaction.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-muted-foreground">
                            {searchTerm ? "Nenhuma transação encontrada para sua pesquisa." : "Nenhuma transação ainda. Adicione uma para começar."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredTransactions.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {filteredTransactions.length} de {transactions.length} transações
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 