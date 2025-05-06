"use client";

import { Plus } from "lucide-react";
import { Account } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormSetValue, FieldErrors } from "react-hook-form";
import { Transaction } from "@/types";
import { useState } from "react";
import { useAccounts } from "@/context/account-context";
import { AccountDialog } from "./account-dialog";

interface AccountSelectorProps {
  label: string;
  accounts: Account[];
  fieldName: "accountId" | "destinationAccountId";
  currentValue: string;
  setValue: UseFormSetValue<Omit<Transaction, "id">>;
  errors: FieldErrors<Omit<Transaction, "id">>;
  isSubmitting: boolean;
  excludeId?: string;
}

export function AccountSelector({ 
  label,
  accounts,
  fieldName,
  currentValue,
  setValue,
  errors,
  isSubmitting,
  excludeId
}: AccountSelectorProps) {
  const { addAccount } = useAccounts();
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false);
  
  const filteredAccounts = excludeId 
    ? accounts.filter(account => account.id !== excludeId)
    : accounts;
  
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName}>{label}</Label>
      <div className="flex space-x-2">
        <Select 
          value={currentValue || ""}
          onValueChange={(value) => setValue(fieldName, value)}
          disabled={isSubmitting}
        >
          <SelectTrigger id={fieldName} className="flex-1">
            <SelectValue placeholder="Selecione uma conta" />
          </SelectTrigger>
          <SelectContent>
            {filteredAccounts.map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsNewAccountDialogOpen(true)}
          disabled={isSubmitting}
          className="flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {errors[fieldName] && (
        <p className="text-xs text-destructive mt-1">Conta é obrigatória</p>
      )}
      
      <AccountDialog 
        isOpen={isNewAccountDialogOpen} 
        onOpenChange={setIsNewAccountDialogOpen}
        onAddAccount={(account) => setValue(fieldName, account.id)}
      />
    </div>
  );
} 