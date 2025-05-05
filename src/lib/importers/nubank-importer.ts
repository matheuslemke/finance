import { parse } from 'papaparse';
import { Transaction, TransactionClass, TransactionType } from '@/types';

export interface NubankTransaction {
  Data: string;
  Valor: string;
  Identificador: string;
  Descrição: string;
  category?: string;
  class?: TransactionClass;
}

export class NubankImporter {
  public static parseCSV(csvContent: string): NubankTransaction[] {
    const result = parse<NubankTransaction>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      console.error('Errors parsing CSV:', result.errors);
      throw new Error('Erro ao analisar o arquivo CSV');
    }

    // Apply pre-processing to mark positive transactions as income
    const parsedData = result.data.map(transaction => {
      const isPositive = !transaction.Valor.startsWith('-');
      return {
        ...transaction,
        // Don't override existing class if it's already set
        class: transaction.class || (isPositive ? 'income' as TransactionClass : undefined)
      };
    });

    return parsedData;
  }

  private static formatDate(dateString: string): Date {
    // Nubank date format: DD/MM/YYYY
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  private static formatAmount(amountString: string): number {
    // Remove any non-numeric characters except for decimal point and minus sign
    const sanitized = amountString.replace(/[^\d.-]/g, '');
    return Math.abs(parseFloat(sanitized));
  }

  private static determineTransactionType(amountString: string): TransactionType {
    // Check if the original amount had a minus sign
    return amountString.startsWith('-') ? 'expense' : 'income';
  }

  public static convertToTransactions(
    nubankTransactions: NubankTransaction[],
    accountId: string,
    accountName: string,
    accountColor?: string
  ): Omit<Transaction, 'id'>[] {
    return nubankTransactions
      .filter(transaction => transaction.category && transaction.class) // Only include transactions with category and class
      .map(transaction => {
        const type = this.determineTransactionType(transaction.Valor);
        const amount = this.formatAmount(transaction.Valor);
        const date = this.formatDate(transaction.Data);

        return {
          type,
          date,
          description: transaction.Descrição,
          category: transaction.category!,
          categoryId: '', // Will be populated later
          account: accountName,
          accountId,
          accountColor,
          class: transaction.class!,
          amount
        };
      });
  }
} 