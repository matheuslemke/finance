export type TransactionType = "income" | "expense";

export type TransactionClass = 
  | "essential" 
  | "investment" 
  | "income" 
  | "non-essential"
  | "business";

export interface Transaction {
  id: string;
  type: TransactionType;
  date: Date;
  description: string;
  category: string;
  amount: number;
  account: string;
  weddingCategory?: string;
  class: TransactionClass;
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