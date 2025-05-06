"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Transaction } from "@/types";

interface TransactionDescriptionProps {
  register: UseFormRegister<Omit<Transaction, "id">>;
  errors: FieldErrors<Omit<Transaction, "id">>;
  isSubmitting: boolean;
}

export function TransactionDescription({ register, errors, isSubmitting }: TransactionDescriptionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Descrição</Label>
      <Input
        id="description"
        placeholder="Descrição da transação"
        disabled={isSubmitting}
        {...register("description", { required: true })}
      />
      {errors.description && (
        <p className="text-xs text-destructive mt-1">Descrição é obrigatória</p>
      )}
    </div>
  );
} 