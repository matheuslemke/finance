"use client";

import { Account } from "@/types";
import { UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Transaction } from "@/types";
import { AccountSelector } from "./account-selector";
import { CategorySelector } from "./category-selector";
import { TransactionClassSelector } from "./transaction-class-selector";

interface ExpenseFormProps {
  watch: UseFormWatch<Omit<Transaction, "id">>;
  setValue: UseFormSetValue<Omit<Transaction, "id">>;
  errors: FieldErrors<Omit<Transaction, "id">>;
  filteredAccounts: Account[];
  isSubmitting: boolean;
}

export function ExpenseForm({ 
  watch, 
  setValue, 
  errors, 
  filteredAccounts,
  isSubmitting 
}: ExpenseFormProps) {
  const currentAccountId = watch("accountId");

  return (
    <>
      <AccountSelector
        label="Conta"
        accounts={filteredAccounts}
        fieldName="accountId"
        currentValue={currentAccountId}
        setValue={setValue}
        errors={errors}
        isSubmitting={isSubmitting}
      />
      
      <CategorySelector
        watch={watch}
        setValue={setValue}
        errors={errors}
        isSubmitting={isSubmitting}
        transactionType="expense"
      />
      
      <TransactionClassSelector
        watch={watch}
        setValue={setValue}
        errors={errors}
        isSubmitting={isSubmitting}
      />
    </>
  );
} 