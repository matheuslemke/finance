import { parse } from 'papaparse';
import { Transaction, TransactionClass, TransactionType } from '@/types';

export interface InterTransaction {
  Data: string;
  Valor: string;
  Tipo: string;
  Descricao: string;
  category?: string;
  class?: TransactionClass;
}

export class InterImporter {
  public static parseCSV(csvContent: string): InterTransaction[] {
    const result = parse<InterTransaction>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      console.error('Errors parsing CSV:', result.errors);
      throw new Error('Erro ao analisar o arquivo CSV');
    }

    // Apply pre-processing to mark positive transactions as income
    const parsedData = result.data.map(transaction => {
      const isExpense = transaction.Tipo.toLowerCase().includes('saque') || 
                       transaction.Tipo.toLowerCase().includes('pagamento') || 
                       transaction.Tipo.toLowerCase().includes('transferência enviada');
      
      return {
        ...transaction,
        // Don't override existing class if it's already set
        class: transaction.class || (!isExpense ? 'income' as TransactionClass : undefined)
      };
    });

    return parsedData;
  }

  private static formatDate(dateString: string): Date {
    // Banco Inter date format: DD/MM/YYYY
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  private static formatAmount(amountString: string): number {
    // Remove any non-numeric characters except for decimal point and minus sign
    const sanitized = amountString.replace(/[^\d.-]/g, '').replace(',', '.');
    return Math.abs(parseFloat(sanitized));
  }

  private static determineTransactionType(typeString: string): TransactionType {
    // Check transaction type from Banco Inter
    return typeString.toLowerCase().includes('saque') || 
           typeString.toLowerCase().includes('pagamento') || 
           typeString.toLowerCase().includes('transferência enviada') 
      ? 'expense' 
      : 'income';
  }

  public static convertToTransactions(
    interTransactions: InterTransaction[],
    accountId: string,
    accountName: string,
    accountColor?: string
  ): Omit<Transaction, 'id'>[] {
    return interTransactions
      .filter(transaction => transaction.category && transaction.class) // Only include transactions with category and class
      .map(transaction => {
        const type = this.determineTransactionType(transaction.Tipo);
        const amount = this.formatAmount(transaction.Valor);
        const date = this.formatDate(transaction.Data);

        return {
          type,
          date,
          description: transaction.Descricao,
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