import { Category } from '@/types';
import { supabase, categoriesTable, transactionsTable } from './client';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from(categoriesTable)
    .select('*')
    .order('name');

  if (error) {
    console.error('Erro ao buscar categorias:', JSON.stringify(error, null, 2));
    return [];
  }

  return data || [];
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<Category | null> {
  const { data, error } = await supabase
    .from(categoriesTable)
    .insert([category])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar categoria:', JSON.stringify(error, null, 2));
    return null;
  }

  return data;
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<boolean> {
  const { error } = await supabase
    .from(categoriesTable)
    .update(category)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar categoria:', JSON.stringify(error, null, 2));
    return false;
  }

  return true;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { data: transactions, error: checkError } = await supabase
    .from(transactionsTable)
    .select('id')
    .eq('category_id', id)
    .limit(1);

  if (checkError) {
    console.error('Erro ao verificar uso da categoria:', JSON.stringify(checkError, null, 2));
    return false;
  }

  if (transactions && transactions.length > 0) {
    console.error('Não é possível excluir: categoria está sendo usada em transações');
    return false;
  }

  const { error } = await supabase
    .from(categoriesTable)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir categoria:', JSON.stringify(error, null, 2));
    return false;
  }

  return true;
} 