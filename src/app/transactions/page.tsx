"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownRight, Search, Filter, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useTransactions } from "@/context/transaction-context";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect, useRef, useCallback } from "react";
import { TransactionClass, Transaction } from "@/types";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Chip } from "@/components/ui/chip";

type SortField = 'date' | 'category' | 'weddingCategory' | 'account' | 'class' | 'amount';
type SortDirection = 'asc' | 'desc';

export default function TransactionsPage() {
  const { transactions, loading, addTransaction, deleteTransaction, fetchTransactionsForMonth } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const fetchRef = useRef(fetchTransactionsForMonth);

  // Keep the function reference stable
  fetchRef.current = fetchTransactionsForMonth;
  
  // Load transactions on initial mount
  useEffect(() => {
    fetchRef.current(currentMonth);
  }, [currentMonth]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-4 w-4" /> 
      : <ArrowDown className="ml-1 h-4 w-4" />;
  };

  const previousMonth = useCallback(() => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  }, []);

  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.account.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'weddingCategory':
        const aWedding = a.weddingCategory || '';
        const bWedding = b.weddingCategory || '';
        comparison = aWedding.localeCompare(bWedding);
        break;
      case 'account':
        comparison = a.account.localeCompare(b.account);
        break;
      case 'class':
        const aClass = a.class || '';
        const bClass = b.class || '';
        comparison = aClass.localeCompare(bClass);
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getClassDisplayName = (classValue: TransactionClass | undefined): string => {
    if (!classValue) return "Desconhecido";
    
    const classNames: Record<TransactionClass, string> = {
      "essential": "Essencial",
      "non-essential": "Não Essencial",
      "investment": "Investimento",
      "income": "Receita",
      "business": "PJ"
    };
    
    return classNames[classValue] || classValue.charAt(0).toUpperCase() + classValue.slice(1);
  };

  const getAccountChipStyle = (accountColor?: string): { bg: string, text: string } => {
    if (!accountColor) return { bg: "bg-blue-50", text: "text-blue-700" };
    
    return {
      bg: "",
      text: "text-white"
    };
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      setConfirmDialogOpen(false);
    } finally {
      setDeletingId(null);
      setTransactionToDelete(null);
    }
  };

  const openDeleteConfirmation = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setConfirmDialogOpen(true);
  };

  const TransactionListCard = ({ className, ...props }: React.ComponentProps<"div">) => {
    return (
      <div
        data-slot="card"
        className={cn(
          "bg-card text-card-foreground flex flex-col gap-2 rounded-xl border py-0 shadow-sm",
          className
        )}
        {...props}
      />
    );
  };

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const accountStyle = getAccountChipStyle(transaction.accountColor);
    
    return (
      <TransactionListCard className="mb-3 hover:shadow-md transition-shadow">
        <CardContent className="px-4 py-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{format(transaction.date, "dd/MMM/yyyy", { locale: ptBR })}</p>
            <div className="flex items-center">
              {transaction.type === "income" ? (
                <ArrowUpRight className="mr-1 h-5 w-5 text-green-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-5 w-5 text-red-500" />
              )}
              <span
                className={
                  transaction.type === "income"
                    ? "text-green-500 font-medium text-lg"
                    : "text-red-500 font-medium text-lg"
                }
              >
                {transaction.type === "income" ? "+" : "-"}R$
                {transaction.amount.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="mb-2">
            <h3 className="font-medium text-lg" title={transaction.description}>{transaction.description}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-x-3 mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Categoria</p>
              <Chip 
                text={transaction.category} 
                bgColor="bg-gray-100"
                textColor="text-gray-800"
              />
            </div>
            
            {transaction.weddingCategory ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cat. Casamento</p>
                <Chip 
                  text={transaction.weddingCategory} 
                  bgColor="bg-pink-100"
                  textColor="text-pink-800"
                />
              </div>
            ) : (
              <div></div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-x-3 mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Conta</p>
              {transaction.accountColor ? (
                <Chip 
                  text={transaction.account} 
                  bgColor={accountStyle.bg}
                  textColor={accountStyle.text}
                  className="account-chip"
                  style={{ backgroundColor: transaction.accountColor }}
                />
              ) : (
                <Chip 
                  text={transaction.account} 
                  bgColor="bg-blue-50"
                  textColor="text-blue-700"
                />
              )}
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Classe</p>
              <Chip 
                text={getClassDisplayName(transaction.class)} 
                bgColor="bg-gray-100"
                textColor="text-gray-800"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => openDeleteConfirmation(transaction)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </TransactionListCard>
    );
  };

  const SortableTableHeader = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <th 
      className="py-3 px-4 text-left font-medium text-sm cursor-pointer hover:bg-muted/70 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {children}
        {getSortIcon(field)}
      </div>
    </th>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Transações</h1>
          <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
            <AddTransactionDialog onTransactionAdded={addTransaction}>
              <Button className="w-full sm:w-auto">
                <span className="mr-1">Adicionar Transação</span>
              </Button>
            </AddTransactionDialog>
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <a href="/transactions/import">
                <span className="mr-1">Importar Transações</span>
              </a>
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Todas as Transações</CardTitle>
                <CardDescription>Uma lista de todas as suas transações</CardDescription>
              </div>
              <div className="flex w-full sm:w-auto space-x-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Pesquisar..."
                    className="pl-8 w-full h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="flex-shrink-0 h-9 w-9">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center mb-6">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={previousMonth}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="px-3 py-2 rounded-md bg-muted text-center min-w-[140px]">
                  <span className="font-medium">
                    {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={nextMonth}
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando transações...</span>
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-hidden rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <SortableTableHeader field="date">Data</SortableTableHeader>
                          <th className="py-3 px-4 text-left font-medium text-sm">Descrição</th>
                          <SortableTableHeader field="category">Categoria</SortableTableHeader>
                          <SortableTableHeader field="weddingCategory">Cat. Casamento</SortableTableHeader>
                          <SortableTableHeader field="account">Conta</SortableTableHeader>
                          <SortableTableHeader field="class">Classe</SortableTableHeader>
                          <SortableTableHeader field="amount">Valor</SortableTableHeader>
                          <th className="py-3 px-4 text-right font-medium text-sm">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedTransactions.length > 0 ? (
                          sortedTransactions.map((transaction) => {
                            const accountStyle = getAccountChipStyle(transaction.accountColor);
                            
                            return (
                              <tr key={transaction.id} className="border-b">
                                <td className="py-3 px-4 text-sm">
                                  {format(transaction.date, "dd/MMM/yyyy", { locale: ptBR })}
                                </td>
                                <td className="py-3 px-4 text-sm max-w-[200px] truncate" title={transaction.description}>{transaction.description}</td>
                                <td className="py-3 px-4 text-sm">
                                  <Chip 
                                    text={transaction.category} 
                                    bgColor="bg-gray-100"
                                    textColor="text-gray-800"
                                  />
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  {transaction.weddingCategory ? (
                                    <Chip 
                                      text={transaction.weddingCategory} 
                                      bgColor="bg-pink-100"
                                      textColor="text-pink-800"
                                    />
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  {transaction.accountColor ? (
                                    <Chip 
                                      text={transaction.account} 
                                      bgColor={accountStyle.bg}
                                      textColor={accountStyle.text}
                                      className="account-chip"
                                      style={{ backgroundColor: transaction.accountColor }}
                                    />
                                  ) : (
                                    <Chip 
                                      text={transaction.account} 
                                      bgColor="bg-blue-50"
                                      textColor="text-blue-700"
                                    />
                                  )}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  <Chip 
                                    text={getClassDisplayName(transaction.class)} 
                                    bgColor="bg-gray-100"
                                    textColor="text-gray-800"
                                  />
                                </td>
                                <td className="py-3 px-4 text-sm text-right whitespace-nowrap">
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
                                    onClick={() => openDeleteConfirmation(transaction)}
                                    className="text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={8} className="py-6 text-center text-muted-foreground">
                              {filteredTransactions.length === 0 && searchTerm ? 
                                "Nenhuma transação encontrada para sua pesquisa." : 
                                "Nenhuma transação no mês selecionado."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="md:hidden space-y-3">
                  {sortedTransactions.length > 0 ? (
                    sortedTransactions.map((transaction) => (
                      <TransactionCard key={transaction.id} transaction={transaction} />
                    ))
                  ) : (
                    <div className="py-6 text-center text-muted-foreground">
                      {filteredTransactions.length === 0 && searchTerm ? 
                        "Nenhuma transação encontrada para sua pesquisa." : 
                        "Nenhuma transação no mês selecionado."}
                    </div>
                  )}
                </div>

                {sortedTransactions.length > 0 && (
                  <div className="flex items-center justify-center sm:justify-between mt-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Mostrando {sortedTransactions.length} de {transactions.length} transações
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {transactionToDelete && (
            <div className="py-3">
              <p className="font-medium">{transactionToDelete.description}</p>
              <div className="flex items-center mt-1">
                <span className={transactionToDelete.type === "income" ? "text-green-500" : "text-red-500"}>
                  {transactionToDelete.type === "income" ? "+" : "-"}R${transactionToDelete.amount.toFixed(2)}
                </span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {format(transactionToDelete.date, "dd/MMM/yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => transactionToDelete && handleDelete(transactionToDelete.id)}
              disabled={deletingId !== null}
            >
              {deletingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 