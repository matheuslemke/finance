"use client";

import { useState, useRef, useCallback, useEffect, useMemo, memo } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { availableImporters, getImporterById } from "@/lib/importers/importer-registry";
import { useAccounts } from "@/context/account-context";
import { useCategories } from "@/context/category-context";
import { useTransactions } from "@/context/transaction-context";
import { Upload, FileText, AlertCircle, CheckCircle2, ChevronLeft, Save, Loader2, CreditCard, Info, Trash2, Check, MoreHorizontal, Edit, HeartHandshake, ArrowRightLeft } from "lucide-react";
import { TransactionClass, TransactionType, Account } from "@/types";
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

export default function ImportTransactionsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { addTransaction } = useTransactions();
  
  const [selectedImporterId, setSelectedImporterId] = useState<string>("nubank");
  const [importStep, setImportStep] = useState<"select-importer" | "upload" | "categorize" | "success">("select-importer");
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
  
  const handleImporterChange = (importerId: string) => {
    setSelectedImporterId(importerId);
  };
  
  const handleContinueToUpload = () => {
    if (!selectedImporterId) {
      toast.error("Selecione um tipo de importação");
      return;
    }
    
    setImportStep("upload");
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    
    if (!file || !selectedImporter) return;
    
    try {
      const text = await file.text();
      const transactions = selectedImporter.importer.parseCSV(text);
      
      // Initialize with empty category and class, but set class to 'income' for positive amounts
      const transactionsWithDefaults = transactions.map((transaction: unknown) => {
        const transObj = transaction as Record<string, unknown>;
        
        // Determine if the transaction is positive based on importer type
        let isPositive = false;
        let description = "";
        
        if (selectedImporterId === "nubank") {
          isPositive = typeof transObj.Valor === 'string' && !transObj.Valor.startsWith('-');
          description = String(transObj.Descrição || "");
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
        
        // If mapping found, find the actual category name from categories array
        let mappedCategoryName = "";
        if (mapping?.categoryId) {
          const category = categories.find(c => c.id === mapping.categoryId);
          mappedCategoryName = category?.name || "";
        }
        
        return {
          ...transObj,
          // Apply category and class from mapping if available
          category: mappedCategoryName || (selectedImporterId === "generic" ? String(transObj.category || "") : ""),
          categoryId: mapping?.categoryId || "",
          // If no mapping found, use positive amount rule
          class: mapping?.class || (isPositive ? "income" : undefined)
        } as ParsedTransaction;
      });
      
      setParsedTransactions(transactionsWithDefaults);
      setImportStep("categorize");
    } catch (error) {
      console.error("Error parsing CSV file:", error);
      setImportError(error instanceof Error ? error.message : "Erro desconhecido ao processar arquivo");
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleCategoryChange = (index: number, categoryName: string) => {
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
  };
  
  const handleClassChange = (index: number, transactionClass: TransactionClass) => {
    setParsedTransactions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        class: transactionClass
      };
      return updated;
    });
  };
  
  const startEditing = (index: number, initialValue: string) => {
    console.time('startEditing');
    setEditingState({
      isOpen: true,
      index,
      value: initialValue,
      originalValue: initialValue
    });
    console.timeEnd('startEditing');
  };
  
  const saveDescriptionEdit = () => {
    console.time('saveDescriptionEdit');
    if (editingState.index === null) return;
    
    setParsedTransactions(prev => {
      console.time('setParsedTransactions');
      const updated = [...prev];
      const index = editingState.index as number; // Type assertion since we already checked it's not null
      
      if (selectedImporterId === "nubank") {
        updated[index] = {
          ...updated[index],
          Descrição: editingState.value
        };
      } else if (selectedImporterId === "inter") {
        updated[index] = {
          ...updated[index],
          Descricao: editingState.value
        };
      }
      
      console.timeEnd('setParsedTransactions');
      return updated;
    });
    
    // Close editor
    setEditingState({
      isOpen: false,
      index: null,
      value: "",
      originalValue: ""
    });
    
    console.timeEnd('saveDescriptionEdit');
  };
  
  const cancelEditing = () => {
    setEditingState({
      isOpen: false,
      index: null,
      value: "",
      originalValue: ""
    });
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This now only updates the local editing state, not the transactions list
    setEditingState(prev => ({
      ...prev,
      value: e.target.value
    }));
  };
  
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
    if (!selectedImporter) {
      toast.error("Selecione uma conta para continuar");
      return;
    }
    
    const account = accounts.find(acc => acc.id === "9dc32abe-0ab4-4e3a-a792-a0992e737365");
    if (!account) {
      toast.error("Conta Nuconta não encontrada");
      return;
    }
    
    // Checar validações
    const hasInvalidTransactions = parsedTransactions.some(t => {
      if (t.isTransfer) {
        // Para transferências, verifica categoria, classe e contas de origem/destino
        const needsSourceAccount = !t.sourceAccountId && parseFloat(String(t.Valor || t.amount || "0").replace(/[^\d.-]/g, '') || '0') > 0;
        const needsDestAccount = !t.destinationAccountId && parseFloat(String(t.Valor || t.amount || "0").replace(/[^\d.-]/g, '') || '0') < 0;
        
        return !t.category || !t.class || (needsSourceAccount || needsDestAccount);
      } else {
        // Para outras transações, verifica categoria e classe
        return !t.category || !t.class;
      }
      
      // Para transações marcadas como de casamento, verifica se tem categoria de casamento
      if (t.isWeddingRelated && !t.weddingCategory) {
        return true;
      }
    });
    
    if (hasInvalidTransactions) {
      toast.error("Todas as transações precisam ter categoria e classe definidas. Para transferências, configure corretamente as contas de origem e destino.");
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Para transações normais, usar o conversor padrão
      const regularTransactions = parsedTransactions.filter(t => !t.isTransfer);
      const transferTransactions = parsedTransactions.filter(t => t.isTransfer);
      
      const transactionsToImport = [];
      
      // Converter transações normais
      if (regularTransactions.length > 0) {
        const regularConverted = selectedImporter.importer.convertToTransactions(
          regularTransactions,
          account.id,
          account.name,
          account.color
        );
        
        // Adicionar categoryId para cada transação
        for (const transaction of regularConverted) {
          if (!transaction.categoryId && transaction.category) {
            const category = categories.find(c => c.name === transaction.category);
            if (category) {
              transaction.categoryId = category.id;
            }
          }
          
          // Adicionar weddingCategory se a transação for marcada como de casamento
          const originalTransaction = regularTransactions.find(t => {
            if (selectedImporterId === "nubank") {
              return t.Descrição === transaction.description;
            } else if (selectedImporterId === "inter") {
              return t.Descricao === transaction.description;
            } else if (selectedImporterId === "generic") {
              return t.description === transaction.description;
            }
            return false;
          });
          
          if (originalTransaction?.isWeddingRelated) {
            transaction.weddingCategory = originalTransaction.weddingCategory;
          }
        }
        
        transactionsToImport.push(...regularConverted);
      }
      
      // Processar transferências
      if (transferTransactions.length > 0) {
        for (const transfer of transferTransactions) {
          // Obter os dados básicos da transação
          let amount = 0;
          let date = new Date();
          let description = "";
          let isIncoming = false;
          
          if (selectedImporterId === "nubank") {
            amount = Math.abs(parseFloat(String(transfer.Valor).replace(/[^\d.-]/g, '') || '0'));
            date = new Date(String(transfer.Data));
            description = String(transfer.Descrição || "Transferência");
            isIncoming = typeof transfer.Valor === 'string' && !transfer.Valor.startsWith('-');
          } else if (selectedImporterId === "inter") {
            amount = Math.abs(parseFloat(String(transfer.Valor).replace(/[^\d.-]/g, '') || '0'));
            date = new Date(String(transfer.Data));
            description = String(transfer.Descricao || "Transferência");
            isIncoming = !(typeof transfer.Tipo === 'string' && 
              (transfer.Tipo.toLowerCase().includes('saque') || 
               transfer.Tipo.toLowerCase().includes('pagamento') || 
               transfer.Tipo.toLowerCase().includes('transferência enviada')));
          } else if (selectedImporterId === "generic") {
            amount = Math.abs(parseFloat(String(transfer.amount).replace(/[^\d.-]/g, '') || '0'));
            date = new Date(String(transfer.date));
            description = String(transfer.description || "Transferência");
            isIncoming = parseFloat(String(transfer.amount).replace(/[^\d.-]/g, '') || '0') >= 0;
          }
          
          // Buscar as contas de origem e destino
          const sourceAccountId = isIncoming ? transfer.sourceAccountId : account.id;
          const destinationAccountId = isIncoming ? account.id : transfer.destinationAccountId;
          
          const sourceAccount = accounts.find(acc => acc.id === sourceAccountId);
          const destAccount = accounts.find(acc => acc.id === destinationAccountId);
          
          if (!sourceAccount || !destAccount) continue;
          
          // Encontrar a categoria correspondente
          const category = categories.find(c => c.name === transfer.category);
          
          // Adicionar weddingCategory se a transferência for marcada como de casamento
          const weddingCategory = transfer.isWeddingRelated ? transfer.weddingCategory : undefined;
          
          // Criar transação de transferência com tipos corrigidos
          const transferTransaction = {
            type: "transfer" as TransactionType,
            date,
            description,
            category: transfer.category || "Transferência",
            categoryId: category?.id || "",
            amount,
            accountId: sourceAccountId as string,
            account: sourceAccount.name,
            accountColor: sourceAccount.color,
            class: (transfer.class as TransactionClass) || "essential",
            destinationAccountId: destinationAccountId as string,
            destinationAccount: destAccount.name,
            destinationAccountColor: destAccount.color,
            weddingCategory
          };
          
          transactionsToImport.push(transferTransaction);
        }
      }
      
      // Adicionar cada transação
      for (const transaction of transactionsToImport) {
        await addTransaction(transaction);
      }
      
      setImportStep("success");
      toast.success(`${transactionsToImport.length} transações importadas com sucesso`);
    } catch (error) {
      console.error("Error importing transactions:", error);
      toast.error(`Erro ao importar transações: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsImporting(false);
    }
  };
  
  const resetImport = useCallback(() => {
    setParsedTransactions([]);
    setImportStep("select-importer");
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);
  
  const handleDeleteClick = (index: number) => {
    setTransactionToDelete(index);
    setDeleteDialogOpen(true);
  };
  
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
    if (importStep !== "categorize") return [];
    
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
    importStep,
    categories,
    accounts,
    setTransferModalState,
    setWeddingModalState
  ]);
  
  const renderImporterSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Selecione o Tipo de Importação</CardTitle>
        <CardDescription>
          Escolha a instituição financeira e o formato das transações a serem importadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <RadioGroup 
            value={selectedImporterId} 
            onValueChange={handleImporterChange}
            className="space-y-4"
          >
            {availableImporters.map((importer) => (
              <div key={importer.id} className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value={importer.id} id={`importer-${importer.id}`} />
                <Label 
                  htmlFor={`importer-${importer.id}`} 
                  className="flex flex-1 cursor-pointer items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{importer.name}</div>
                    <div className="text-sm text-muted-foreground">{importer.description}</div>
                  </div>
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="flex justify-end">
            <Button onClick={handleContinueToUpload}>
              Continuar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
          <Button variant="outline" onClick={() => setImportStep("select-importer")}>
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
            <Button variant="outline" onClick={() => setImportStep("upload")}>
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
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <p className="text-lg font-medium mb-1">
            {parsedTransactions.length} transações importadas
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Todas as transações foram adicionadas com sucesso
          </p>
          <Button onClick={resetImport}>
            Importar Mais Transações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  // Handle ESC key globally for the modal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingState.isOpen) {
        cancelEditing();
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [editingState.isOpen]);
  
  // Add a floating editor component that exists outside the table
  const DescriptionEditor = () => {
    if (!editingState.isOpen) return null;
    
    // Handle keyboard events
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelEditing();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        saveDescriptionEdit();
      }
    };
    
    return (
      <div 
        className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
        onClick={(e) => {
          // Close when clicking the backdrop (outside the modal)
          if (e.target === e.currentTarget) {
            cancelEditing();
          }
        }}
      >
        <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Editar Descrição</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Descrição</label>
              <Input
                value={editingState.value}
                onChange={handleEditInputChange}
                onKeyDown={handleKeyDown}
                className="w-full"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelEditing}>
                Cancelar
              </Button>
              <Button onClick={saveDescriptionEdit}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
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
        
        {importStep === "select-importer" && renderImporterSelection()}
        {importStep === "upload" && renderUploadStep()}
        {importStep === "categorize" && renderCategorizeStep()}
        {importStep === "success" && renderSuccessStep()}
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
                    : selectedImporterId === "inter"
                      ? String(parsedTransactions[transactionToDelete].Descricao || "")
                      : ""}
                </p>
                
                <p className="text-sm font-medium">Valor:</p>
                <p className="text-sm">
                  {String(parsedTransactions[transactionToDelete].Valor || "0")}
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
      <DescriptionEditor />
      <TransferModal />
      {renderWeddingCategoryModal()}
    </DashboardLayout>
  );
} 