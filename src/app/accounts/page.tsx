"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, CreditCard, Landmark, Wallet } from "lucide-react";
import { useAccounts } from "@/context/account-context";
import { Account, AccountType } from "@/types";

export default function AccountsPage() {
  const { accounts, loading, addAccount, updateAccount, deleteAccount } = useAccounts();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<Omit<Account, "id">>({
    name: "",
    type: "checking",
    color: "#3b82f6", // Cor padrão (azul)
    institution: "",
    balance: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.institution?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAccount = async () => {
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addAccount(formData);
      setIsAddDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAccount = async () => {
    if (!selectedAccount || !formData.name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await updateAccount(selectedAccount.id, formData);
      setIsEditDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    
    setIsSubmitting(true);
    try {
      await deleteAccount(selectedAccount.id);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsSubmitting(false);
      setSelectedAccount(null);
    }
  };

  const openEditDialog = (account: Account) => {
    setSelectedAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      color: account.color || "#3b82f6",
      institution: account.institution || "",
      balance: account.balance || 0,
      creditLimit: account.creditLimit,
      closingDay: account.closingDay,
      dueDay: account.dueDay
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (account: Account) => {
    setSelectedAccount(account);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "checking",
      color: "#3b82f6",
      institution: "",
      balance: 0
    });
    setSelectedAccount(null);
  };

  const getTypeLabel = (type: AccountType) => {
    switch (type) {
      case "checking": return "Conta Corrente";
      case "savings": return "Conta Poupança";
      case "credit_card": return "Cartão de Crédito";
      case "investment": return "Investimento";
      case "cash": return "Dinheiro";
      case "digital_wallet": return "Carteira Digital";
      default: return type;
    }
  };

  const getTypeIcon = (type: AccountType) => {
    switch (type) {
      case "checking":
      case "savings":
        return <Landmark className="h-4 w-4" />;
      case "credit_card":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  const isCreditCard = (type: AccountType) => type === "credit_card";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Contas</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Todas as Contas</CardTitle>
                <CardDescription>Gerencie suas contas bancárias e cartões de crédito</CardDescription>
              </div>
              <div className="w-full sm:w-auto">
                <Input
                  type="search"
                  placeholder="Pesquisar contas..."
                  className="w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando contas...</span>
              </div>
            ) : (
              <>
                {filteredAccounts.length > 0 ? (
                  <div className="overflow-hidden rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="py-3 px-4 text-left font-medium text-sm">Nome</th>
                            <th className="py-3 px-4 text-left font-medium text-sm">Instituição</th>
                            <th className="py-3 px-4 text-left font-medium text-sm">Tipo</th>
                            <th className="py-3 px-4 text-right font-medium text-sm">Saldo</th>
                            <th className="py-3 px-4 text-right font-medium text-sm">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAccounts.map((account) => (
                            <tr key={account.id} className="border-b">
                              <td className="py-3 px-4 text-sm">
                                <div className="flex items-center">
                                  <div 
                                    className="w-4 h-4 rounded-full mr-2" 
                                    style={{ backgroundColor: account.color || '#3b82f6' }}
                                  />
                                  {account.name}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm">{account.institution || "-"}</td>
                              <td className="py-3 px-4 text-sm">
                                <div className="flex items-center">
                                  {getTypeIcon(account.type)}
                                  <span className="ml-2">{getTypeLabel(account.type)}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-right">
                                {isCreditCard(account.type) 
                                  ? `Limite: R$ ${account.creditLimit?.toFixed(2) || "0.00"}`
                                  : `R$ ${account.balance?.toFixed(2) || "0.00"}`
                                }
                              </td>
                              <td className="py-3 px-4 text-sm text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => openEditDialog(account)}
                                  >
                                    <Pencil className="h-4 w-4 text-blue-500" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => openDeleteDialog(account)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    {searchTerm ? "Nenhuma conta encontrada para sua pesquisa." : "Nenhuma conta ainda. Adicione uma para começar."}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para adicionar conta */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Conta</DialogTitle>
            <DialogDescription>
              Adicione uma nova conta bancária ou cartão de crédito.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da conta"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Instituição</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="Nome do banco ou instituição"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  setFormData({ 
                    ...formData, 
                    type: value as AccountType,
                    // Limpar campos específicos de cartão de crédito se não for cartão
                    ...(value !== "credit_card" && { 
                      creditLimit: undefined,
                      closingDay: undefined,
                      dueDay: undefined
                    })
                  });
                }}
              >
                <SelectTrigger id="type">
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
              <Label htmlFor="color">Cor</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#RRGGBB"
                  className="flex-1"
                />
              </div>
            </div>
            
            {formData.type === "credit_card" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Limite de Crédito</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    step="0.01"
                    value={formData.creditLimit || ""}
                    onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="closingDay">Dia de Fechamento</Label>
                    <Input
                      id="closingDay"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.closingDay || ""}
                      onChange={(e) => setFormData({ ...formData, closingDay: parseInt(e.target.value) || undefined })}
                      placeholder="Ex: 15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDay">Dia de Vencimento</Label>
                    <Input
                      id="dueDay"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dueDay || ""}
                      onChange={(e) => setFormData({ ...formData, dueDay: parseInt(e.target.value) || undefined })}
                      placeholder="Ex: 5"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="balance">Saldo Inicial</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance || ""}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddAccount}
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar conta */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Conta</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da conta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da conta"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-institution">Instituição</Label>
              <Input
                id="edit-institution"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="Nome do banco ou instituição"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  setFormData({ 
                    ...formData, 
                    type: value as AccountType,
                    // Limpar campos específicos de cartão de crédito se não for cartão
                    ...(value !== "credit_card" && { 
                      creditLimit: undefined,
                      closingDay: undefined,
                      dueDay: undefined
                    })
                  });
                }}
              >
                <SelectTrigger id="edit-type">
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
              <Label htmlFor="edit-color">Cor</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="edit-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#RRGGBB"
                  className="flex-1"
                />
              </div>
            </div>
            
            {formData.type === "credit_card" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-creditLimit">Limite de Crédito</Label>
                  <Input
                    id="edit-creditLimit"
                    type="number"
                    step="0.01"
                    value={formData.creditLimit || ""}
                    onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-closingDay">Dia de Fechamento</Label>
                    <Input
                      id="edit-closingDay"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.closingDay || ""}
                      onChange={(e) => setFormData({ ...formData, closingDay: parseInt(e.target.value) || undefined })}
                      placeholder="Ex: 15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-dueDay">Dia de Vencimento</Label>
                    <Input
                      id="edit-dueDay"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dueDay || ""}
                      onChange={(e) => setFormData({ ...formData, dueDay: parseInt(e.target.value) || undefined })}
                      placeholder="Ex: 5"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="edit-balance">Saldo</Label>
                <Input
                  id="edit-balance"
                  type="number"
                  step="0.01"
                  value={formData.balance || ""}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEditAccount}
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAccount && (
            <div className="py-3">
              <p className="font-medium">{selectedAccount.name}</p>
              <p className="text-sm text-muted-foreground">
                Tipo: {getTypeLabel(selectedAccount.type)}
                {selectedAccount.institution && ` • ${selectedAccount.institution}`}
              </p>
            </div>
          )}
          
          <DialogFooter className="flex sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 