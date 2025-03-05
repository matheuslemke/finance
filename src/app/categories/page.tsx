"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useCategories } from "@/context/category-context";
import { Category, TransactionType } from "@/types";

export default function CategoriesPage() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Omit<Category, "id">>({
    name: "",
    type: "both",
    color: "#6366f1" // Cor padrão (indigo)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addCategory(formData);
      setIsAddDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !formData.name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await updateCategory(selectedCategory.id, formData);
      setIsEditDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    setIsSubmitting(true);
    try {
      await deleteCategory(selectedCategory.id);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsSubmitting(false);
      setSelectedCategory(null);
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || "#6366f1",
      icon: category.icon
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "both",
      color: "#6366f1"
    });
    setSelectedCategory(null);
  };

  const getTypeLabel = (type: TransactionType | "both") => {
    switch (type) {
      case "income": return "Receita";
      case "expense": return "Despesa";
      case "both": return "Ambos";
      default: return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Categorias</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Todas as Categorias</CardTitle>
                <CardDescription>Gerencie as categorias para suas transações</CardDescription>
              </div>
              <div className="w-full sm:w-auto">
                <Input
                  type="search"
                  placeholder="Pesquisar categorias..."
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
                <span className="ml-2 text-muted-foreground">Carregando categorias...</span>
              </div>
            ) : (
              <>
                {filteredCategories.length > 0 ? (
                  <div className="overflow-hidden rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="py-3 px-4 text-left font-medium text-sm">Nome</th>
                            <th className="py-3 px-4 text-left font-medium text-sm">Tipo</th>
                            <th className="py-3 px-4 text-left font-medium text-sm">Cor</th>
                            <th className="py-3 px-4 text-right font-medium text-sm">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCategories.map((category) => (
                            <tr key={category.id} className="border-b">
                              <td className="py-3 px-4 text-sm">{category.name}</td>
                              <td className="py-3 px-4 text-sm">{getTypeLabel(category.type)}</td>
                              <td className="py-3 px-4 text-sm">
                                <div className="flex items-center">
                                  <div 
                                    className="w-4 h-4 rounded-full mr-2" 
                                    style={{ backgroundColor: category.color || '#6366f1' }}
                                  />
                                  <span>{category.color || '#6366f1'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => openEditDialog(category)}
                                  >
                                    <Pencil className="h-4 w-4 text-blue-500" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => openDeleteDialog(category)}
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
                    {searchTerm ? "Nenhuma categoria encontrada para sua pesquisa." : "Nenhuma categoria ainda. Adicione uma para começar."}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para adicionar categoria */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria para suas transações.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da categoria"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as TransactionType | "both" })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
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
              onClick={handleAddCategory}
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

      {/* Diálogo para editar categoria */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da categoria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da categoria"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as TransactionType | "both" })}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
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
              onClick={handleEditCategory}
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
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCategory && (
            <div className="py-3">
              <p className="font-medium">{selectedCategory.name}</p>
              <p className="text-sm text-muted-foreground">
                Tipo: {getTypeLabel(selectedCategory.type)}
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
              onClick={handleDeleteCategory}
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