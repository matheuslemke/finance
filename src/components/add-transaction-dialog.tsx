"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/transaction-form";
import { Transaction } from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface AddTransactionDialogProps {
  onTransactionAdded: (transaction: Transaction) => void;
  children?: React.ReactNode;
}

export function AddTransactionDialog({ onTransactionAdded, children }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...data,
      id: uuidv4(),
    };
    
    onTransactionAdded(newTransaction);
    toast.success("Transaction added successfully");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Add Transaction</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Enter the details of your transaction below.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm 
          onSubmit={handleSubmit} 
          onCancel={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
} 