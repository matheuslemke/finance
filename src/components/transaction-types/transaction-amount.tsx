"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Transaction } from "@/types";

interface TransactionAmountProps {
  register: UseFormRegister<Omit<Transaction, "id">>;
  errors: FieldErrors<Omit<Transaction, "id">>;
  isSubmitting: boolean;
}

export function TransactionAmount({ register, errors, isSubmitting }: TransactionAmountProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="amount">Valor</Label>
      <Input
        id="amount"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0,00"
        disabled={isSubmitting}
        {...register("amount", { 
          required: true,
          min: 0.01,
          valueAsNumber: true
        })}
      />
      {errors.amount && (
        <p className="text-xs text-destructive mt-1">Valor deve ser maior que zero</p>
      )}
    </div>
  );
} 