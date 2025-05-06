import { Transaction } from '@/types';
import { supabase, transactionsTable } from './client';

export async function fetchTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
  let query = supabase
    .from(transactionsTable)
    .select(`
      *,
      categories:category_id (id, name, type, color),
      accounts:account_id (id, name, type, color),
      destinationAccounts:destination_account_id (id, name, type, color)
    `);
  
  if (startDate) {
    query = query.gte('date', startDate.toISOString());
  }
  
  if (endDate) {
    query = query.lte('date', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar transações:', JSON.stringify(error, null, 2));
    return [];
  }

  return (data || []).map(transaction => {
    const { 
      wedding_category, 
      categories, 
      category_id, 
      accounts, 
      account_id, 
      destinationAccounts,
      destination_account_id,
      invoice_id,
      ...rest 
    } = transaction;
    
    return {
      ...rest,
      date: new Date(transaction.date),
      weddingCategory: wedding_category,
      category: categories?.name || '',
      categoryId: category_id,
      categoryColor: categories?.color || '',
      account: accounts?.name || '',
      accountId: account_id,
      accountColor: accounts?.color || '',
      destinationAccount: destinationAccounts?.name || '',
      destinationAccountId: destination_account_id || '',
      destinationAccountColor: destinationAccounts?.color || '',
      invoice_id: invoice_id || undefined,
    };
  });
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
  if (transaction.amount <= 0) {
    console.error('Erro de validação: O valor da transação deve ser maior que zero');
    return null;
  }

  // Create a new object with only the fields we want to send to the database
  const formattedTransaction = {
    type: transaction.type,
    description: transaction.description,
    amount: transaction.amount,
    class: transaction.class,
    date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
    wedding_category: transaction.weddingCategory,
    category_id: transaction.categoryId,
    account_id: transaction.accountId,
    destination_account_id: transaction.destinationAccountId,
    invoice_id: transaction.invoice_id
  };
  
  console.log('Sending transaction to Supabase:', JSON.stringify(formattedTransaction, null, 2));
  
  const { data, error } = await supabase
    .from(transactionsTable)
    .insert([formattedTransaction])
    .select(`
      *,
      categories:category_id (id, name, type, color),
      accounts:account_id (id, name, type, color),
      destinationAccounts:destination_account_id (id, name, type, color)
    `)
    .single();

  if (error) {
    console.error('Erro ao adicionar transação:', JSON.stringify(error, null, 2));
    return null;
  }

  const { 
    wedding_category, 
    categories, 
    category_id, 
    accounts, 
    account_id,
    destinationAccounts,
    destination_account_id,
    invoice_id,
    ...restData 
  } = data;
  
  return {
    ...restData,
    date: new Date(data.date),
    weddingCategory: wedding_category,
    category: categories?.name || '',
    categoryId: category_id,
    categoryColor: categories?.color || '',
    account: accounts?.name || '',
    accountId: account_id,
    accountColor: accounts?.color || '',
    destinationAccount: destinationAccounts?.name || '',
    destinationAccountId: destination_account_id || '',
    destinationAccountColor: destinationAccounts?.color || '',
    invoice_id: invoice_id || undefined,
  };
}

export async function updateTransaction(id: string, transaction: Partial<Transaction>): Promise<boolean> {
  // Create a new object with only the fields we want to send to the database
  const formattedTransaction = {
    ...(transaction.type !== undefined && { type: transaction.type }),
    ...(transaction.description !== undefined && { description: transaction.description }),
    ...(transaction.amount !== undefined && { amount: transaction.amount }),
    ...(transaction.class !== undefined && { class: transaction.class }),
    ...(transaction.date !== undefined && { 
      date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date 
    }),
    ...(transaction.weddingCategory !== undefined && { wedding_category: transaction.weddingCategory }),
    ...(transaction.categoryId !== undefined && { category_id: transaction.categoryId }),
    ...(transaction.accountId !== undefined && { account_id: transaction.accountId }),
    ...(transaction.destinationAccountId !== undefined && { destination_account_id: transaction.destinationAccountId }),
    ...(transaction.invoice_id !== undefined && { invoice_id: transaction.invoice_id })
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