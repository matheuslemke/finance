import { Invoice, Transaction } from "@/types";
import { supabase, invoicesTable, transactionsTable } from "./client";

export async function fetchInvoices(
  month?: number,
  year?: number
): Promise<Invoice[]> {
  let query = supabase.from(invoicesTable).select(`
      *,
      accounts:account_id (id, name, type, color)
    `);

  if (month !== undefined && year !== undefined) {
    query = query.eq("month", month).eq("year", year);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar faturas:", JSON.stringify(error, null, 2));
    return [];
  }

  const invoices = (data || []).map((invoice) => {
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

  for (const invoice of invoices) {
    const { data: transactionsData, error: transactionsError } = await supabase
      .from(transactionsTable)
      .select(
        `
        *,
        categories:category_id (id, name, type, color),
        accounts:account_id (id, name, type, color)
      `
      )
      .eq("invoice_id", invoice.id);

    if (transactionsError) {
      console.error(
        "Erro ao buscar transações da fatura:",
        JSON.stringify(transactionsError, null, 2)
      );
      continue;
    }

    invoice.transactions = (transactionsData || []).map((transaction) => {
      const {
        wedding_category,
        categories,
        category_id,
        accounts,
        account_id,
        ...rest
      } = transaction;
      return {
        ...rest,
        date: new Date(transaction.date),
        weddingCategory: wedding_category,
        category: categories?.name || "",
        categoryId: category_id,
        categoryColor: categories?.color || "",
        account: accounts?.name || "",
        accountId: account_id,
        accountColor: accounts?.color || "",
      } as Transaction;
    });
  }

  return invoices;
}

export async function fetchInvoiceById(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from(invoicesTable)
    .select(
      `
      *,
      accounts:account_id (id, name, type, color)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar fatura:", JSON.stringify(error, null, 2));
    return null;
  }

  if (!data) return null;

  const { accounts, account_id, due_day, ...rest } = data;
  const invoice: Invoice = {
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
  };

  // Fetch transactions for this invoice
  const { data: transactionsData, error: transactionsError } = await supabase
    .from(transactionsTable)
    .select(
      `
      *,
      categories:category_id (id, name, type, color),
      accounts:account_id (id, name, type, color)
    `
    )
    .eq("invoice_id", invoice.id);

  if (transactionsError) {
    console.error(
      "Erro ao buscar transações da fatura:",
      JSON.stringify(transactionsError, null, 2)
    );
  } else {
    invoice.transactions = (transactionsData || []).map((transaction) => {
      const {
        wedding_category,
        categories,
        category_id,
        accounts,
        account_id,
        ...rest
      } = transaction;
      return {
        ...rest,
        date: new Date(transaction.date),
        weddingCategory: wedding_category,
        category: categories?.name || "",
        categoryId: category_id,
        categoryColor: categories?.color || "",
        account: accounts?.name || "",
        accountId: account_id,
        accountColor: accounts?.color || "",
      } as Transaction;
    });
  }

  return invoice;
}
