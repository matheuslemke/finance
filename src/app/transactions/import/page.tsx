"use client";

import { useState, useRef, useEffect, useMemo, memo, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { availableImporters, getImporterById } from "@/lib/importers/importer-registry";
import { useAccounts } from "@/context/account-context";
import { useCategories } from "@/context/category-context";
import { useTransactions } from "@/context/transaction-context";
import { Upload, FileText, AlertCircle, ChevronLeft, Save, Loader2, CreditCard, Info, Trash2, Check, MoreHorizontal, Edit, HeartHandshake, ArrowRightLeft } from "lucide-react";
import { TransactionClass, Account } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { mapTransactionByDescription } from "@/lib/importers/transaction-mapper";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { DEFAULT_WEDDING_CATEGORIES } from "@/types";
import { useInvoices } from "@/context/invoice-context";

interface ParsedTransaction {
  category?: string;
  categoryId?: string;
  class?: TransactionClass | string;
  isTransfer?: boolean;
  destinationAccountId?: string;
  sourceAccountId?: string;
  sourceAccount?: string;
  destinationAccount?: string;
  weddingCategory?: string;
  isWeddingRelated?: boolean;
  [key: string]: unknown;
}

// Import or define Category interface
interface Category {
  id: string;
  name: string;
}

const classOptions: Record<TransactionClass, string> = {
  "essential": "Essencial",
  "non-essential": "Não Essencial",
  "investment": "Investimento",
  "income": "Receita",
  "business": "PJ"
};

// Create a memoized transaction row component
interface TransactionRowProps {
  transaction: ParsedTransaction;
  index: number;
  selectedImporterId: string;
  onStartEditing: (index: number, value: string) => void;
  onDelete: (index: number) => void;
  categories: Category[];
  classOptions: Record<TransactionClass, string>;
  accounts: Account[];
  onCategoryChange: (index: number, value: string) => void;
  onClassChange: (index: number, value: TransactionClass) => void;
  setTransferModalState: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    index: number | null;
    isIncoming: boolean;
    sourceAccountId: string;
    destinationAccountId: string;
  }>>;
  setParsedTransactions: React.Dispatch<React.SetStateAction<ParsedTransaction[]>>;
  setWeddingModalState: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    index: number | null;
  }>>;
}

