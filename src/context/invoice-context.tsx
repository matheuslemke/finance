"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { Invoice } from "@/types";
import { fetchInvoices, fetchInvoiceById } from "@/lib/supabase";
import { toast } from "sonner";

interface InvoiceContextType {
  invoices: Invoice[];
  loading: boolean;
  fetchInvoiceDetails: (id: string) => Promise<Invoice | null>;
  getFilteredInvoices: (month: number, year: number) => Invoice[];
  currentPeriod: { month: number; year: number };
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

interface InvoiceCache {
  [key: string]: Invoice[];
}

export function InvoiceProvider({ children }: InvoiceProviderProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceCache, setInvoiceCache] = useState<InvoiceCache>({});
  const [loading, setLoading] = useState(true);
  const [requestedPeriod, setRequestedPeriod] = useState<{ month: number; year: number }>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  
  const loadInvoicesForPeriod = useCallback(async (month: number, year: number) => {
    const cacheKey = `${month}-${year}`;
    
    if (invoiceCache[cacheKey]) {
      setInvoices(invoiceCache[cacheKey]);
      return;
    }
    
    try {
      setLoading(true);
      const data = await fetchInvoices(month, year);
      
      setInvoiceCache(prev => ({
        ...prev,
        [cacheKey]: data
      }));
      
      setInvoices(data);
    } catch (error) {
      console.error("Erro ao carregar faturas:", error);
      toast.error("Não foi possível carregar as faturas");
    } finally {
      setLoading(false);
    }
  }, [invoiceCache]);

  useEffect(() => {
    loadInvoicesForPeriod(requestedPeriod.month, requestedPeriod.year);
  }, [requestedPeriod, loadInvoicesForPeriod]);

  const getFilteredInvoices = useCallback((month: number, year: number) => {
    const cacheKey = `${month}-${year}`;
    
    if (invoiceCache[cacheKey]) {
      return invoiceCache[cacheKey];
    }
    
    // Em vez de chamar loadInvoicesForPeriod diretamente, atualizamos o requestedPeriod
    setRequestedPeriod({ month, year });
    
    // Retorna um array vazio ou o que temos no momento
    return [];
  }, [invoiceCache]);

  const fetchInvoiceDetails = useCallback(async (id: string): Promise<Invoice | null> => {
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
  }, []);

  const value = useMemo(() => ({
    invoices,
    loading,
    fetchInvoiceDetails,
    getFilteredInvoices,
    currentPeriod: requestedPeriod
  }), [invoices, loading, fetchInvoiceDetails, getFilteredInvoices, requestedPeriod]);

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
} 