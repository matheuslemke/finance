"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Transaction } from "@/types";

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
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

interface StoredTransaction extends Omit<Transaction, "date"> {
  date: string;
}

export function TransactionProvider({ children }: TransactionProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load transactions from localStorage on initial render
  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions");
    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions) as StoredTransaction[];
        // Convert string dates back to Date objects
        const formattedTransactions = parsedTransactions.map((transaction) => ({
          ...transaction,
          date: new Date(transaction.date),
        }));
        setTransactions(formattedTransactions);
      } catch (error) {
        console.error("Failed to parse transactions from localStorage:", error);
      }
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction]);
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id
          ? { ...transaction, ...updatedTransaction }
          : transaction
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
  };

  const value = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
} 