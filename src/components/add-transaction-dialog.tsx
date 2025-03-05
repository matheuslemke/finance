"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/transaction-form";
import { Transaction } from "@/types";
import { toast } from "sonner";

interface AddTransactionDialogProps {
  onTransactionAdded: (transaction: Omit<Transaction, "id">) => Promise<void>;
  children?: React.ReactNode;
}

export function AddTransactionDialog({ onTransactionAdded, children }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Omit<Transaction, "id">) => {
    try {
      setIsSubmitting(true);
      await onTransactionAdded(data);
      setOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      toast.error("Erro ao adicionar transação");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Adicionar Transação</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-w-full p-4 sm:p-6 max-h-[90vh] overflow-hidden">
        <DialogHeader className="mb-2 sm:mb-4">
          <DialogTitle className="text-lg sm:text-xl">Adicionar Nova Transação</DialogTitle>
          <DialogDescription className="text-sm">
            Digite os detalhes da sua transação abaixo.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm 
          onSubmit={handleSubmit} 
          onCancel={() => setOpen(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
} 