import { Account } from '@/types';
import { supabase, accountsTable, transactionsTable } from './client';

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