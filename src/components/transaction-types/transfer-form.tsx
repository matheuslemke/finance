"use client";

import { Account } from "@/types";
import { UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Transaction } from "@/types";
import { AccountSelector } from "./account-selector";

interface TransferFormProps {
  watch: UseFormWatch<Omit<Transaction, "id">>;
  setValue: UseFormSetValue<Omit<Transaction, "id">>;
  errors: FieldErrors<Omit<Transaction, "id">>;
  accounts: Account[];
  isSubmitting: boolean;
}

export function TransferForm({ 
  watch, 
  setValue, 
  errors, 
  accounts,
  isSubmitting 
}: TransferFormProps) {
  const currentAccountId = watch("accountId");
  const destinationAccountId = watch("destinationAccountId");

  // Filter to show only checking accounts as origin accounts
  const checkingAccounts = accounts.filter(account => account.type === "checking");
  
  return (
    <>
      <AccountSelector
        label="Conta de Origem"
        accounts={checkingAccounts}
        fieldName="accountId"
        currentValue={currentAccountId || ""}
        setValue={setValue}
        errors={errors}
        isSubmitting={isSubmitting}
      />
      
      <AccountSelector
        label="Conta de Destino"
        accounts={accounts}
        fieldName="destinationAccountId"
        currentValue={destinationAccountId || ""}
        setValue={setValue}
        errors={errors}
        isSubmitting={isSubmitting}
        excludeId={currentAccountId}
      />
    </>
  );
} 