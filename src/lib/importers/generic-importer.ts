import { TransactionType, TransactionClass } from "@/types";

interface GenericTransactionRow {
  date: string;
  description: string;
  amount: string;
  category?: string;
  type?: string;
  [key: string]: unknown;
}

// Generic CSV parser that assumes columns:
// date, description, amount (and optionally category, type)
export const GenericImporter = {
  parseCSV(csvContent: string): GenericTransactionRow[] {
    try {
      const lines = csvContent.split('\n');
      
      // Find header line
      const headerLine = lines.find(line => 
        line.toLowerCase().includes('date') || 
        line.toLowerCase().includes('data') ||
        line.toLowerCase().includes('description') ||
        line.toLowerCase().includes('amount') ||
        line.toLowerCase().includes('valor')
      );
      
      if (!headerLine) {
        throw new Error("O arquivo CSV não possui um cabeçalho reconhecível");
      }
      
      // Extract header
      const header = headerLine.split(',').map(h => h.trim().toLowerCase());
      
      // Find the indexes of required columns
      const dateIndex = header.findIndex(h => h.includes('date') || h.includes('data'));
      const descriptionIndex = header.findIndex(h => 
        h.includes('description') || 
        h.includes('descrição') || 
        h.includes('descricao')
      );
      const amountIndex = header.findIndex(h => 
        h.includes('amount') || 
        h.includes('valor') || 
        h.includes('value')
      );
      
      // Optional columns
      const categoryIndex = header.findIndex(h => 
        h.includes('category') || 
        h.includes('categoria')
      );
      const typeIndex = header.findIndex(h => 
        h.includes('type') || 
        h.includes('tipo')
      );
      
      if (dateIndex === -1 || descriptionIndex === -1 || amountIndex === -1) {
        throw new Error("O arquivo CSV não possui as colunas necessárias (data, descrição, valor)");
      }
      
      // Skip header and empty lines
      const dataLines = lines
        .filter((line, index) => index !== lines.indexOf(headerLine) && line.trim() !== '');
      
      return dataLines.map(line => {
        const columns = line.split(',').map(col => col.trim());
        
        const row: GenericTransactionRow = {
          date: columns[dateIndex],
          description: columns[descriptionIndex],
          amount: columns[amountIndex],
        };
        
        // Add optional columns if available
        if (categoryIndex !== -1) {
          row.category = columns[categoryIndex];
        }
        
        if (typeIndex !== -1) {
          row.type = columns[typeIndex];
        }
        
        return row;
      });
    } catch (error) {
      console.error("Error parsing CSV:", error);
      throw new Error("Erro ao processar o arquivo CSV. Verifique o formato.");
    }
  },
  
  convertToTransactions(
    parsedTransactions: GenericTransactionRow[],
    accountId: string,
    accountName: string,
    accountColor?: string
  ) {
    return parsedTransactions.map(transaction => {
      // Parse date (assuming standard formats)
      const dateParts = transaction.date.split(/[-\/\.]/);
      let date;
      
      // Try different date formats
      if (dateParts.length === 3) {
        // Assume year is last or first depending on length
        const yearIndex = dateParts[0].length === 4 ? 0 : 2;
        const dayIndex = yearIndex === 0 ? 2 : 0;
        const monthIndex = 1;
        
        // JavaScript months are 0-indexed
        date = new Date(
          parseInt(dateParts[yearIndex]), 
          parseInt(dateParts[monthIndex]) - 1, 
          parseInt(dateParts[dayIndex])
        );
      } else {
        // Fallback to current date if parsing fails
        date = new Date();
      }
      
      // Parse amount
      const amount = parseFloat(transaction.amount.replace(/[^\d.-]/g, '') || '0');
      const isNegative = transaction.amount.includes('-') || amount < 0;
      
      // Determine transaction type based on amount sign or explicit type
      let type: TransactionType;
      if (transaction.type) {
        if (transaction.type.toLowerCase().includes('income') || transaction.type.toLowerCase().includes('receita')) {
          type = "income";
        } else if (transaction.type.toLowerCase().includes('transfer') || transaction.type.toLowerCase().includes('transferência')) {
          type = "transfer";
        } else {
          type = "expense";
        }
      } else {
        type = isNegative ? "expense" : "income";
      }
      
      // Use provided category or default by type
      const category = transaction.category || (type === "income" ? "Outras Receitas" : "Outras Despesas");
      
      // Default class based on type
      const transactionClass: TransactionClass = 
        type === "income" ? "income" :
        type === "transfer" ? "essential" : "essential";
      
      return {
        type,
        date,
        description: transaction.description,
        category,
        categoryId: "",
        accountId,
        account: accountName,
        accountColor,
        class: transactionClass,
        amount: Math.abs(amount),
      };
    });
  }
}; 