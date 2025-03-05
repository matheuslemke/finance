export type TransactionType = "income" | "expense";

export type TransactionClass = 
  | "essential" 
  | "investment" 
  | "income" 
  | "non-essential"
  | "business";

export type AccountType = 
  | "checking" 
  | "savings" 
  | "credit_card" 
  | "investment" 
  | "cash" 
  | "digital_wallet";

export interface Category {
  id: string;
  name: string;
  type: TransactionType | "both"; // income, expense ou both
  color?: string;
  icon?: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution?: string;
  color?: string;
  icon?: string;
  balance?: number;
  creditLimit?: number;
  closingDay?: number; // Dia de fechamento (para cartões de crédito)
  dueDay?: number; // Dia de vencimento (para cartões de crédito)
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: Date;
  description: string;
  category: string; // Nome da categoria (para compatibilidade)
  categoryId: string; // ID da categoria relacionada
  categoryColor?: string; // Cor da categoria
  account: string; // Nome da conta (para compatibilidade)
  accountId: string; // ID da conta relacionada
  accountColor?: string; // Cor da conta
  weddingCategory?: string;
  class: TransactionClass;
  amount: number;
}

export const DEFAULT_CATEGORIES = {
  income: [
    "Salário",
    "Freelance",
    "Investimentos",
    "Presentes",
    "Outras Receitas"
  ],
  expense: [
    "Moradia",
    "Alimentação",
    "Transporte",
    "Serviços",
    "Saúde",
    "Entretenimento",
    "Compras",
    "Educação",
    "Cuidados Pessoais",
    "Dívidas",
    "Poupança",
    "Outras Despesas"
  ]
};

export const DEFAULT_ACCOUNTS = [
  "Dinheiro",
  "Conta Corrente",
  "Conta Poupança",
  "Cartão de Crédito",
  "Conta de Investimento"
];

export const DEFAULT_WEDDING_CATEGORIES = [
  "Local",
  "Buffet",
  "Fotografia",
  "Vestuário",
  "Decoração",
  "Música",
  "Convites",
  "Presentes",
  "Transporte",
  "Lua de Mel"
]; 