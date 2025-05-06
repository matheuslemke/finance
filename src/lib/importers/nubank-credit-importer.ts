import { parse } from 'papaparse';
import { Transaction, TransactionClass, TransactionType } from '@/types';

export interface NubankCreditTransaction {
  date: string;
  title: string;
  amount: string;
  category?: string;
  class?: TransactionClass;
}

/**
 * Importador para transações do cartão de crédito do Nubank
 * Formato CSV exportado da fatura do cartão de crédito do Nubank
 */
export class NubankCreditImporter {
  public static parseCSV(csvContent: string): NubankCreditTransaction[] {
    const result = parse<NubankCreditTransaction>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      console.error('Errors parsing CSV:', result.errors);
      throw new Error('Erro ao analisar o arquivo CSV');
    }

    return result.data;
  }

  private static formatDate(dateString: string): Date {
    // Nubank credit date format: YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private static formatAmount(amountString: string): number {
    // Remove any non-numeric characters except for decimal point and minus sign
    const sanitized = amountString.replace(/[^\d.-]/g, '');
    const amount = parseFloat(sanitized);
    
    // Ensure positive value for expenses, but invert sign if negative (e.g., payment received)
    if (amount < 0) {
      // If already negative (like payment received), make it positive
      return Math.abs(amount);
    } else {
      // Normal positive value (expense) remains positive
      return amount;
    }
  }

  public static convertToTransactions(
    nubankCreditTransactions: NubankCreditTransaction[],
    accountId: string,
    accountName: string,
    accountColor?: string,
    invoiceId?: string
  ): Omit<Transaction, 'id'>[] {
    return nubankCreditTransactions
      .filter(transaction => transaction.category && transaction.class)
      .map(transaction => {
        const amount = this.formatAmount(transaction.amount);
        const date = this.formatDate(transaction.date);
        
        // Determine if this is a payment (negative value in CSV)
        const isPayment = transaction.amount.includes('-') || parseFloat(transaction.amount) < 0;
        
        // For regular expenses, use 'expense' type
        // For payment received, use 'income' type
        const transactionType = isPayment ? 'income' as TransactionType : 'expense' as TransactionType;
        
        // Add "(Pagamento)" to description for payment transactions to make them easily identifiable
        const description = isPayment ? `${transaction.title} (Pagamento)` : transaction.title;

        return {
          type: transactionType,
          date,
          description,
          category: transaction.category!,
          categoryId: '', // Will be populated later
          account: accountName,
          accountId,
          accountColor,
          class: transaction.class!,
          amount,
          invoice_id: invoiceId
        };
      });
  }
} 