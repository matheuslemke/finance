import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <div className="flex space-x-2">
            <Button variant="outline">Este Mês</Button>
            <Button variant="outline">Exportar</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas</CardTitle>
              <CardDescription>Comparação mensal para o ano atual</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    A visualização do gráfico apareceria aqui
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    (Em um aplicativo real, usaríamos uma biblioteca de gráficos como Chart.js ou Recharts)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
              <CardDescription>Para onde seu dinheiro está indo</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    A visualização do gráfico de pizza apareceria aqui
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    (Em um aplicativo real, usaríamos uma biblioteca de gráficos como Chart.js ou Recharts)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Resumo Mensal</CardTitle>
            <CardDescription>Visão geral financeira dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium text-sm">Mês</th>
                    <th className="py-3 px-4 text-right font-medium text-sm">Receitas</th>
                    <th className="py-3 px-4 text-right font-medium text-sm">Despesas</th>
                    <th className="py-3 px-4 text-right font-medium text-sm">Economia</th>
                    <th className="py-3 px-4 text-right font-medium text-sm">Taxa de Economia</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { month: "Janeiro", income: 4500, expenses: 3200, savings: 1300, rate: 28.9 },
                    { month: "Fevereiro", income: 4200, expenses: 3100, savings: 1100, rate: 26.2 },
                    { month: "Março", income: 4800, expenses: 3300, savings: 1500, rate: 31.3 },
                    { month: "Abril", income: 4600, expenses: 3400, savings: 1200, rate: 26.1 },
                    { month: "Maio", income: 5000, expenses: 3500, savings: 1500, rate: 30.0 },
                    { month: "Junho", income: 4900, expenses: 3200, savings: 1700, rate: 34.7 },
                  ].map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-3 px-4 text-sm font-medium">{item.month}</td>
                      <td className="py-3 px-4 text-sm text-right">R${item.income.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-right">R${item.expenses.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-right">R${item.savings.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className={`${item.rate >= 30 ? 'text-green-500' : 'text-amber-500'}`}>
                          {item.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Monthly Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,666.67</div>
              <p className="text-xs text-muted-foreground">+8.2% from last year</p>
              <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-green-500 h-1 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Monthly Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$3,283.33</div>
              <p className="text-xs text-muted-foreground">+3.5% from last year</p>
              <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-red-500 h-1 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Savings Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">29.5%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last year</p>
              <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-1 rounded-full" style={{ width: '29.5%' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 