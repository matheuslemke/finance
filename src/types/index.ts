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
    "Salary",
    "Freelance",
    "Investments",
    "Gifts",
    "Other Income"
  ],
  expense: [
    "Housing",
    "Food",
    "Transportation",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Shopping",
    "Education",
    "Personal Care",
    "Debt",
    "Savings",
    "Other Expenses"
  ]
};

export const DEFAULT_ACCOUNTS = [
  "Cash",
  "Checking Account",
  "Savings Account",
  "Credit Card",
  "Investment Account"
];

export const DEFAULT_WEDDING_CATEGORIES = [
  "Venue",
  "Catering",
  "Photography",
  "Attire",
  "Decorations",
  "Music",
  "Invitations",
  "Gifts",
  "Transportation",
  "Honeymoon"
]; 