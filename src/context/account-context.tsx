"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Account } from "@/types";
import { fetchAccounts, addAccount as addAccountToSupabase, updateAccount as updateAccountInSupabase, deleteAccount as deleteAccountFromSupabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AccountContextType {
  accounts: Account[];
  loading: boolean;
  addAccount: (account: Omit<Account, "id">) => Promise<Account | null>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountProvider");
  }
  return context;
}

interface AccountProviderProps {
  children: ReactNode;
}

export function AccountProvider({ children }: AccountProviderProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
      if (isClient) {
        toast.error("Não foi possível carregar as contas");
      }
    } finally {
      setLoading(false);
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      loadAccounts();
    }
  }, [isClient, loadAccounts]);

  const addAccount = async (account: Omit<Account, "id">) => {
    try {
      setLoading(true);
      const newAccount = await addAccountToSupabase(account);
      
      if (newAccount) {
        setAccounts(prev => [...prev, newAccount]);
        if (isClient) {
          toast.success("Conta adicionada com sucesso");
        }
        return newAccount;
      } else {
        if (isClient) {
          toast.error("Erro ao adicionar conta");
        }
        return null;
      }
    } catch (error) {
      console.error("Erro ao adicionar conta:", error);
      if (isClient) {
        toast.error("Erro ao adicionar conta");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (id: string, updatedAccount: Partial<Account>) => {
    try {
      setLoading(true);
      const success = await updateAccountInSupabase(id, updatedAccount);
      
      if (success) {
        setAccounts(prev =>
          prev.map(account =>
            account.id === id
              ? { ...account, ...updatedAccount }
              : account
          )
        );
        if (isClient) {
          toast.success("Conta atualizada com sucesso");
        }
      } else {
        if (isClient) {
          toast.error("Erro ao atualizar conta");
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar conta:", error);
      if (isClient) {
        toast.error("Erro ao atualizar conta");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      setLoading(true);
      const success = await deleteAccountFromSupabase(id);
      
      if (success) {
        setAccounts(prev => prev.filter(account => account.id !== id));
        if (isClient) {
          toast.success("Conta excluída com sucesso");
        }
      } else {
        if (isClient) {
          toast.error("Erro ao excluir conta");
        }
      }
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      if (isClient) {
        toast.error("Erro ao excluir conta");
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
} 