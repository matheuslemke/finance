import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownRight, Search, Filter } from "lucide-react";

export default function TransactionsPage() {
  const transactions = [
    {
      id: 1,
      date: "2023-06-01",
      description: "Salary",
      category: "Income",
      amount: 2500.00,
      type: "income"
    },
    {
      id: 2,
      date: "2023-06-02",
      description: "Rent",
      category: "Housing",
      amount: 1200.00,
      type: "expense"
    },
    {
      id: 3,
      date: "2023-06-03",
      description: "Grocery Shopping",
      category: "Food",
      amount: 150.75,
      type: "expense"
    },
    {
      id: 4,
      date: "2023-06-05",
      description: "Freelance Work",
      category: "Income",
      amount: 500.00,
      type: "income"
    },
    {
      id: 5,
      date: "2023-06-07",
      description: "Electricity Bill",
      category: "Utilities",
      amount: 85.20,
      type: "expense"
    },
    {
      id: 6,
      date: "2023-06-10",
      description: "Internet Bill",
      category: "Utilities",
      amount: 60.00,
      type: "expense"
    },
    {
      id: 7,
      date: "2023-06-15",
      description: "Bonus",
      category: "Income",
      amount: 1000.00,
      type: "income"
    },
    {
      id: 8,
      date: "2023-06-18",
      description: "Restaurant",
      category: "Food",
      amount: 75.50,
      type: "expense"
    },
    {
      id: 9,
      date: "2023-06-20",
      description: "Gas",
      category: "Transportation",
      amount: 45.00,
      type: "expense"
    },
    {
      id: 10,
      date: "2023-06-25",
      description: "Phone Bill",
      category: "Utilities",
      amount: 50.00,
      type: "expense"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <Button>Add Transaction</Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>A list of all your transactions</CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 w-[200px]"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium text-sm">Date</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Description</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Category</th>
                    <th className="py-3 px-4 text-right font-medium text-sm">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b">
                      <td className="py-3 px-4 text-sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">{transaction.description}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <div className="flex items-center justify-end">
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={
                              transaction.type === "income"
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {transaction.type === "income" ? "+" : "-"}$
                            {transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing 10 of 100 transactions
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 