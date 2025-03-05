import { createClient } from '@supabase/supabase-js';
import { Transaction } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const transactionsTable = 'transactions';

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from(transactionsTable)
    .select('*');

  if (error) {
    console.error('Erro ao buscar transações:', JSON.stringify(error, null, 2));
    return [];
  }

  return (data || []).map(transaction => {
    const { wedding_category, ...rest } = transaction;
    return {
      ...rest,
      date: new Date(transaction.date),
      weddingCategory: wedding_category
    };
  });
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
  if (transaction.amount <= 0) {
    console.error('Erro de validação: O valor da transação deve ser maior que zero');
    return null;
  }

  const { weddingCategory, ...rest } = transaction;
  
  const formattedTransaction = {
    ...rest,
    date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
    wedding_category: weddingCategory
  };
  
  console.log('Sending transaction to Supabase:', JSON.stringify(formattedTransaction, null, 2));
  
  const { data, error } = await supabase
    .from(transactionsTable)
    .insert([formattedTransaction])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar transação:', JSON.stringify(error, null, 2));
    return null;
  }

  return {
    ...data,
    date: new Date(data.date),
  };
}

export async function updateTransaction(id: string, transaction: Partial<Transaction>): Promise<boolean> {
  const { weddingCategory, ...rest } = transaction;
  
  const formattedTransaction = {
    ...rest,
    date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
    ...(weddingCategory !== undefined && { wedding_category: weddingCategory })
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