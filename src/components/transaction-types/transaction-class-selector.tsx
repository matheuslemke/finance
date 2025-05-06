"use client";

import { TransactionClass } from "@/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Transaction } from "@/types";

interface TransactionClassSelectorProps {
  watch: UseFormWatch<Omit<Transaction, "id">>;
  setValue: UseFormSetValue<Omit<Transaction, "id">>;
  errors: FieldErrors<Omit<Transaction, "id">>;
  isSubmitting: boolean;
}

export function TransactionClassSelector({ watch, setValue, errors, isSubmitting }: TransactionClassSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="class">Classe</Label>
      <Select 
        value={watch("class") || ""}
        onValueChange={(value) => setValue("class", value as TransactionClass)}
        disabled={isSubmitting}
      >
        <SelectTrigger id="class">
          <SelectValue placeholder="Selecione uma classe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="essential">Essencial</SelectItem>
          <SelectItem value="non-essential">Não Essencial</SelectItem>
          <SelectItem value="investment">Investimento</SelectItem>
          <SelectItem value="income">Receita</SelectItem>
          <SelectItem value="business">PJ</SelectItem>
        </SelectContent>
      </Select>
      {errors.class && (
        <p className="text-xs text-destructive mt-1">Classe é obrigatória</p>
      )}
    </div>
  );
} 