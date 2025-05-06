"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Category, TransactionType } from "@/types";
import { useCategories } from "@/context/category-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormSetValue, FieldErrors, UseFormWatch } from "react-hook-form";
import { Transaction } from "@/types";

interface CategorySelectorProps {
  watch: UseFormWatch<Omit<Transaction, "id">>;
  setValue: UseFormSetValue<Omit<Transaction, "id">>;
  errors: FieldErrors<Omit<Transaction, "id">>;
  isSubmitting: boolean;
  transactionType: TransactionType;
}

export function CategorySelector({ watch, setValue, errors, isSubmitting, transactionType }: CategorySelectorProps) {
  const { categories, addCategory } = useCategories();
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState<Omit<Category, "id">>({
    name: "",
    type: transactionType,
    color: "#3b82f6"
  });

  const filteredCategories = categories.filter(
    category => category.type === transactionType || category.type === "both"
  );

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
      resetForm();
    }
  };

  const resetForm = () => {
    setNewCategoryData({
      name: "",
      type: transactionType,
      color: "#3b82f6"
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="categoryId">Categoria</Label>
      <div className="flex space-x-2">
        <Select 
          value={watch("categoryId") || ""}
          onValueChange={(value) => setValue("categoryId", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="categoryId" className="flex-1">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsNewCategoryDialogOpen(true)}
          disabled={isSubmitting}
          className="flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {errors.categoryId && (
        <p className="text-xs text-destructive mt-1">Categoria é obrigatória</p>
      )}

      <Dialog open={isNewCategoryDialogOpen} onOpenChange={setIsNewCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria para suas transações.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <Label>Tipo</Label>
              <RadioGroup 
                value={newCategoryData.type} 
                onValueChange={(value) => setNewCategoryData({ 
                  ...newCategoryData, 
                  type: value as TransactionType | "both" 
                })}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="new-category-income" />
                  <Label htmlFor="new-category-income">Receita</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="new-category-expense" />
                  <Label htmlFor="new-category-expense">Despesa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="new-category-both" />
                  <Label htmlFor="new-category-both">Ambos</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-category-color">Cor</Label>
              <Input 
                id="new-category-color" 
                type="color"
                value={newCategoryData.color}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, color: e.target.value })}
              />
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
                  Adicionando...
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 