const TransactionRow = memo(({ 
  transaction, 
  index, 
  selectedImporterId,
  onStartEditing,
  onDelete,
  categories,
  classOptions,
  accounts,
  onCategoryChange,
  onClassChange,
  setTransferModalState,
  setParsedTransactions,
  setWeddingModalState
}: TransactionRowProps) => {
  // Performance monitoring
  console.log(`Rendering row ${index}`);
  
  // Get transaction data
  let transactionData;
  
  if (selectedImporterId === "nubank") {
    transactionData = {
      date: String(transaction.Data || ""),
      description: String(transaction.Descrição || ""),
      value: String(transaction.Valor || "0"),
      isNegative: typeof transaction.Valor === 'string' && transaction.Valor.startsWith('-')
    };
  } else if (selectedImporterId === "nubank_credit") {
    // Check if this is a payment (they start with 'Pagamento' or have '(Pagamento)' suffix)
    const isPayment = 
      String(transaction.title || "").includes("Pagamento") || 
      String(transaction.amount || "").startsWith("-");
    
    transactionData = {
      date: String(transaction.date || ""),
      description: String(transaction.title || ""),
      value: String(transaction.amount || "0").replace("-", ""), // Remove minus sign for display
      isNegative: !isPayment // Regular credit transactions are displayed as negative (expenses), but payments as positive
    };
  } else if (selectedImporterId === "inter") {
    transactionData = {
      date: String(transaction.Data || ""),
      description: String(transaction.Descricao || ""),
      value: String(transaction.Valor || "0"),
      isNegative: typeof transaction.Tipo === 'string' && 
        (transaction.Tipo.toLowerCase().includes('saque') || 
         transaction.Tipo.toLowerCase().includes('pagamento') || 
         transaction.Tipo.toLowerCase().includes('transferência enviada'))
    };
  } else if (selectedImporterId === "generic") {
    transactionData = {
      date: String(transaction.date || ""),
      description: String(transaction.description || ""),
      value: String(transaction.amount || "0"),
      isNegative: typeof transaction.amount === 'string' && 
        (transaction.amount.startsWith('-') || parseFloat(transaction.amount) < 0)
    };
  } else {
    transactionData = {
      date: "Data não encontrada",
      description: "Descrição não encontrada",
      value: "0",
      isNegative: false
    };
  }
  
  console.log(`Transaction row data for index ${index}:`, transactionData);
  
  return (
    <tr className={transaction.categoryId || transaction.isTransfer ? "border-b bg-blue-50/50 dark:bg-blue-950/30" : "border-b"}>
      <td className="py-3 px-4 text-sm">
        {transactionData.date}
      </td>
      <td className="py-3 px-4 text-sm max-w-xs relative">
        <div className="flex items-center">
          {(transaction.categoryId && transaction.class) || (transaction.isTransfer && transaction.destinationAccountId) ? (
            <Check className="mr-2 flex-shrink-0 text-blue-500 h-3 w-3" aria-hidden="true" />
          ) : null}
          
          <div className="w-full flex justify-between items-center">
            <span 
              className="truncate cursor-pointer hover:underline" 
              title={transactionData.description}
              onClick={() => onStartEditing(index, transactionData.description)}
            >
              {transactionData.description}
            </span>
            
            {transaction.isWeddingRelated && (
              <div className="ml-2 px-1.5 py-0.5 bg-pink-100 text-pink-800 text-xs rounded-md flex items-center">
                <HeartHandshake className="h-3 w-3 mr-1" />
                <span className="truncate max-w-20">{transaction.weddingCategory}</span>
              </div>
            )}
          </div>
        </div>
      </td>
      <td className={`py-3 px-4 text-sm ${transactionData.isNegative ? 'text-red-500' : 'text-green-500'}`}>
        {transactionData.isNegative ? '-' : '+'}R${Math.abs(parseFloat(transactionData.value.replace(/[^\d.-]/g, '') || '0')).toFixed(2)}
      </td>
      <td className="py-3 px-4 text-sm">
        <div className="space-y-2">
          {transaction.isTransfer && transaction.sourceAccount && transaction.destinationAccount && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{transactionData.isNegative ? 'Saída' : 'Entrada'}</span>
              <span>
                • {String(transaction.sourceAccount)} → {String(transaction.destinationAccount)}
              </span>
            </div>
          )}

          <Select 
            value={transaction.category || ""} 
            onValueChange={(value) => onCategoryChange(index, value)}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="Selecione categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </td>
      <td className="py-3 px-4 text-sm">
        <Select 
          value={transaction.class as string || ""} 
          onValueChange={(value) => onClassChange(index, value as TransactionClass)}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="Selecione classe" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(classOptions).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-3 px-4 text-sm">
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStartEditing(index, transactionData.description)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar descrição
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => {
                  const isNegative = transactionData.isNegative;
                  const isIncoming = !isNegative;
                  
                  setTransferModalState({
                    isOpen: true,
                    index,
                    isIncoming,
                    sourceAccountId: isIncoming ? "" : "9dc32abe-0ab4-4e3a-a792-a0992e737365",
                    destinationAccountId: isIncoming ? "9dc32abe-0ab4-4e3a-a792-a0992e737365" : transaction.destinationAccountId || ""
                  });
                }}
                disabled={accounts.length < 2}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                {transaction.isTransfer ? 'Editar transferência' : 'Marcar como transferência'}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {!transaction.isWeddingRelated ? (
                <DropdownMenuItem 
                  onClick={() => {
                    setParsedTransactions(prev => {
                      const updated = [...prev];
                      updated[index] = {
                        ...updated[index],
                        isWeddingRelated: true,
                      };
                      return updated;
                    });
                    
                    // Abrir o modal de categoria de casamento
                    setWeddingModalState({
                      isOpen: true,
                      index
                    });
                  }}
                >
                  <HeartHandshake className="h-4 w-4 mr-2" />
                  Marcar como despesa de casamento
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setWeddingModalState({
                        isOpen: true,
                        index
                      });
                    }}
                  >
                    <HeartHandshake className="h-4 w-4 mr-2" />
                    Editar categoria de casamento
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => {
                      setParsedTransactions(prev => {
                        const updated = [...prev];
                        updated[index] = {
                          ...updated[index],
                          isWeddingRelated: false,
                          weddingCategory: undefined
                        };
                        return updated;
                      });
                    }}
                    className="text-red-500"
                  >
                    <HeartHandshake className="h-4 w-4 mr-2" />
                    Remover marcação de casamento
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onDelete(index)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir transação
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
});

TransactionRow.displayName = "TransactionRow"; // Required for memo components in dev mode

// Update the DescriptionEditor component to fix all issues
const DescriptionEditor = memo(({ 
  editingState, 
  setEditingState, 
  setParsedTransactions, 
  selectedImporterId 
}: {
  editingState: {
    isOpen: boolean;
    index: number | null;
    value: string;
    originalValue: string;
  };
  setEditingState: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    index: number | null;
    value: string;
    originalValue: string;
  }>>;
  setParsedTransactions: React.Dispatch<React.SetStateAction<ParsedTransaction[]>>;
  selectedImporterId: string;
}) => {
  if (!editingState.isOpen || editingState.index === null) return null;

  const handleSave = () => {
    const index = editingState.index;
    if (index !== null) {
      console.log("Saving edited description:", editingState.value);
      console.log("Selected importer:", selectedImporterId);
      
      setParsedTransactions(prev => {
        const updated = [...prev];
        if (!updated[index]) return updated;

        console.log("Transaction before update:", updated[index]);
        
        // Update the transaction based on the importer type
        if (selectedImporterId === "nubank") {
          updated[index] = {
            ...updated[index],
            Descrição: editingState.value
          };
        } else if (selectedImporterId === "nubank_credit") {
          updated[index] = {
            ...updated[index],
            title: editingState.value
          };
        } else if (selectedImporterId === "inter") {
          updated[index] = {
            ...updated[index],
            Descricao: editingState.value
          };
        } else if (selectedImporterId === "generic") {
          updated[index] = {
            ...updated[index],
            description: editingState.value
          };
        }
        
        console.log("Transaction after update:", updated[index]);
        return updated;
      });
    }
    setEditingState(prev => ({...prev, isOpen: false}));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setEditingState(prev => ({...prev, isOpen: false}));
        }
      }}
    >
      <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Editar Descrição</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição da Transação</Label>
            <Input
              id="description"
              value={editingState.value}
              onChange={(e) => setEditingState(prev => ({...prev, value: e.target.value}))}
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setEditingState(prev => ({...prev, isOpen: false}))}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

