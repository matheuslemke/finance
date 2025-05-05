import { TransactionClass } from "@/types";

interface MappingRule {
  pattern: string | RegExp;
  categoryId: string;
  categoryName: string;
  class: TransactionClass;
}

export interface MappingResult {
  categoryId: string;
  class: TransactionClass;
}

// Define mapping rules for common transactions
const mappingRules: MappingRule[] = [
  {
    pattern: "Transferência de saldo NuInvest",
    categoryId: "76bf71fc-4480-4708-a99a-433ae3d2c199",
    categoryName: "Rendimentos",
    class: "income"
  },
  {
    pattern: /Transferência recebida pelo Pix.*A M LEMKE/i,
    categoryId: "9979b839-65b2-43f6-b402-b7efb64a6acc",
    categoryName: "Salário",
    class: "income"
  },
  {
    pattern: /Transferência enviada pelo Pix.*Igreja Presbiteriana/i,
    categoryId: "e9fad893-7e3b-464f-873e-9955fc2a48b1",
    categoryName: "Reino",
    class: "essential"
  },
  {
    pattern: /Transferência enviada pelo Pix.*Thalita Fernandes/i,
    categoryId: "84fc85fa-9925-43eb-819b-cdaa862d2629",
    categoryName: "Assinaturas e serviços",
    class: "essential"
  }
];

/**
 * Check if a transaction description matches any of the defined mapping rules
 * @param description The transaction description to check
 * @returns The mapping result or undefined if no match found
 */
export function mapTransactionByDescription(description: string): MappingResult | undefined {
  for (const rule of mappingRules) {
    const pattern = rule.pattern;
    const matches = typeof pattern === 'string' 
      ? description.includes(pattern)
      : pattern.test(description);
      
    if (matches) {
      return {
        categoryId: rule.categoryId,
        class: rule.class
      };
    }
  }
  
  return undefined;
}

/**
 * Add a new mapping rule
 * @param rule The mapping rule to add
 */
export function addMappingRule(rule: MappingRule): void {
  mappingRules.push(rule);
}

/**
 * Get all mapping rules
 * @returns Array of all mapping rules
 */
export function getAllMappingRules(): MappingRule[] {
  return [...mappingRules];
} 