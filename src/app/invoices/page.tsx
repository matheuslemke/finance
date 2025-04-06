"use client";

import { useState, useCallback, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useInvoices } from "@/context/invoice-context";
import { useAccounts } from "@/context/account-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CreditCard, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Invoice, Transaction } from "@/types";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function InvoicesPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedAccountId, setSelectedAccountId] = useState<string | "all">("all");
  
  const { invoices, loading, getFilteredInvoices } = useInvoices();
  const { accounts } = useAccounts();
  
  useEffect(() => {
    getFilteredInvoices(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, getFilteredInvoices]);

  const filteredInvoices = invoices.filter(invoice => 
    selectedAccountId === "all" || invoice.account_id === selectedAccountId
  );

  const handlePreviousMonth = useCallback(() => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prevYear => prevYear - 1);
    } else {
      setSelectedMonth(prevMonth => prevMonth - 1);
    }
  }, [selectedMonth]);

  const handleNextMonth = useCallback(() => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prevYear => prevYear + 1);
    } else {
      setSelectedMonth(prevMonth => prevMonth + 1);
    }
  }, [selectedMonth]);

  const getInvoiceTotal = (invoice: Invoice): number => {
    if (!invoice.transactions || invoice.transactions.length === 0) return 0;
    return invoice.transactions.reduce((total: number, transaction: Transaction) => total + (transaction.amount || 0), 0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Faturas</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium text-lg">
              {MONTHS[selectedMonth - 1]} {selectedYear}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="w-full md:w-auto">
            <Select 
              value={selectedAccountId} 
              onValueChange={(value) => setSelectedAccountId(value)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Todas as contas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as contas</SelectItem>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Carregando faturas...</p>
          </div>
        ) : (
          <div>
            {filteredInvoices.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 dark:text-gray-400">Nenhuma fatura encontrada para este período</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInvoices.map((invoice) => (
                  <Link 
                    href={`/invoices/${invoice.id}`} 
                    key={invoice.id}
                    className="transition-transform hover:scale-[1.01]"
                  >
                    <Card className="h-full hover:border-primary/50">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: invoice.account?.color || '#3b82f6' }}
                            />
                            <CardTitle className="text-lg">
                              {invoice.account?.name || "Conta"}
                            </CardTitle>
                          </div>
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Vencimento:</span>
                            <span>
                              {invoice.due_day instanceof Date 
                                ? invoice.due_day.toLocaleDateString('pt-BR') 
                                : new Date(invoice.due_day).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Transações:</span>
                            <span>{invoice.transactions?.length || 0}</span>
                          </div>
                          <div className="flex justify-between pt-2 font-medium">
                            <span>Total:</span>
                            <span className="text-lg">
                              R$ {getInvoiceTotal(invoice).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-end pt-1">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
