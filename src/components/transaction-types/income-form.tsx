"use client";

import { Account } from "@/types";
import { UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Transaction } from "@/types";
import { AccountSelector } from "./account-selector";
import { CategorySelector } from "./category-selector";
import { TransactionClassSelector } from "./transaction-class-selector";

interface IncomeFormProps {
  watch: UseFormWatch<Omit<Transaction, "id">>;
  setValue: UseFormSetValue<Omit<Transaction, "id">>;
  errors: FieldErrors<Omit<Transaction, "id">>;
  filteredAccounts: Account[];
  isSubmitting: boolean;
}

export function IncomeForm({ 
  watch, 
  setValue, 
  errors, 
  filteredAccounts,
  isSubmitting 
}: IncomeFormProps) {
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
        transactionType="income"
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