DescriptionEditor.displayName = "DescriptionEditor";

export default function ImportTransactionsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { addTransaction } = useTransactions();
  const { getAllInvoicesForAccount } = useInvoices();
  
  const [selectedImporterId, setSelectedImporterId] = useState<string>("nubank");
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");
  const [invoicesForAccount, setInvoicesForAccount] = useState<{ id: string; label: string }[]>([]);
  const [currentStep, setCurrentStep] = useState<"select-importer" | "select-invoice" | "upload" | "categorize" | "success">("select-importer");
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingState, setEditingState] = useState<{
    isOpen: boolean;
    index: number | null;
    value: string;
    originalValue: string;
  }>({
    isOpen: false,
    index: null,
    value: "",
    originalValue: ""
  });
  
  // Adicionar state para o modal de transferência
  const [transferModalState, setTransferModalState] = useState<{
    isOpen: boolean;
    index: number | null;
    isIncoming: boolean;  // true = valor positivo, false = valor negativo
    sourceAccountId: string;
    destinationAccountId: string;
  }>({
    isOpen: false,
    index: null,
    isIncoming: false,
    sourceAccountId: "",
    destinationAccountId: ""
  });
  
  // Adicionar state para o modal de categoria de casamento
  const [weddingModalState, setWeddingModalState] = useState<{
    isOpen: boolean;
    index: number | null;
  }>({
    isOpen: false,
    index: null
  });
  
  // State for wedding category selection
  const [selectedWeddingCategory, setSelectedWeddingCategory] = useState(DEFAULT_WEDDING_CATEGORIES[0]);
  
  // Update the selected category when the modal opens
  useEffect(() => {
    if (weddingModalState.isOpen && weddingModalState.index !== null) {
      const transaction = parsedTransactions[weddingModalState.index];
      if (transaction?.weddingCategory) {
        setSelectedWeddingCategory(transaction.weddingCategory);
      } else {
        setSelectedWeddingCategory(DEFAULT_WEDDING_CATEGORIES[0]);
      }
    }
  }, [weddingModalState, parsedTransactions]);
  
  // Current selected importer
  const selectedImporter = getImporterById(selectedImporterId);
  
  const handleImporterChange = async (importerId: string) => {
    setSelectedImporterId(importerId);
    setSelectedInvoice("");
    setParsedTransactions([]);
    setInvoicesForAccount([]);
    
    const importer = getImporterById(importerId);
    if (importer?.requiresInvoice) {
      // Load invoices for Nubank credit card account
      const CREDIT_CARD_ACCOUNT_ID = "93b8bd75-ab2b-4e52-b781-b117490c57eb";
      const creditCardAccount = accounts.find(account => account.id === CREDIT_CARD_ACCOUNT_ID);
      
      if (creditCardAccount) {
        try {
          // Fetch all invoices for this account
          const invoices = await getAllInvoicesForAccount(CREDIT_CARD_ACCOUNT_ID);
          
          if (invoices.length > 0) {
            const formattedInvoices = invoices.map(invoice => ({
              id: invoice.id,
              label: `${invoice.year}/${String(invoice.month).padStart(2, '0')}`
            }));
            
            setInvoicesForAccount(formattedInvoices);
            setCurrentStep("select-invoice");
          } else {
            toast.error("Não há faturas disponíveis para este cartão de crédito");
            setCurrentStep("upload");
          }
        } catch (error) {
          console.error("Error loading invoices:", error);
          toast.error("Erro ao carregar faturas");
          setCurrentStep("upload");
        }
      } else {
        setCurrentStep("upload");
      }
    } else {
      setCurrentStep("upload");
    }
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoice(invoiceId);
    setCurrentStep("upload");
  };
  
  const handleContinueToUpload = () => {
    if (selectedImporterId) {
      const importer = getImporterById(selectedImporterId);
      if (importer?.requiresInvoice && !selectedInvoice) {
        setCurrentStep("select-invoice");
      } else {
        setCurrentStep("upload");
      }
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    
    if (!file || !selectedImporter) return;
    
    try {
      const text = await file.text();
      const transactions = selectedImporter.importer.parseCSV(text);
      
      console.log("Parsed transactions:", transactions); // Add debug logging
      
      // Initialize with empty category and class, but set class to 'income' for positive amounts
      const transactionsWithDefaults = transactions.map((transaction: unknown) => {
        const transObj = transaction as Record<string, unknown>;
        
        // Determine if the transaction is positive based on importer type
        let isPositive = false;
        let description = "";
        
        if (selectedImporterId === "nubank") {
          isPositive = typeof transObj.Valor === 'string' && !transObj.Valor.startsWith('-');
          description = String(transObj.Descrição || "");
        } else if (selectedImporterId === "nubank_credit") {
          // For credit card, payments (negative values in CSV) are income
          const amountStr = String(transObj.amount || "0");
          const isPayment = amountStr.includes('-') || parseFloat(amountStr) < 0;
          
          isPositive = isPayment; // Payments are positive (income), regular transactions are negative (expenses)
          description = String(transObj.title || "");
        } else if (selectedImporterId === "inter") {
          isPositive = !(typeof transObj.Tipo === 'string' && 
            (transObj.Tipo.toLowerCase().includes('saque') || 
             transObj.Tipo.toLowerCase().includes('pagamento') || 
             transObj.Tipo.toLowerCase().includes('transferência enviada')));
          description = String(transObj.Descricao || "");
        } else if (selectedImporterId === "generic") {
          // For generic importer
          const amount = parseFloat(String(transObj.amount || "0").replace(/[^\d.-]/g, '') || '0');
          isPositive = amount >= 0;
          description = String(transObj.description || "");
          
          // If type is explicitly set, use that instead
          if (typeof transObj.type === 'string') {
            const typeStr = transObj.type.toLowerCase();
            if (typeStr.includes('income') || typeStr.includes('receita')) {
              isPositive = true;
            } else if (typeStr.includes('expense') || typeStr.includes('despesa')) {
              isPositive = false;
            } else if (typeStr.includes('transfer') || typeStr.includes('transferência')) {
              // Set as transfer
              return {
                ...transObj,
                isTransfer: true,
                categoryId: "",
                category: "",
                class: ""
              } as ParsedTransaction;
            }
          }
        } else {
          description = "";
        }
        
        // Apply mapping rules if description matches any patterns
        const mapping = description ? mapTransactionByDescription(description) : undefined;
        
        // If mapping found, use the category id directly
        const mappedCategoryId = mapping?.categoryId || "";
        
        // Find category name if we have an ID (for display purposes)
        let mappedCategoryName = "";
        if (mappedCategoryId) {
          const category = categories.find(c => c.id === mappedCategoryId);
          mappedCategoryName = category?.name || "";
        }
        
        // Determine default class based on transaction type
        let defaultClass: TransactionClass | undefined;
        
        if (selectedImporterId === "nubank_credit") {
          // For credit card: if it's a payment, use 'income', otherwise 'essential'
          const amountStr = String(transObj.amount || "0");
          const isPayment = amountStr.includes('-') || parseFloat(amountStr) < 0;
          defaultClass = isPayment ? "income" : "essential";
        } else {
          // For other transaction types
          defaultClass = isPositive ? "income" : "essential";
        }
        
        return {
          ...transObj,
          // Apply category and class from mapping if available
          category: mappedCategoryName || (selectedImporterId === "generic" ? String(transObj.category || "") : ""),
          categoryId: mappedCategoryId,
          // If no mapping found, use the determined default class
          class: mapping?.class || defaultClass
        } as ParsedTransaction;
      });

      setParsedTransactions(transactionsWithDefaults);
      setCurrentStep("categorize");
    } catch (error) {
      console.error("Error parsing CSV file:", error);
      setImportError(error instanceof Error ? error.message : "Erro desconhecido ao processar arquivo");
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleCategoryChange = useCallback((index: number, categoryName: string) => {
    setParsedTransactions(prev => {
      const updated = [...prev];
      const category = categories.find(c => c.name === categoryName);
      
      updated[index] = {
        ...updated[index],
        category: categoryName,
        // Update categoryId based on the selected category
        categoryId: category?.id || ""
      };
      return updated;
    });
  }, [categories]);
  
  const handleClassChange = useCallback((index: number, transactionClass: TransactionClass) => {
    setParsedTransactions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        class: transactionClass
      };
      return updated;
    });
  }, []);
  
  const startEditing = useCallback((index: number, initialValue: string) => {
    console.time('startEditing');
    setEditingState({
      isOpen: true,
      index,
      value: initialValue,
      originalValue: initialValue
    });
    console.timeEnd('startEditing');
  }, []);
  
  const handleTransferChange = (index: number, isTransfer: boolean, sourceAccountId?: string, destinationAccountId?: string) => {
    setParsedTransactions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isTransfer,
        // Se for transferência, adicionar sourceAccountId e destinationAccountId
        ...(isTransfer ? { 
          sourceAccountId,
          destinationAccountId
        } : {
          sourceAccountId: undefined,
          destinationAccountId: undefined
        })
      };
      return updated;
    });
  };
  
  const handleImportTransactions = async () => {
    try {
      setIsImporting(true);
      
      // Get selected importer
      const selectedImporter = getImporterById(selectedImporterId);
      if (!selectedImporter) {
        throw new Error("Importador não encontrado");
      }
      
      let accountId = "9dc32abe-0ab4-4e3a-a792-a0992e737365"; // default Nuconta ID
      let accountName = "Nuconta";
      let accountColor = "#8a05be";
      
      // For Nubank credit, use the credit card account
      if (selectedImporterId === "nubank_credit") {
        const CREDIT_CARD_ACCOUNT_ID = "93b8bd75-ab2b-4e52-b781-b117490c57eb";
        const creditAccount = accounts.find(acc => acc.id === CREDIT_CARD_ACCOUNT_ID);
        if (creditAccount) {
          accountId = creditAccount.id;
          accountName = creditAccount.name;
          accountColor = creditAccount.color || "#8a05be"; // Provide a fallback color
        }
      }
      
      // Extract transactions with assigned categories and classes
      const transactionsToImport = parsedTransactions.filter(t => 
        (t.categoryId && t.class) || (t.isTransfer && t.destinationAccountId)
      );
      
      // Handle differently based on importer type to avoid type issues
      let convertedTransactions;
      
      if (selectedImporterId === "nubank_credit" && selectedInvoice) {
        // For credit card transactions with invoice
        convertedTransactions = selectedImporter.importer.convertToTransactions(
          transactionsToImport,
          accountId,
          accountName,
          accountColor,
          selectedInvoice
        );
      } else {
        // For regular transactions without invoice
        convertedTransactions = selectedImporter.importer.convertToTransactions(
          transactionsToImport,
          accountId,
          accountName,
          accountColor
        );
      }
      
      // Adicionar cada transação
      for (const transaction of convertedTransactions) {
        await addTransaction(transaction);
      }
      
      setCurrentStep("success");
      toast.success(`${convertedTransactions.length} transações importadas com sucesso`);
    } catch (error) {
      console.error("Erro ao importar transações:", error);
      toast.error(`Erro ao importar transações: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleDeleteClick = useCallback((index: number) => {
    setTransactionToDelete(index);
    setDeleteDialogOpen(true);
  }, []);
  
  const confirmDeleteTransaction = () => {
    if (transactionToDelete !== null) {
      setParsedTransactions(prev => {
        const updated = [...prev];
        updated.splice(transactionToDelete, 1);
        return updated;
      });
      
      toast.success("Transação removida da lista de importação");
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };
  
  const removeUncategorizedTransactions = () => {
    if (parsedTransactions.length === 0) return;
    
    const hasUncategorized = parsedTransactions.some(t => !t.category);
    
    if (hasUncategorized) {
      if (window.confirm("Deseja remover todas as transações sem categoria definida?")) {
        setParsedTransactions(prev => prev.filter(t => !!t.category));
        toast.success("Transações sem categoria foram removidas");
      }
    } else {
      toast.info("Não há transações sem categoria para remover");
    }
  };
  
  // Add log to check array size when it updates
  useEffect(() => {
    console.log(`parsedTransactions length: ${parsedTransactions.length}`);
  }, [parsedTransactions]);
  
  // Log to monitor component render cycles
  console.log('ImportTransactionsPage rendering');
  
  // Replace memoizedTableRows with:
  const tableRows = useMemo(() => {
    if (currentStep !== "categorize") return [];
    
    console.time('tableRows calculation');
    const rows = parsedTransactions.map((transaction, index) => (
      <TransactionRow 
        key={`transaction-${index}`}
        transaction={transaction}
        index={index}
        selectedImporterId={selectedImporterId}
        onStartEditing={startEditing}
        onDelete={handleDeleteClick}
        categories={categories}
        classOptions={classOptions}
        accounts={accounts}
        onCategoryChange={handleCategoryChange}
        onClassChange={handleClassChange}
        setTransferModalState={setTransferModalState}
        setParsedTransactions={setParsedTransactions}
        setWeddingModalState={setWeddingModalState}
      />
    ));
    console.timeEnd('tableRows calculation');
    return rows;
  }, [
    parsedTransactions,
    selectedImporterId,
    currentStep,
    categories,
    accounts,
    handleCategoryChange,
    handleClassChange,
    startEditing,
    handleDeleteClick,
    setTransferModalState,
    setParsedTransactions,
    setWeddingModalState
  ]);
  
  const renderImporterSelection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Importar Transações</CardTitle>
          <CardDescription>
            Escolha o banco ou fonte de onde você deseja importar transações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-3">
              <RadioGroup 
                value={selectedImporterId} 
                onValueChange={handleImporterChange}
                className="grid gap-3"
              >
                {availableImporters.map((importer) => (
                  <div key={importer.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={importer.id} id={importer.id} />
                    <Label htmlFor={importer.id} className="flex items-center gap-2 cursor-pointer">
                      {importer.id === "nubank" && (
                        <Upload className="h-4 w-4 text-purple-500" />
                      )}
                      {importer.id === "nubank_credit" && (
                        <CreditCard className="h-4 w-4 text-purple-500" />
                      )}
                      {importer.id === "inter" && (
                        <Upload className="h-4 w-4 text-orange-500" />
                      )}
                      {importer.id === "generic" && (
                        <FileText className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="flex-1">{importer.name}</span>
                      <span className="text-xs text-muted-foreground">{importer.institution}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleContinueToUpload}
          disabled={!selectedImporterId}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
  
  const renderInvoiceSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep("select-importer")}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Voltar
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Selecione a fatura</CardTitle>
          <CardDescription>
            Escolha a fatura que deseja vincular as transações do cartão de crédito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-3">
              {invoicesForAccount.length > 0 ? (
                <RadioGroup 
                  value={selectedInvoice} 
                  onValueChange={handleInvoiceSelect}
                  className="grid gap-3"
                >
                  {invoicesForAccount.map((invoice) => (
                    <div key={invoice.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={invoice.id} id={invoice.id} />
                      <Label htmlFor={invoice.id} className="flex-1 cursor-pointer">
                        {invoice.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Sem faturas</AlertTitle>
                  <AlertDescription>
                    Não há faturas disponíveis para o cartão de crédito selecionado. 
                    Crie uma fatura primeiro.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => handleContinueToUpload()}
          disabled={!selectedInvoice || invoicesForAccount.length === 0}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
  
  const renderUploadStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Importar Transações - {selectedImporter?.name}</CardTitle>
        <CardDescription>
          Importe suas transações através de um arquivo CSV
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-lg">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <FileText className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-4">
            Arraste e solte o arquivo CSV ou clique para selecionar
          </p>
          <Button onClick={handleUploadClick}>
            <Upload className="mr-2 h-4 w-4" />
            Selecionar Arquivo
          </Button>
        </div>
        
        {importError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao importar</AlertTitle>
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}
        
        <div className="mt-6">
          <h3 className="font-medium mb-2">Instruções</h3>
          {selectedImporterId === "generic" ? (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                Para o Importador Genérico, o arquivo CSV deve conter as seguintes colunas:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                <li><strong>Data</strong> - Data da transação (formato: YYYY-MM-DD, DD/MM/YYYY)</li>
                <li><strong>Descrição</strong> - Descrição da transação</li>
                <li><strong>Valor</strong> - Valor da transação (use sinal negativo para despesas)</li>
                <li><em>Categoria</em> - (Opcional) Categoria da transação</li>
                <li><em>Tipo</em> - (Opcional) Tipo: income, expense, transfer</li>
              </ul>
            </>
          ) : (
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Exporte as transações do {selectedImporter?.name} em formato CSV</li>
              <li>Selecione o arquivo exportado</li>
              <li>Categorize as transações</li>
              <li>Confirme a importação</li>
            </ol>
          )}
        </div>
        
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep("select-importer")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderCategorizeStep = () => {
    console.log('renderCategorizeStep called');
    // Count auto-mapped transactions
    const mappedCount = parsedTransactions.filter(t => t.categoryId).length;
    const totalCount = parsedTransactions.length;
    
    // Calculate totals
    const calculateTotal = () => {
      let total = 0;
      
      if (parsedTransactions.length === 0) {
        return { formattedTotal: "R$0,00", income: 0, expense: 0 };
      }
      
      parsedTransactions.forEach(transaction => {
        let amount = 0;
        let isPositive = false;
        
        if (selectedImporterId === "nubank") {
          amount = Math.abs(parseFloat(String(transaction.Valor || "0").replace(/[^\d.-]/g, '') || '0'));
          isPositive = typeof transaction.Valor === 'string' && !transaction.Valor.startsWith('-');
        } else if (selectedImporterId === "nubank_credit") {
          amount = Math.abs(parseFloat(String(transaction.amount || "0").replace(/[^\d.-]/g, '') || '0'));
          // For credit card, negative values in CSV are payments (income)
          isPositive = String(transaction.amount || "").includes('-') || parseFloat(String(transaction.amount || "0")) < 0;
        } else if (selectedImporterId === "inter") {
          amount = Math.abs(parseFloat(String(transaction.Valor || "0").replace(/[^\d.-]/g, '') || '0'));
          isPositive = !(typeof transaction.Tipo === 'string' && 
            (transaction.Tipo.toLowerCase().includes('saque') || 
             transaction.Tipo.toLowerCase().includes('pagamento') || 
             transaction.Tipo.toLowerCase().includes('transferência enviada')));
        } else if (selectedImporterId === "generic") {
          amount = Math.abs(parseFloat(String(transaction.amount || "0").replace(/[^\d.-]/g, '') || '0'));
          isPositive = !(typeof transaction.amount === 'string' && 
            (transaction.amount.startsWith('-') || parseFloat(transaction.amount) < 0));
        }
        
        // Add or subtract based on transaction type
        if (isPositive) {
          total += amount; // Income
        } else {
          total -= amount; // Expense
        }
      });
      
      // Calculate income and expense separately for the summary
      const income = parsedTransactions.reduce((sum, transaction) => {
        let amount = 0;
        let isPositive = false;
        
        if (selectedImporterId === "nubank") {
          amount = Math.abs(parseFloat(String(transaction.Valor || "0").replace(/[^\d.-]/g, '') || '0'));
          isPositive = typeof transaction.Valor === 'string' && !transaction.Valor.startsWith('-');
        } else if (selectedImporterId === "nubank_credit") {
          amount = Math.abs(parseFloat(String(transaction.amount || "0").replace(/[^\d.-]/g, '') || '0'));
          isPositive = String(transaction.amount || "").includes('-') || parseFloat(String(transaction.amount || "0")) < 0;
        } else if (selectedImporterId === "inter") {
          amount = Math.abs(parseFloat(String(transaction.Valor || "0").replace(/[^\d.-]/g, '') || '0'));
          isPositive = !(typeof transaction.Tipo === 'string' && 
            (transaction.Tipo.toLowerCase().includes('saque') || 
             transaction.Tipo.toLowerCase().includes('pagamento') || 
             transaction.Tipo.toLowerCase().includes('transferência enviada')));
        } else if (selectedImporterId === "generic") {
          amount = Math.abs(parseFloat(String(transaction.amount || "0").replace(/[^\d.-]/g, '') || '0'));
          isPositive = !(typeof transaction.amount === 'string' && 
            (transaction.amount.startsWith('-') || parseFloat(transaction.amount) < 0));
        }
        
        return isPositive ? sum + amount : sum;
      }, 0);
      
      const expense = parsedTransactions.reduce((sum, transaction) => {
        let amount = 0;
        let isPositive = false;
        
        if (selectedImporterId === "nubank") {
          amount = Math.abs(parseFloat(String(transaction.Valor || "0").replace(/[^\d.-]/g, '') || '0'));
          isPositive = typeof transaction.Valor === 'string' && !transaction.Valor.startsWith('-');
        } else if (selectedImporterId === "nubank_credit") {
          amount = Math.abs(parseFloat(String(transaction.amount || "0").replace(/[^\d.-]/g, '') || '0'));
          isPositive = String(transaction.amount || "").includes('-') || parseFloat(String(transaction.amount || "0")) < 0;
        } else if (selectedImporterId === "inter") {
          amount = Math.abs(parseFloat(String(transaction.Valor || "0").replace(/[^\d.-]/g, '') || '0'));
          isPositive = !(typeof transaction.Tipo === 'string' && 
            (transaction.Tipo.toLowerCase().includes('saque') || 
             transaction.Tipo.toLowerCase().includes('pagamento') || 
             transaction.Tipo.toLowerCase().includes('transferência enviada')));
        } else if (selectedImporterId === "generic") {
          amount = Math.abs(parseFloat(String(transaction.amount || "0").replace(/[^\d.-]/g, '') || '0'));
          isPositive = !(typeof transaction.amount === 'string' && 
            (transaction.amount.startsWith('-') || parseFloat(transaction.amount) < 0));
        }
        
        return !isPositive ? sum + amount : sum;
      }, 0);
      
      return {
        formattedTotal: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total),
        income,
        expense
      };
    };
    
    const { formattedTotal, income, expense } = calculateTotal();
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categorizar Transações - {selectedImporter?.name}</CardTitle>
          <CardDescription>
            Atribua categorias e classes às transações antes de importá-las
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mappedCount > 0 && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Categorização sugerida</AlertTitle>
              <AlertDescription>
                Encontramos <strong>{mappedCount}</strong> de <strong>{totalCount}</strong> transações com sugestões de categorização. As linhas com ponto azul têm categorias pré-sugeridas, mas você deve revisar todas antes de importar.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Total de transações para importação: <span className="font-medium">{parsedTransactions.length}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={removeUncategorizedTransactions}
                className="text-xs"
              >
                Remover não categorizadas
              </Button>
            </div>
            
            {/* Transaction Summary Card */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
              <h3 className="text-sm font-medium mb-2">Resumo da Importação</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Entradas (+)</p>
                  <p className="text-lg font-semibold text-green-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(income)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saídas (-)</p>
                  <p className="text-lg font-semibold text-red-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className={`text-lg font-semibold ${parseFloat(formattedTotal.replace(/[^\d,-]/g, '').replace(',', '.')) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formattedTotal}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium text-sm">Data</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Descrição</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Valor</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Categoria</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Classe</th>
                    <th className="py-3 px-4 text-left font-medium text-sm w-[60px]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep("upload")}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button 
              onClick={handleImportTransactions}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Importar Transações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderSuccessStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Importação Concluída</CardTitle>
        <CardDescription>
          Suas transações foram importadas com sucesso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-10">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium">Transações Importadas</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-6 text-center">
            Todas as transações selecionadas foram importadas para sua conta
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setCurrentStep("select-importer")}>
              Importar Mais
            </Button>
            <Button onClick={() => window.location.href = "/transactions"}>
              Ver Transações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  // Adicionar o modal de transferência
  const TransferModal = () => {
    if (!transferModalState.isOpen) return null;
    
    const index = transferModalState.index as number;
    const isIncoming = transferModalState.isIncoming;
    
    // Obter os dados da transação
    let transactionDescription = "";
    if (parsedTransactions[index]) {
      if (selectedImporterId === "nubank") {
        transactionDescription = String(parsedTransactions[index].Descrição || "");
      } else if (selectedImporterId === "inter") {
        transactionDescription = String(parsedTransactions[index].Descricao || "");
      } else if (selectedImporterId === "generic") {
        transactionDescription = String(parsedTransactions[index].description || "");
      }
    }
    
    return (
      <div 
        className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
        onClick={(e) => {
          // Close when clicking the backdrop
          if (e.target === e.currentTarget) {
            setTransferModalState(prev => ({...prev, isOpen: false}));
          }
        }}
      >
        <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Configurar Transferência</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Transação: <span className="font-medium">{transactionDescription}</span>
              </p>
              
              {isIncoming ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">Conta de Origem (enviou o dinheiro)</label>
                  <Select 
                    value={transferModalState.sourceAccountId} 
                    onValueChange={(value) => setTransferModalState(prev => ({...prev, sourceAccountId: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta de origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">A conta de destino é a conta que você selecionou para importação</p>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-1 block">Conta de Destino (recebeu o dinheiro)</label>
                  <Select 
                    value={transferModalState.destinationAccountId} 
                    onValueChange={(value) => setTransferModalState(prev => ({...prev, destinationAccountId: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta de destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">A conta de origem é a conta que você selecionou para importação</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setTransferModalState(prev => ({...prev, isOpen: false}))}
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  if (transferModalState.index !== null) {
                    const sourceId = transferModalState.isIncoming ? transferModalState.sourceAccountId : "9dc32abe-0ab4-4e3a-a792-a0992e737365";
                    const destId = transferModalState.isIncoming ? "9dc32abe-0ab4-4e3a-a792-a0992e737365" : transferModalState.destinationAccountId;
                    
                    if (transferModalState.isIncoming && !sourceId) {
                      toast.error("Selecione a conta de origem");
                      return;
                    }
                    
                    if (!transferModalState.isIncoming && !destId) {
                      toast.error("Selecione a conta de destino");
                      return;
                    }
                    
                    handleTransferChange(
                      transferModalState.index,
                      true,
                      sourceId,
                      destId
                    );
                    
                    // Fechar o modal
                    setTransferModalState(prev => ({...prev, isOpen: false}));
                  }
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Simplified Wedding Category Modal component
  const renderWeddingCategoryModal = () => {
    if (!weddingModalState.isOpen || weddingModalState.index === null) return null;
    
    const index = weddingModalState.index;
    const transaction = parsedTransactions[index];
    
    let description = "";
    if (selectedImporterId === "nubank") {
      description = String(transaction?.Descrição || "");
    } else if (selectedImporterId === "inter") {
      description = String(transaction?.Descricao || "");
    } else if (selectedImporterId === "generic") {
      description = String(transaction?.description || "");
    }
    
    return (
      <div 
        className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setWeddingModalState(prev => ({...prev, isOpen: false}));
          }
        }}
      >
        <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Categoria de Casamento</h3>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Transação: <span className="font-medium">{description}</span>
            </p>
            
            <div>
              <Label htmlFor="weddingCategory">Categoria</Label>
              <Input
                id="weddingCategory"
                value={selectedWeddingCategory}
                onChange={(e) => setSelectedWeddingCategory(e.target.value)}
                placeholder="Insira a categoria de casamento"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ex: Buffet, Local, Fotografia, Decoração, etc.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setWeddingModalState(prev => ({...prev, isOpen: false}))}
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  if (!selectedWeddingCategory.trim()) {
                    toast.error("Por favor, insira uma categoria para o casamento");
                    return;
                  }
                  
                  setParsedTransactions(prev => {
                    const updated = [...prev];
                    updated[index] = {
                      ...updated[index],
                      weddingCategory: selectedWeddingCategory,
                      isWeddingRelated: true
                    };
                    return updated;
                  });
                  
                  setWeddingModalState(prev => ({...prev, isOpen: false}));
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Importar Transações</h1>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para Transações
          </Button>
        </div>
        
        {currentStep === "select-importer" && renderImporterSelection()}
        {currentStep === "select-invoice" && renderInvoiceSelection()}
        {currentStep === "upload" && renderUploadStep()}
        {currentStep === "categorize" && renderCategorizeStep()}
        {currentStep === "success" && renderSuccessStep()}
      </div>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remover Transação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover esta transação da lista de importação?
            </DialogDescription>
          </DialogHeader>
          
          {transactionToDelete !== null && parsedTransactions[transactionToDelete] && (
            <div className="py-4 border-t border-b my-4">
              <div className="grid grid-cols-2 gap-y-2">
                <p className="text-sm font-medium">Descrição:</p>
                <p className="text-sm truncate">
                  {selectedImporterId === "nubank" 
                    ? String(parsedTransactions[transactionToDelete].Descrição || "") 
                    : selectedImporterId === "nubank_credit"
                      ? String(parsedTransactions[transactionToDelete].title || "")
                      : selectedImporterId === "inter"
                        ? String(parsedTransactions[transactionToDelete].Descricao || "")
                        : selectedImporterId === "generic"
                          ? String(parsedTransactions[transactionToDelete].description || "")
                          : ""}
                </p>
                
                <p className="text-sm font-medium">Valor:</p>
                <p className="text-sm">
                  {selectedImporterId === "nubank" 
                    ? String(parsedTransactions[transactionToDelete].Valor || "0")
                    : selectedImporterId === "nubank_credit"
                      ? String(parsedTransactions[transactionToDelete].amount || "0")
                      : selectedImporterId === "inter"
                        ? String(parsedTransactions[transactionToDelete].Valor || "0")
                        : selectedImporterId === "generic"
                          ? String(parsedTransactions[transactionToDelete].amount || "0")
                          : "0"}
                </p>
                
                <p className="text-sm font-medium">Categoria:</p>
                <p className="text-sm">{parsedTransactions[transactionToDelete].category || "Não definida"}</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTransaction}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add the floating editors */}
      <DescriptionEditor 
        editingState={editingState}
        setEditingState={setEditingState}
        setParsedTransactions={setParsedTransactions}
        selectedImporterId={selectedImporterId}
      />
      <TransferModal />
      {renderWeddingCategoryModal()}
    </DashboardLayout>
  );
} 