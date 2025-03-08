import { Transaction } from '@/types';
import { supabase, transactionsTable } from './client';

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from(transactionsTable)
    .select(`
      *,
      categories:category_id (id, name, type, color),
      accounts:account_id (id, name, type, color)
    `);

  if (error) {
    console.error('Erro ao buscar transações:', JSON.stringify(error, null, 2));
    return [];
  }

  return (data || []).map(transaction => {
    const { wedding_category, categories, category_id, accounts, account_id, ...rest } = transaction;
    return {
      ...rest,
      date: new Date(transaction.date),
      weddingCategory: wedding_category,
      category: categories?.name || '',
      categoryId: category_id,
      categoryColor: categories?.color || '',
      account: accounts?.name || '',
      accountId: account_id,
      accountColor: accounts?.color || ''
    };
  });
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
  if (transaction.amount <= 0) {
    console.error('Erro de validação: O valor da transação deve ser maior que zero');
    return null;
  }

  const { weddingCategory, categoryId, accountId, ...rest } = transaction;
  
  const formattedTransaction = {
    ...rest,
    date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
    wedding_category: weddingCategory,
    category_id: categoryId,
    account_id: accountId
  };
  
  console.log('Sending transaction to Supabase:', JSON.stringify(formattedTransaction, null, 2));
  
  const { data, error } = await supabase
    .from(transactionsTable)
    .insert([formattedTransaction])
    .select(`
      *,
      categories:category_id (id, name, type, color),
      accounts:account_id (id, name, type, color)
    `)
    .single();

  if (error) {
    console.error('Erro ao adicionar transação:', JSON.stringify(error, null, 2));
    return null;
  }

  const { wedding_category, categories, category_id, accounts, account_id, ...restData } = data;
  
  return {
    ...restData,
    date: new Date(data.date),
    weddingCategory: wedding_category,
    category: categories?.name || '',
    categoryId: category_id,
    categoryColor: categories?.color || '',
    account: accounts?.name || '',
    accountId: account_id,
    accountColor: accounts?.color || ''
  };
}

export async function updateTransaction(id: string, transaction: Partial<Transaction>): Promise<boolean> {
  const { weddingCategory, categoryId, accountId, ...rest } = transaction;
  
  const formattedTransaction = {
    ...rest,
    date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
    ...(weddingCategory !== undefined && { wedding_category: weddingCategory }),
    ...(categoryId !== undefined && { category_id: categoryId }),
    ...(accountId !== undefined && { account_id: accountId })
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