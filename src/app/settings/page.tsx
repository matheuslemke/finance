import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Configurações</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Gerencie as configurações da sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold">
                    JD
                  </div>
                  <Button variant="outline" size="sm">Alterar Avatar</Button>
                </div>
                <div className="pt-4">
                  <h3 className="font-medium mb-2">João Silva</h3>
                  <p className="text-sm text-muted-foreground">joao.silva@exemplo.com</p>
                  <p className="text-sm text-muted-foreground">Membro desde Jan 2023</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize seus dados pessoais</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">
                        Nome
                      </label>
                      <Input id="firstName" defaultValue="João" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">
                        Sobrenome
                      </label>
                      <Input id="lastName" defaultValue="Silva" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input id="email" type="email" defaultValue="joao.silva@exemplo.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Telefone
                    </label>
                    <Input id="phone" type="tel" defaultValue="(11) 98765-4321" />
                  </div>
                  
                  <div className="pt-2">
                    <Button>Salvar Alterações</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Gerencie sua senha e configurações de segurança</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Senha</h3>
                      <p className="text-sm text-muted-foreground">
                        Última alteração há 3 meses
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Alterar Senha</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Alterar Senha</DialogTitle>
                          <DialogDescription>
                            Digite sua senha atual e uma nova senha.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label htmlFor="currentPassword" className="text-sm font-medium">
                              Senha Atual
                            </label>
                            <Input id="currentPassword" type="password" />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="newPassword" className="text-sm font-medium">
                              Nova Senha
                            </label>
                            <Input id="newPassword" type="password" />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                              Confirmar Nova Senha
                            </label>
                            <Input id="confirmPassword" type="password" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Salvar Alterações</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <h3 className="font-medium">Autenticação de Dois Fatores</h3>
                      <p className="text-sm text-muted-foreground">
                        Adicione uma camada extra de segurança à sua conta
                      </p>
                    </div>
                    <Button variant="outline">Ativar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 