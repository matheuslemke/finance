import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard } from "lucide-react";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,546.00</div>
              <p className="text-xs text-muted-foreground">+2.5% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,935.00</div>
              <p className="text-xs text-muted-foreground">+10.2% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,450.00</div>
              <p className="text-xs text-muted-foreground">+3.1% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,485.00</div>
              <p className="text-xs text-muted-foreground">+7.2% from last month</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your recent financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${i % 2 === 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                        {i % 2 === 0 ? (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{i % 2 === 0 ? 'Shopping' : 'Salary'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`font-medium ${i % 2 === 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {i % 2 === 0 ? '-$89.00' : '+$2,500.00'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">View All Transactions</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bills</CardTitle>
              <CardDescription>Bills due in the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Rent', 'Electricity', 'Internet', 'Insurance'].map((bill, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{bill}</p>
                      <p className="text-xs text-muted-foreground">
                        Due in {5 + i * 3} days
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(150 * (i + 1)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">Manage Bills</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
