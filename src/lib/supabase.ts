import { createClient } from '@supabase/supabase-js';
import { Transaction, Category, Account } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const transactionsTable = 'transactions';
export const categoriesTable = 'categories';
export const accountsTable = 'accounts';

// Funções para gerenciar contas
export async function fetchAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from(accountsTable)
    .select('*')
    .order('name');

  if (error) {
    console.error('Erro ao buscar contas:', JSON.stringify(error, null, 2));
    return [];
  }

  return (data || []).map(account => {
    const { closing_day, due_day, credit_limit, ...rest } = account;
    return {
      ...rest,
      closingDay: closing_day,
      dueDay: due_day,
      creditLimit: credit_limit
    };
  });
}

export async function addAccount(account: Omit<Account, 'id'>): Promise<Account | null> {
  const { closingDay, dueDay, creditLimit, ...rest } = account;
  
  const dbAccount = {
    ...rest,
    closing_day: closingDay,
    due_day: dueDay,
    credit_limit: creditLimit
  };

  const { data, error } = await supabase
    .from(accountsTable)
    .insert([dbAccount])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar conta:', JSON.stringify(error, null, 2));
    return null;
  }

  return data;
}

export async function updateAccount(id: string, account: Partial<Account>): Promise<boolean> {
  const { closingDay, dueDay, creditLimit, ...rest } = account;
  
  const dbAccount = {
    ...rest,
    ...(closingDay !== undefined && { closing_day: closingDay }),
    ...(dueDay !== undefined && { due_day: dueDay }),
    ...(creditLimit !== undefined && { credit_limit: creditLimit })
  };

  const { error } = await supabase
    .from(accountsTable)
    .update(dbAccount)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar conta:', JSON.stringify(error, null, 2));
    return false;
  }

  return true;
}

export async function deleteAccount(id: string): Promise<boolean> {
  // Verificar se a conta está sendo usada em alguma transação
  const { data: transactions, error: checkError } = await supabase
    .from(transactionsTable)
    .select('id')
    .eq('account_id', id)
    .limit(1);

  if (checkError) {
    console.error('Erro ao verificar uso da conta:', JSON.stringify(checkError, null, 2));
    return false;
  }

  if (transactions && transactions.length > 0) {
    console.error('Não é possível excluir: conta está sendo usada em transações');
    return false;
  }

  const { error } = await supabase
    .from(accountsTable)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir conta:', JSON.stringify(error, null, 2));
    return false;
  }

  return true;
}

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

  const { weddingCategory, category, categoryId, categoryColor, account, accountId, accountColor, ...rest } = transaction;
  
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
  const { weddingCategory, category, categoryId, categoryColor, account, accountId, accountColor, ...rest } = transaction;
  
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