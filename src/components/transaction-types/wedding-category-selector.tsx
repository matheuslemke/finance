"use client";

import { DEFAULT_WEDDING_CATEGORIES } from "@/types";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Transaction } from "@/types";

interface WeddingCategorySelectorProps {
  includeWedding: boolean;
  setIncludeWedding: (value: boolean) => void;
  setValue: UseFormSetValue<Omit<Transaction, "id">>;
  watch: UseFormWatch<Omit<Transaction, "id">>;
  errors: FieldErrors<Omit<Transaction, "id">>;
  isSubmitting: boolean;
}

export function WeddingCategorySelector({ 
  includeWedding, 
  setIncludeWedding, 
  setValue,
  watch,
  errors,
  isSubmitting 
}: WeddingCategorySelectorProps) {
  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch 
          id="includeWedding" 
          checked={includeWedding} 
          onCheckedChange={setIncludeWedding}
          disabled={isSubmitting}
        />
        <Label htmlFor="includeWedding">Relacionado ao casamento</Label>
      </div>

      {includeWedding && (
        <div className="space-y-2">
          <Label htmlFor="weddingCategory">Categoria de Casamento</Label>
          <Select 
            value={watch("weddingCategory") || ""}
            onValueChange={(value) => setValue("weddingCategory", value)} 
            disabled={isSubmitting}
          >
            <SelectTrigger id="weddingCategory" className="w-full">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_WEDDING_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.weddingCategory && (
            <p className="text-xs text-destructive mt-1">Categoria de casamento é obrigatória</p>
          )}
        </div>
      )}
    </>
  );
} 