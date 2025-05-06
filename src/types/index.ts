export type TransactionType = "income" | "expense" | "transfer";

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

export type AssetType = 
  | "fixed_income"    // Renda fixa: CDBs, LCIs, LCAs, etc
  | "stocks"          // Ações nacionais
  | "etf"             // ETFs nacionais
  | "foreign_stocks"  // Ações internacionais  
  | "foreign_etf"     // ETFs internacionais
  | "crypto"          // Criptomoedas
  | "real_estate"     // Imóveis/FIIs
  | "others";         // Outros investimentos

export type DividendType =
  | "dividend"        // Dividendo
  | "jcp"            // Juros sobre Capital Próprio
  | "return"         // Retorno de Capital
  | "subscription"   // Direito de Subscrição
  | "stock"          // Bonificação em Ações
  | "split"          // Desdobramento
  | "grouping"       // Grupamento
  | "income"         // Rendimento (FIIs)
  | "amortization";  // Amortização

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

export interface Investment {
  id: string;
  name: string;
  accountId: string;
  assetType: AssetType;
  ticker?: string;      // Código do ativo na B3
  quantity?: number;    // Quantidade de ações/cotas
  avgPrice?: number;    // Preço médio de compra
  initialValue: number;
  currentValue: number;
  purchaseDate: Date;
  expiryDate?: Date;
  notes?: string;
  history?: InvestmentHistory[];
  dividends?: DividendEvent[];
}

export interface InvestmentHistory {
  id: string;
  investmentId: string;
  date: Date;
  value: number;
  change: number;
}

export interface DividendEvent {
  id: string;
  investmentId: string;
  type: DividendType;
  announcementDate: Date;    // Data do Anúncio
  exDate: Date;             // Data Ex
  paymentDate: Date;        // Data do Pagamento
  baseValue: number;        // Valor por ação/cota
  totalValue: number;       // Valor total recebido
  quantity: number;         // Quantidade de ações/cotas consideradas
  notes?: string;          // Observações adicionais
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
  invoice_id?: string; // Reference to invoice
  destinationAccountId?: string; // ID da conta de destino (para transferências)
  destinationAccount?: string; // Nome da conta de destino
  destinationAccountColor?: string; // Cor da conta de destino
}

export interface Invoice {
  id: string;
  account_id: string;
  account?: Account;
  month: number;
  year: number;
  due_day: Date;
  transactions?: Transaction[];
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