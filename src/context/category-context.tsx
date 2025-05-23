"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Category } from "@/types";
import { fetchCategories, addCategory as addCategoryToSupabase, updateCategory as updateCategoryInSupabase, deleteCategory as deleteCategoryFromSupabase } from "@/lib/supabase";
import { toast } from "sonner";

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  addCategory: (category: Omit<Category, "id">) => Promise<Category | null>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
}

interface CategoryProviderProps {
  children: ReactNode;
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      if (isClient) {
        toast.error("Não foi possível carregar as categorias");
      }
    } finally {
      setLoading(false);
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      loadCategories();
    }
  }, [isClient, loadCategories]);

  const addCategory = async (category: Omit<Category, "id">) => {
    try {
      setLoading(true);
      const newCategory = await addCategoryToSupabase(category);
      
      if (newCategory) {
        setCategories(prev => [...prev, newCategory]);
        if (isClient) {
          toast.success("Categoria adicionada com sucesso");
        }
        return newCategory;
      } else {
        if (isClient) {
          toast.error("Erro ao adicionar categoria: Verifique os dados e tente novamente");
        }
        return null;
      }
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      if (isClient) {
        toast.error(`Erro ao adicionar categoria: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, updatedCategory: Partial<Category>) => {
    try {
      setLoading(true);
      const success = await updateCategoryInSupabase(id, updatedCategory);
      
      if (success) {
        setCategories(prev =>
          prev.map(category =>
            category.id === id
              ? { ...category, ...updatedCategory }
              : category
          )
        );
        if (isClient) {
          toast.success("Categoria atualizada com sucesso");
        }
      } else {
        if (isClient) {
          toast.error("Erro ao atualizar categoria");
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      if (isClient) {
        toast.error("Erro ao atualizar categoria");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      const success = await deleteCategoryFromSupabase(id);
      
      if (success) {
        setCategories(prev => prev.filter(category => category.id !== id));
        if (isClient) {
          toast.success("Categoria excluída com sucesso");
        }
      } else {
        if (isClient) {
          toast.error("Erro ao excluir categoria. Verifique se ela não está sendo usada em transações.");
        }
      }
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      if (isClient) {
        toast.error("Erro ao excluir categoria");
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
} 