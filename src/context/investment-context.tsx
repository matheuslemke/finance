"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Investment, InvestmentHistory } from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface InvestmentContextType {
  investments: Investment[];
  loading: boolean;
  addInvestment: (investment: Omit<Investment, "id">) => Promise<Investment | null>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  addInvestmentHistory: (investmentId: string, history: Omit<InvestmentHistory, "id" | "investmentId">) => Promise<void>;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export function useInvestments() {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error("useInvestments must be used within an InvestmentProvider");
  }
  return context;
}

interface InvestmentProviderProps {
  children: ReactNode;
}

export function InvestmentProvider({ children }: InvestmentProviderProps) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadInvestments = useCallback(async () => {
    try {
      setLoading(true);
      
      const mockInvestments: Investment[] = [
        {
          id: "1",
          name: "CDB Banco Inter",
          accountId: "1",
          assetType: "fixed_income",
          initialValue: 5000,
          currentValue: 5350,
          purchaseDate: new Date(2023, 5, 15),
          expiryDate: new Date(2024, 5, 15),
          history: [
            {
              id: "1",
              investmentId: "1",
              date: new Date(2023, 6, 15),
              value: 5050,
              change: 1
            },
            {
              id: "2",
              investmentId: "1",
              date: new Date(2023, 7, 15),
              value: 5125,
              change: 1.5
            },
            {
              id: "3",
              investmentId: "1",
              date: new Date(2023, 8, 15),
              value: 5225,
              change: 2
            },
            {
              id: "4",
              investmentId: "1",
              date: new Date(2023, 9, 15),
              value: 5350,
              change: 2.4
            }
          ]
        },
        {
          id: "2",
          name: "PETR4",
          accountId: "2",
          assetType: "stocks",
          initialValue: 2000,
          currentValue: 2320,
          purchaseDate: new Date(2023, 3, 10),
          history: [
            {
              id: "5",
              investmentId: "2",
              date: new Date(2023, 4, 10),
              value: 2050,
              change: 2.5
            },
            {
              id: "6",
              investmentId: "2",
              date: new Date(2023, 5, 10),
              value: 2150,
              change: 4.9
            },
            {
              id: "7",
              investmentId: "2",
              date: new Date(2023, 6, 10),
              value: 2320,
              change: 7.9
            }
          ]
        }
      ];
      
      setInvestments(mockInvestments);
    } catch (error) {
      console.error("Erro ao carregar investimentos:", error);
      if (isClient) {
        toast.error("Não foi possível carregar os investimentos");
      }
    } finally {
      setLoading(false);
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      loadInvestments();
    }
  }, [isClient, loadInvestments]);

  const addInvestment = async (investment: Omit<Investment, "id">) => {
    try {
      const newInvestment: Investment = {
        ...investment,
        id: uuidv4()
      };
      
      setInvestments(prev => [...prev, newInvestment]);
      if (isClient) {
        toast.success("Investimento adicionado com sucesso");
      }
      return newInvestment;
    } catch (error) {
      console.error("Erro ao adicionar investimento:", error);
      if (isClient) {
        toast.error("Erro ao adicionar investimento");
      }
      return null;
    }
  };

  const updateInvestment = async (id: string, updatedInvestment: Partial<Investment>) => {
    try {
      setInvestments(prev =>
        prev.map(investment =>
          investment.id === id
            ? { ...investment, ...updatedInvestment }
            : investment
        )
      );
      if (isClient) {
        toast.success("Investimento atualizado com sucesso");
      }
    } catch (error) {
      console.error("Erro ao atualizar investimento:", error);
      if (isClient) {
        toast.error("Erro ao atualizar investimento");
      }
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      setInvestments(prev => prev.filter(investment => investment.id !== id));
      if (isClient) {
        toast.success("Investimento excluído com sucesso");
      }
    } catch (error) {
      console.error("Erro ao excluir investimento:", error);
      if (isClient) {
        toast.error("Erro ao excluir investimento");
      }
    }
  };

  const addInvestmentHistory = async (investmentId: string, historyEntry: Omit<InvestmentHistory, "id" | "investmentId">) => {
    try {
      const newHistory: InvestmentHistory = {
        ...historyEntry,
        id: uuidv4(),
        investmentId
      };
      
      setInvestments(prev =>
        prev.map(investment => {
          if (investment.id === investmentId) {
            const history = [...(investment.history || []), newHistory];
            return {
              ...investment,
              history,
              currentValue: historyEntry.value
            };
          }
          return investment;
        })
      );
      
      if (isClient) {
        toast.success("Histórico de investimento atualizado");
      }
    } catch (error) {
      console.error("Erro ao adicionar histórico de investimento:", error);
      if (isClient) {
        toast.error("Erro ao adicionar histórico de investimento");
      }
    }
  };

  const value = {
    investments,
    loading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addInvestmentHistory
  };

  return (
    <InvestmentContext.Provider value={value}>
      {children}
    </InvestmentContext.Provider>
  );
} 