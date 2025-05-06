"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { Invoice } from "@/types";
import { fetchInvoices, fetchInvoiceById } from "@/lib/supabase";
import { toast } from "sonner";
import { supabase, invoicesTable } from "@/lib/supabase/client";

interface InvoiceContextType {
  invoices: Invoice[];
  loading: boolean;
  fetchInvoiceDetails: (id: string) => Promise<Invoice | null>;
  getFilteredInvoices: (month: number, year: number) => Invoice[];
  getAllInvoicesForAccount: (accountId: string) => Promise<Invoice[]>;
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

  const getAllInvoicesForAccount = useCallback(async (accountId: string): Promise<Invoice[]> => {
    try {
      setLoading(true);
      
      // Get all invoices for this account directly from Supabase
      const { data, error } = await supabase
        .from(invoicesTable)
        .select(`
          *,
          accounts:account_id (id, name, type, color)
        `)
        .eq("account_id", accountId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar faturas para a conta:", error);
        toast.error("Erro ao buscar faturas para a conta");
        return [];
      }
      
      // Convert to Invoice type
      return (data || []).map(invoice => {
        const { accounts, account_id, due_day, ...rest } = invoice;
        return {
          ...rest,
          account_id,
          account: accounts
            ? {
                id: accounts.id,
                name: accounts.name,
                type: accounts.type,
                color: accounts.color,
              }
            : undefined,
          due_day: new Date(due_day),
        } as Invoice;
      });
    } catch (error) {
      console.error("Erro ao buscar faturas para a conta:", error);
      toast.error("Erro ao buscar faturas para a conta");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

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
    getAllInvoicesForAccount,
    currentPeriod: requestedPeriod
  }), [invoices, loading, fetchInvoiceDetails, getFilteredInvoices, getAllInvoicesForAccount, requestedPeriod]);

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
} 