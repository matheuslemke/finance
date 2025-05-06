import { parse } from 'papaparse';
import { Transaction, TransactionClass, TransactionType } from '@/types';

export interface GenericTransaction {
  date: string;
  description: string;
  amount: string;
  category?: string;
  class?: TransactionClass;
}

/**
 * Importador genérico para qualquer formato padrão
 * Formato CSV com cabeçalhos date, description, amount
 */
export class GenericImporter {
  public static parseCSV(csvContent: string): GenericTransaction[] {
    const result = parse<GenericTransaction>(csvContent, {
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
    // Try to handle different date formats
    try {
      // Check if it's in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      // Check if it's in DD/MM/YYYY format
      else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
      // Check if it's in MM/DD/YYYY format
      else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [month, day, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
      // Default fallback
      else {
        return new Date(dateString);
      }
    } catch (e) {
      console.error('Error parsing date:', e);
      return new Date();
    }
  }

  private static formatAmount(amountString: string): number {
    // Remove any non-numeric characters except for decimal point and minus sign
    const sanitized = amountString.replace(/[^\d.-]/g, '');
    return Math.abs(parseFloat(sanitized));
  }

  private static determineTransactionType(amountString: string): TransactionType {
    // Check if the original amount had a minus sign
    const value = parseFloat(amountString.replace(/[^\d.-]/g, ''));
    return value < 0 ? 'expense' : 'income';
  }

  public static convertToTransactions(
    genericTransactions: GenericTransaction[],
    accountId: string,
    accountName: string,
    accountColor?: string,
    invoiceId?: string
  ): Omit<Transaction, 'id'>[] {
    return genericTransactions
      .filter(transaction => transaction.category && transaction.class)
      .map(transaction => {
        const type = this.determineTransactionType(transaction.amount);
        const amount = this.formatAmount(transaction.amount);
        const date = this.formatDate(transaction.date);

        return {
          type,
          date,
          description: transaction.description,
          category: transaction.category!,
          categoryId: '',
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