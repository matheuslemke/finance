"use client";

import { createContext, useContext, useState } from "react";
import { DividendEvent, Investment } from "@/types";

interface InvestmentsContextData {
  investments: Investment[];
  addInvestment: (investment: Investment) => void;
  updateInvestment: (investment: Investment) => void;
  removeInvestment: (id: string) => void;
  addInvestmentHistory: (investmentId: string, value: number) => void;
  addDividend: (dividend: DividendEvent) => void;
  removeDividend: (id: string) => void;
}

const InvestmentsContext = createContext<InvestmentsContextData>({} as InvestmentsContextData);

export function InvestmentsProvider({ children }: { children: React.ReactNode }) {
  const [investments, setInvestments] = useState<Investment[]>([]);

  const addInvestment = (investment: Investment) => {
    setInvestments((prev) => [...prev, investment]);
  };

  const updateInvestment = (investment: Investment) => {
    setInvestments((prev) =>
      prev.map((inv) => (inv.id === investment.id ? investment : inv))
    );
  };

  const removeInvestment = (id: string) => {
    setInvestments((prev) => prev.filter((inv) => inv.id !== id));
  };

  const addInvestmentHistory = (investmentId: string, value: number) => {
    setInvestments((prev) =>
      prev.map((inv) => {
        if (inv.id !== investmentId) return inv;

        const history = inv.history || [];
        const change = history.length > 0
          ? ((value - history[history.length - 1].value) / history[history.length - 1].value) * 100
          : ((value - inv.initialValue) / inv.initialValue) * 100;

        return {
          ...inv,
          currentValue: value,
          history: [
            ...history,
            {
              id: crypto.randomUUID(),
              investmentId,
              date: new Date(),
              value,
              change,
            },
          ],
        };
      })
    );
  };

  const addDividend = (dividend: DividendEvent) => {
    setInvestments((prev) =>
      prev.map((inv) => {
        if (inv.id !== dividend.investmentId) return inv;

        const dividends = inv.dividends || [];
        return {
          ...inv,
          dividends: [...dividends, dividend],
        };
      })
    );
  };

  const removeDividend = (id: string) => {
    setInvestments((prev) =>
      prev.map((inv) => {
        if (!inv.dividends?.some((div) => div.id === id)) return inv;

        return {
          ...inv,
          dividends: inv.dividends.filter((div) => div.id !== id),
        };
      })
    );
  };

  return (
    <InvestmentsContext.Provider
      value={{
        investments,
        addInvestment,
        updateInvestment,
        removeInvestment,
        addInvestmentHistory,
        addDividend,
        removeDividend,
      }}
    >
      {children}
    </InvestmentsContext.Provider>
  );
}

export function useInvestments() {
  const context = useContext(InvestmentsContext);

  if (!context) {
    throw new Error("useInvestments must be used within an InvestmentsProvider");
  }

  return context;
} 