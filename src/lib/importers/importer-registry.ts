import { NubankImporter } from "./nubank-importer";
import { InterImporter } from "./inter-importer";
import { GenericImporter } from "./generic-importer";
import { NubankCreditImporter } from "./nubank-credit-importer";
import { Transaction } from "@/types";

export interface TransactionImporter<T = unknown> {
  parseCSV(csvContent: string): T[];
  convertToTransactions(
    parsedTransactions: T[],
    accountId: string,
    accountName: string,
    accountColor?: string,
    invoiceId?: string | undefined
  ): Omit<Transaction, "id">[];
}

export interface ImporterInfo {
  id: string;
  name: string;
  description: string;
  institution: string;
  importer: TransactionImporter<unknown>;
  requiresInvoice?: boolean;
}

export const availableImporters: ImporterInfo[] = [
  {
    id: "nubank",
    name: "Nuconta",
    description: "Importar transações da conta corrente do Nubank",
    institution: "Nubank",
    importer: NubankImporter
  },
  {
    id: "nubank_credit",
    name: "Nubank crédito",
    description: "Importar transações do cartão de crédito do Nubank",
    institution: "Nubank",
    importer: NubankCreditImporter,
    requiresInvoice: true
  },
  {
    id: "inter",
    name: "Banco Inter",
    description: "Importar transações da conta ou cartão do Banco Inter",
    institution: "Banco Inter",
    importer: InterImporter
  },
  {
    id: "generic",
    name: "Importador Genérico",
    description: "Importar transações de qualquer fonte em formato CSV",
    institution: "Qualquer Banco",
    importer: GenericImporter
  }
];

export const getImporterById = (id: string): ImporterInfo | undefined => {
  return availableImporters.find(importer => importer.id === id);
}; 