"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Transaction, TransactionType, TransactionClass, DEFAULT_WEDDING_CATEGORIES, Category, Account, AccountType } from "@/types";
import { useCategories } from "@/context/category-context";
import { useAccounts } from "@/context/account-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TransactionFormProps {
  onSubmit: (data: Omit<Transaction, "id">) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function TransactionForm({ onSubmit, onCancel, isSubmitting = false }: TransactionFormProps) {
  const { categories, loading: loadingCategories, addCategory } = useCategories();
  const { accounts, loading: loadingAccounts, addAccount } = useAccounts();
  const [transactionType, setTransactionType] = useState<TransactionType>("expense");
  const [includeWedding, setIncludeWedding] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  
  // Estados para os diálogos de nova categoria e nova conta
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false);
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState<Omit<Category, "id">>({
    name: "",
    type: transactionType,
    color: "#3b82f6"
  });
  const [newAccountData, setNewAccountData] = useState<Omit<Account, "id">>({
    name: "",
    type: "checking",
    color: "#3b82f6",
    balance: 0
  });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<Omit<Transaction, "id">>({
    defaultValues: {
      type: "expense",
      date: new Date(),
      description: "",
      category: "",
      categoryId: "",
      amount: 0,
      account: "",
      accountId: "",
      class: "essential" as TransactionClass,
    }
  });

  register("type", { required: true });
  register("date", { required: true });
  register("categoryId", { required: true });
  register("accountId", { required: true });
  register("class", { required: true });
  register("weddingCategory", { required: includeWedding });

  const filteredCategories = categories.filter(
    category => category.type === transactionType || category.type === "both"
  );

  const filteredAccounts = accounts.filter(account => {
    // Para despesas, mostrar todas as contas
    if (transactionType === "expense") return true;
    
    // Para receitas, não mostrar cartões de crédito
    return account.type !== "credit_card";
  });

  const submitForm = (data: Partial<Omit<Transaction, "id">>) => {
    if (!data.description || !data.categoryId || !data.accountId || !data.class || !data.amount || data.amount <= 0) {
      return;
    }

    if (includeWedding && !data.weddingCategory) {
      return;
    }

    // Encontrar a categoria selecionada para obter o nome e a cor
    const selectedCategory = categories.find(cat => cat.id === data.categoryId);
    
    // Encontrar a conta selecionada para obter o nome e a cor
    const selectedAccount = accounts.find(acc => acc.id === data.accountId);
    
    const formattedData = {
      type: transactionType,
      date: date,
      description: data.description || "",
      categoryId: data.categoryId || "",
      category: selectedCategory?.name || "",
      categoryColor: selectedCategory?.color,
      amount: parseFloat(data.amount?.toString() || "0"),
      accountId: data.accountId || "",
      account: selectedAccount?.name || "",
      accountColor: selectedAccount?.color,
      class: data.class as TransactionClass,
      weddingCategory: includeWedding ? data.weddingCategory : undefined,
    } as Omit<Transaction, "id">;
    
    onSubmit(formattedData);
    reset();
    setTransactionType("expense");
    setIncludeWedding(false);
    setDate(new Date());
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryData.name.trim()) return;
    
    setIsAddingCategory(true);
    try {
      const addedCategory = await addCategory(newCategoryData);
      if (addedCategory) {
        setValue("categoryId", addedCategory.id);
        setIsNewCategoryDialogOpen(false);
      }
    } finally {
      setIsAddingCategory(false);
      setNewCategoryData({
        name: "",
        type: transactionType,
        color: "#3b82f6"
      });
    }
  };

  const handleAddNewAccount = async () => {
    if (!newAccountData.name.trim()) return;
    
    setIsAddingAccount(true);
    try {
      const addedAccount = await addAccount(newAccountData);
      if (addedAccount) {
        setValue("accountId", addedAccount.id);
        setIsNewAccountDialogOpen(false);
      }
    } finally {
      setIsAddingAccount(false);
      setNewAccountData({
        name: "",
        type: "checking",
        color: "#3b82f6",
        balance: 0
      });
    }
  };

  const openNewCategoryDialog = () => {
    setNewCategoryData({
      name: "",
      type: transactionType,
      color: "#3b82f6"
    });
    setIsNewCategoryDialogOpen(true);
  };

  const openNewAccountDialog = () => {
    setNewAccountData({
      name: "",
      type: "checking",
      color: "#3b82f6",
      balance: 0
    });
    setIsNewAccountDialogOpen(true);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      <div className="space-y-4">
        <div>
          <Label className="text-base">Tipo de Transação</Label>
          <RadioGroup 
            defaultValue="expense" 
            className="grid grid-cols-2 gap-4 mt-2"
            onValueChange={(value) => {
              setTransactionType(value as TransactionType);
              setValue("type", value as TransactionType);
              // Limpar a categoria selecionada quando mudar o tipo
              setValue("categoryId", "");
              // Limpar a conta selecionada quando mudar o tipo
              setValue("accountId", "");
            }}
            value={transactionType}
            disabled={isSubmitting}
          >
            <div>
              <RadioGroupItem value="expense" id="expense" className="peer sr-only" />
              <Label
                htmlFor="expense"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-sm sm:text-base"
              >
                Despesa
              </Label>
            </div>
            <div>
              <RadioGroupItem value="income" id="income" className="peer sr-only" />
              <Label
                htmlFor="income"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-sm sm:text-base"
              >
                Receita
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => {
                    if (date) {
                      setDate(date);
                      setValue("date", date);
                    }
                  }}
                  initialFocus
                  disabled={isSubmitting}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register("amount", { required: true, min: 0.01 })}
              disabled={isSubmitting}
              className="w-full"
            />
            {errors.amount && (
              <p className="text-sm text-red-500">O valor é obrigatório e deve ser maior que 0</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            placeholder="Digite a descrição"
            {...register("description", { required: true })}
            disabled={isSubmitting}
            className="w-full"
          />
          {errors.description && (
            <p className="text-sm text-red-500">A descrição é obrigatória</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="categoryId">Categoria</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={openNewCategoryDialog}
                disabled={isSubmitting}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Nova
              </Button>
            </div>
            <Select 
              onValueChange={(value) => setValue("categoryId", value)} 
              defaultValue=""
              disabled={isSubmitting || loadingCategories}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingCategories ? "Carregando..." : "Selecione a categoria"} />
              </SelectTrigger>
              <SelectContent position="popper">
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Carregando categorias...</span>
                  </div>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        {category.color && (
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        {category.name}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-2 px-2 text-sm text-muted-foreground">
                    Nenhuma categoria disponível. Adicione categorias na página de categorias.
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-500">A categoria é obrigatória</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="accountId">Conta</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={openNewAccountDialog}
                disabled={isSubmitting}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Nova
              </Button>
            </div>
            <Select 
              onValueChange={(value) => setValue("accountId", value)} 
              defaultValue=""
              disabled={isSubmitting || loadingAccounts}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingAccounts ? "Carregando..." : "Selecione a conta"} />
              </SelectTrigger>
              <SelectContent position="popper">
                {loadingAccounts ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Carregando contas...</span>
                  </div>
                ) : filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center">
                        {account.color && (
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: account.color }}
                          />
                        )}
                        {account.name}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-2 px-2 text-sm text-muted-foreground">
                    Nenhuma conta disponível. Adicione contas na página de contas.
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-sm text-red-500">A conta é obrigatória</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="class">Classe</Label>
          <Select 
            onValueChange={(value) => setValue("class", value as TransactionClass)} 
            defaultValue="essential"
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a classe" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="essential">Essencial</SelectItem>
              <SelectItem value="non-essential">Não Essencial</SelectItem>
              <SelectItem value="investment">Investimento</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="business">PJ</SelectItem>
            </SelectContent>
          </Select>
          {errors.class && (
            <p className="text-sm text-red-500">A classe é obrigatória</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            id="wedding"
            checked={includeWedding}
            onCheckedChange={setIncludeWedding}
            disabled={isSubmitting}
          />
          <Label htmlFor="wedding" className="cursor-pointer">Incluir categoria de casamento</Label>
        </div>

        {includeWedding && (
          <div className="space-y-2">
            <Label htmlFor="weddingCategory">Categoria de Casamento</Label>
            <Select 
              onValueChange={(value) => setValue("weddingCategory", value)} 
              defaultValue=""
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a categoria de casamento" />
              </SelectTrigger>
              <SelectContent position="popper">
                {DEFAULT_WEDDING_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {includeWedding && errors.weddingCategory && (
              <p className="text-sm text-red-500">A categoria de casamento é obrigatória</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </div>

      {/* Diálogo para adicionar nova categoria */}
      <Dialog open={isNewCategoryDialogOpen} onOpenChange={setIsNewCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria para suas transações.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-category-name">Nome</Label>
              <Input
                id="new-category-name"
                value={newCategoryData.name}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                placeholder="Nome da categoria"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-category-type">Tipo</Label>
              <Select
                value={newCategoryData.type}
                onValueChange={(value) => setNewCategoryData({ ...newCategoryData, type: value as TransactionType | "both" })}
              >
                <SelectTrigger id="new-category-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-category-color">Cor</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="new-category-color"
                  type="color"
                  value={newCategoryData.color}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, color: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={newCategoryData.color}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, color: e.target.value })}
                  placeholder="#RRGGBB"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewCategoryDialogOpen(false)}
              disabled={isAddingCategory}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddNewCategory}
              disabled={isAddingCategory || !newCategoryData.name.trim()}
            >
              {isAddingCategory ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para adicionar nova conta */}
      <Dialog open={isNewAccountDialogOpen} onOpenChange={setIsNewAccountDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Conta</DialogTitle>
            <DialogDescription>
              Adicione uma nova conta bancária ou cartão de crédito.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-account-name">Nome</Label>
              <Input
                id="new-account-name"
                value={newAccountData.name}
                onChange={(e) => setNewAccountData({ ...newAccountData, name: e.target.value })}
                placeholder="Nome da conta"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-account-institution">Instituição</Label>
              <Input
                id="new-account-institution"
                value={newAccountData.institution || ""}
                onChange={(e) => setNewAccountData({ ...newAccountData, institution: e.target.value })}
                placeholder="Nome do banco ou instituição"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-account-type">Tipo</Label>
              <Select
                value={newAccountData.type}
                onValueChange={(value) => {
                  setNewAccountData({ 
                    ...newAccountData, 
                    type: value as AccountType,
                    ...(value !== "credit_card" && { 
                      creditLimit: undefined,
                      closingDay: undefined,
                      dueDay: undefined
                    })
                  });
                }}
              >
                <SelectTrigger id="new-account-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Conta Corrente</SelectItem>
                  <SelectItem value="savings">Conta Poupança</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="investment">Investimento</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="digital_wallet">Carteira Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-account-color">Cor</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="new-account-color"
                  type="color"
                  value={newAccountData.color}
                  onChange={(e) => setNewAccountData({ ...newAccountData, color: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={newAccountData.color}
                  onChange={(e) => setNewAccountData({ ...newAccountData, color: e.target.value })}
                  placeholder="#RRGGBB"
                  className="flex-1"
                />
              </div>
            </div>
            
            {newAccountData.type === "credit_card" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-account-creditLimit">Limite de Crédito</Label>
                  <Input
                    id="new-account-creditLimit"
                    type="number"
                    step="0.01"
                    value={newAccountData.creditLimit || ""}
                    onChange={(e) => setNewAccountData({ ...newAccountData, creditLimit: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-account-closingDay">Dia de Fechamento</Label>
                    <Input
                      id="new-account-closingDay"
                      type="number"
                      min="1"
                      max="31"
                      value={newAccountData.closingDay || ""}
                      onChange={(e) => setNewAccountData({ ...newAccountData, closingDay: parseInt(e.target.value) || undefined })}
                      placeholder="Ex: 15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-account-dueDay">Dia de Vencimento</Label>
                    <Input
                      id="new-account-dueDay"
                      type="number"
                      min="1"
                      max="31"
                      value={newAccountData.dueDay || ""}
                      onChange={(e) => setNewAccountData({ ...newAccountData, dueDay: parseInt(e.target.value) || undefined })}
                      placeholder="Ex: 5"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="new-account-balance">Saldo Inicial</Label>
                <Input
                  id="new-account-balance"
                  type="number"
                  step="0.01"
                  value={newAccountData.balance || ""}
                  onChange={(e) => setNewAccountData({ ...newAccountData, balance: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewAccountDialogOpen(false)}
              disabled={isAddingAccount}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddNewAccount}
              disabled={isAddingAccount || !newAccountData.name.trim()}
            >
              {isAddingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
} 