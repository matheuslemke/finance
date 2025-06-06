export { supabase, transactionsTable, categoriesTable, accountsTable, invoicesTable } from './client';

export {
  fetchAccounts,
  addAccount,
  updateAccount,
  deleteAccount
} from './accounts';

export {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from './categories';

export {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
} from './transactions';

export {
  fetchInvoices,
  fetchInvoiceById
} from './invoices'; 