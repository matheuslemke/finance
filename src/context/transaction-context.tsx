"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Transaction } from "@/types";
import { fetchTransactions, addTransaction as addTransactionToSupabase, updateTransaction as updateTransactionInSupabase, deleteTransaction as deleteTransactionFromSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { startOfMonth, endOfMonth } from "date-fns";

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchTransactionsForMonth: (date: Date) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
}

interface TransactionProviderProps {
  children: ReactNode;
}

export function TransactionProvider({ children }: TransactionProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On initial load, fetch transactions for the current month
    fetchTransactionsForMonth(new Date());
  }, []);

  const fetchTransactionsForMonth = async (date: Date) => {
    try {
      setLoading(true);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const data = await fetchTransactions(monthStart, monthEnd);
      setTransactions(data);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast.error("Não foi possível carregar as transações");
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      setLoading(true);
      const newTransaction = await addTransactionToSupabase(transaction);
      
      if (newTransaction) {
        setTransactions(prev => [...prev, newTransaction]);
        toast.success("Transação adicionada com sucesso");
      } else {
        toast.error("Erro ao adicionar transação: Verifique os dados e tente novamente");
      }
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      toast.error(`Erro ao adicionar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id: string, updatedTransaction: Partial<Transaction>) => {
    try {
      setLoading(true);
      const success = await updateTransactionInSupabase(id, updatedTransaction);
      
      if (success) {
        setTransactions(prev =>
          prev.map(transaction =>
            transaction.id === id
              ? { ...transaction, ...updatedTransaction }
              : transaction
          )
        );
        toast.success("Transação atualizada com sucesso");
      } else {
        toast.error("Erro ao atualizar transação");
      }
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      toast.error("Erro ao atualizar transação");
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      const success = await deleteTransactionFromSupabase(id);
      
      if (success) {
        setTransactions(prev => prev.filter(transaction => transaction.id !== id));
        toast.success("Transação excluída com sucesso");
      } else {
        toast.error("Erro ao excluir transação");
      }
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      toast.error("Erro ao excluir transação");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactionsForMonth,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
} 