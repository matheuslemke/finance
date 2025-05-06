"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Transaction, TransactionType } from "@/types";
import { useCategories } from "@/context/category-context";
import { useAccounts } from "@/context/account-context";
import { ExpenseForm } from "./transaction-types/expense-form";
import { IncomeForm } from "./transaction-types/income-form";
import { TransferForm } from "./transaction-types/transfer-form";
import { DateSelector } from "./transaction-types/date-selector";
import { TransactionAmount } from "./transaction-types/transaction-amount";
import { TransactionDescription } from "./transaction-types/transaction-description";
import { WeddingCategorySelector } from "./transaction-types/wedding-category-selector";

interface TransactionFormProps {
  onSubmit: (data: Omit<Transaction, "id">) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function TransactionForm({ onSubmit, onCancel, isSubmitting = false }: TransactionFormProps) {
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const [date, setDate] = useState<Date>(new Date());
  const [includeWedding, setIncludeWedding] = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm<Omit<Transaction, "id">>({
    defaultValues: {
      type: "expense",
      date: new Date(),
      description: "",
      amount: 0,
      class: "essential",
      accountId: "",
      categoryId: "",
    }
  });
  
  const transactionType = watch("type") as TransactionType;

  register("type", { required: true });
  register("date", { required: true });
  register("description", { required: true });
  register("amount", { required: true, min: 0.01 });
  
  // Register conditional fields based on transaction type
  if (transactionType === "transfer") {
    register("accountId", { required: true });
    register("destinationAccountId", { required: true });
  } else {
    register("accountId", { required: true });
    register("categoryId", { required: true });
    register("class", { required: true });
  }
  
  if (includeWedding) {
    register("weddingCategory", { required: true });
  }

  const filteredAccounts = accounts.filter(account => {
    if (transactionType === "transfer") return true;
    if (transactionType === "income") return account.type !== "credit_card";
    return true;
  });

  const submitForm = (data: Partial<Omit<Transaction, "id">>) => {
    if (!data.description || !data.accountId || !data.amount || data.amount <= 0) {
      return;
    }

    if (transactionType !== "transfer" && (!data.categoryId || !data.class)) {
      return;
    }

    if (transactionType === "transfer" && !data.destinationAccountId) {
      return;
    }

    if (includeWedding && !data.weddingCategory) {
      return;
    }

    const selectedAccount = accounts.find(acc => acc.id === data.accountId);
    
    let formattedData: Omit<Transaction, "id">;
    
    if (transactionType === "transfer") {
      const destinationAccount = accounts.find(acc => acc.id === data.destinationAccountId);
      formattedData = {
        type: "transfer",
        date,
        description: data.description || "",
        categoryId: "",
        category: "Transferência",
        amount: parseFloat(data.amount?.toString() || "0"),
        accountId: data.accountId || "",
        account: selectedAccount?.name || "",
        accountColor: selectedAccount?.color,
        class: "essential",
        weddingCategory: includeWedding ? data.weddingCategory : undefined,
        destinationAccountId: data.destinationAccountId,
        destinationAccount: destinationAccount?.name,
        destinationAccountColor: destinationAccount?.color,
      } as Omit<Transaction, "id">;
    } else {
      const selectedCategory = categories.find(cat => cat.id === data.categoryId);
      formattedData = {
        type: transactionType,
        date,
        description: data.description || "",
        categoryId: data.categoryId || "",
        category: selectedCategory?.name || "",
        categoryColor: selectedCategory?.color,
        amount: parseFloat(data.amount?.toString() || "0"),
        accountId: data.accountId || "",
        account: selectedAccount?.name || "",
        accountColor: selectedAccount?.color,
        class: data.class,
        weddingCategory: includeWedding ? data.weddingCategory : undefined,
      } as Omit<Transaction, "id">;
    }
    
    onSubmit(formattedData);
    reset();
    setValue("type", "expense");
    setIncludeWedding(false);
    setDate(new Date());
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      <div className="space-y-4">
        <div>
          <Label className="text-base">Tipo de Transação</Label>
          <RadioGroup 
            defaultValue="expense" 
            className="grid grid-cols-3 gap-4 mt-2"
            onValueChange={(value) => {
              setValue("type", value as TransactionType);
              if (value !== "transfer") {
                setValue("destinationAccountId", "");
              }
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
            <div>
              <RadioGroupItem value="transfer" id="transfer" className="peer sr-only" />
              <Label
                htmlFor="transfer"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-sm sm:text-base"
              >
                Transferência
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateSelector 
            date={date} 
            setDate={setDate} 
            setValue={setValue} 
            isSubmitting={isSubmitting} 
          />

          <TransactionAmount 
            register={register} 
            errors={errors} 
            isSubmitting={isSubmitting} 
          />
        </div>

        <TransactionDescription 
          register={register} 
          errors={errors} 
          isSubmitting={isSubmitting} 
        />

        {transactionType === "expense" && (
          <ExpenseForm 
            errors={errors}
            watch={watch}
            setValue={setValue}
            filteredAccounts={filteredAccounts}
            isSubmitting={isSubmitting}
          />
        )}

        {transactionType === "income" && (
          <IncomeForm 
            errors={errors}
            watch={watch}
            setValue={setValue}
            filteredAccounts={filteredAccounts}
            isSubmitting={isSubmitting}
          />
        )}

        {transactionType === "transfer" && (
          <TransferForm 
            errors={errors}
            watch={watch}
            setValue={setValue}
            accounts={accounts}
            isSubmitting={isSubmitting}
          />
        )}

        <WeddingCategorySelector 
          includeWedding={includeWedding}
          setIncludeWedding={setIncludeWedding}
          setValue={setValue}
          watch={watch}
          errors={errors}
          isSubmitting={isSubmitting}
        />
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
            "Salvar Transação"
          )}
        </Button>
      </div>
    </form>
  );
} 