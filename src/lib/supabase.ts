import { createClient } from '@supabase/supabase-js';
import { Transaction, Category } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const transactionsTable = 'transactions';
export const categoriesTable = 'categories';

// Funções para gerenciar categorias
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
  // Verificar se a categoria está sendo usada em alguma transação
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

// Funções para gerenciar transações
export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from(transactionsTable)
    .select(`
      *,
      categories:category_id (id, name, type, color)
    `);

  if (error) {
    console.error('Erro ao buscar transações:', JSON.stringify(error, null, 2));
    return [];
  }

  return (data || []).map(transaction => {
    const { wedding_category, categories, category_id, ...rest } = transaction;
    return {
      ...rest,
      date: new Date(transaction.date),
      weddingCategory: wedding_category,
      category: categories?.name || '',
      categoryId: category_id,
      categoryColor: categories?.color || ''
    };
  });
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
  if (transaction.amount <= 0) {
    console.error('Erro de validação: O valor da transação deve ser maior que zero');
    return null;
  }

  const { weddingCategory, category, categoryId, categoryColor, ...rest } = transaction;
  
  const formattedTransaction = {
    ...rest,
    date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
    wedding_category: weddingCategory,
    category_id: categoryId
  };
  
  console.log('Sending transaction to Supabase:', JSON.stringify(formattedTransaction, null, 2));
  
  const { data, error } = await supabase
    .from(transactionsTable)
    .insert([formattedTransaction])
    .select(`
      *,
      categories:category_id (id, name, type, color)
    `)
    .single();

  if (error) {
    console.error('Erro ao adicionar transação:', JSON.stringify(error, null, 2));
    return null;
  }

  const { wedding_category, categories, category_id, ...restData } = data;
  
  return {
    ...restData,
    date: new Date(data.date),
    weddingCategory: wedding_category,
    category: categories?.name || '',
    categoryId: category_id,
    categoryColor: categories?.color || ''
  };
}

export async function updateTransaction(id: string, transaction: Partial<Transaction>): Promise<boolean> {
  const { weddingCategory, category, categoryId, categoryColor, ...rest } = transaction;
  
  const formattedTransaction = {
    ...rest,
    date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
    ...(weddingCategory !== undefined && { wedding_category: weddingCategory }),
    ...(categoryId !== undefined && { category_id: categoryId })
  };

  const { error } = await supabase
    .from(transactionsTable)
    .update(formattedTransaction)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar transação:', JSON.stringify(error, null, 2));
    return false;
  }

  return true;
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const { error } = await supabase
    .from(transactionsTable)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir transação:', error);
    return false;
  }

  return true;
}