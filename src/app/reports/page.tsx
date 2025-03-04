import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Reports</h1>
          <div className="flex space-x-2">
            <Button variant="outline">This Month</Button>
            <Button variant="outline">Export</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>Monthly comparison for the current year</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Chart visualization would go here
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    (In a real app, we would use a chart library like Chart.js or Recharts)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Where your money is going</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Pie chart visualization would go here
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    (In a real app, we would use a chart library like Chart.js or Recharts)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>Financial overview for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium text-sm">Month</th>
                    <th className="py-3 px-4 text-right font-medium text-sm">Income</th>
                    <th className="py-3 px-4 text-right font-medium text-sm">Expenses</th>
                    <th className="py-3 px-4 text-right font-medium text-sm">Savings</th>
                    <th className="py-3 px-4 text-right font-medium text-sm">Savings Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { month: "January", income: 4500, expenses: 3200, savings: 1300, rate: 28.9 },
                    { month: "February", income: 4200, expenses: 3100, savings: 1100, rate: 26.2 },
                    { month: "March", income: 4800, expenses: 3300, savings: 1500, rate: 31.3 },
                    { month: "April", income: 4600, expenses: 3400, savings: 1200, rate: 26.1 },
                    { month: "May", income: 5000, expenses: 3500, savings: 1500, rate: 30.0 },
                    { month: "June", income: 4900, expenses: 3200, savings: 1700, rate: 34.7 },
                  ].map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-3 px-4 text-sm font-medium">{item.month}</td>
                      <td className="py-3 px-4 text-sm text-right">${item.income.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-right">${item.expenses.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-right">${item.savings.toFixed(2)}</td>
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