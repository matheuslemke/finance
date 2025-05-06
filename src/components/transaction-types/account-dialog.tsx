"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Account, AccountType } from "@/types";
import { useAccounts } from "@/context/account-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AccountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAccount: (account: Account) => void;
}

export function AccountDialog({ isOpen, onOpenChange, onAddAccount }: AccountDialogProps) {
  const { addAccount } = useAccounts();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccountData, setNewAccountData] = useState<Omit<Account, "id">>({
    name: "",
    type: "checking",
    color: "#3b82f6",
    balance: 0
  });

  const handleAddNewAccount = async () => {
    if (!newAccountData.name.trim()) return;
    
    setIsAddingAccount(true);
    try {
      const addedAccount = await addAccount(newAccountData);
      if (addedAccount) {
        onAddAccount(addedAccount);
        onOpenChange(false);
      }
    } finally {
      setIsAddingAccount(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setNewAccountData({
      name: "",
      type: "checking",
      color: "#3b82f6",
      balance: 0
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Conta</DialogTitle>
          <DialogDescription>
            Adicione uma nova conta para suas transações.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-account-name">Nome</Label>
            <Input 
              id="new-account-name" 
              value={newAccountData.name}
              onChange={(e) => setNewAccountData({ ...newAccountData, name: e.target.value })}
              placeholder="Nome da conta" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-account-type">Tipo</Label>
            <Select 
              value={newAccountData.type} 
              onValueChange={(value) => setNewAccountData({ 
                ...newAccountData, 
                type: value as AccountType 
              })}
            >
              <SelectTrigger id="new-account-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Conta Poupança</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="investment">Investimento</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="digital_wallet">Carteira Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-account-balance">Saldo Inicial</Label>
            <Input 
              id="new-account-balance" 
              type="number"
              step="0.01"
              value={newAccountData.balance}
              onChange={(e) => setNewAccountData({ 
                ...newAccountData, 
                balance: parseFloat(e.target.value) || 0 
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-account-color">Cor</Label>
            <Input 
              id="new-account-color" 
              type="color"
              value={newAccountData.color}
              onChange={(e) => setNewAccountData({ ...newAccountData, color: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAddingAccount}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddNewAccount}
            disabled={isAddingAccount || !newAccountData.name.trim()}
          >
            {isAddingAccount ? (
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
  );
} 