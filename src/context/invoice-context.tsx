"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Invoice } from "@/types";
import { fetchInvoices, fetchInvoiceById } from "@/lib/supabase";
import { toast } from "sonner";

interface InvoiceContextType {
  invoices: Invoice[];
  loading: boolean;
  fetchInvoiceDetails: (id: string) => Promise<Invoice | null>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoices must be used within a InvoiceProvider");
  }
  return context;
}

interface InvoiceProviderProps {
  children: ReactNode;
}

export function InvoiceProvider({ children }: InvoiceProviderProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      try {
        setLoading(true);
        const data = await fetchInvoices();
        setInvoices(data);
      } catch (error) {
        console.error("Erro ao carregar faturas:", error);
        toast.error("Não foi possível carregar as faturas");
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, []);

  const fetchInvoiceDetails = async (id: string): Promise<Invoice | null> => {
    try {
      setLoading(true);
      const invoice = await fetchInvoiceById(id);
      return invoice;
    } catch (error) {
      console.error("Erro ao buscar detalhes da fatura:", error);
      toast.error("Erro ao buscar detalhes da fatura");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    invoices,
    loading,
    fetchInvoiceDetails,
  };

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
} 