"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard } from "lucide-react";
import { useTransactions } from "@/context/transaction-context";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { format } from "date-fns";
import Link from "next/link";

export default function Home() {
  const { transactions } = useTransactions();

  // Calculate total balance, income, expenses, and savings
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalBalance = totalIncome - totalExpenses;
  
  // Get recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  // Calculate upcoming bills (expenses with future dates)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingBills = transactions
    .filter(t => t.type === "expense" && t.date > today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 4);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <AddTransactionDialog onTransactionAdded={() => {}} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {totalBalance >= 0 ? "You're doing great!" : "Time to cut back on expenses"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(t => t.type === "income").length} income transactions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(t => t.type === "expense").length} expense transactions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalIncome > 0 
                  ? `${(((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)}%` 
                  : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalIncome > 0 && (totalIncome - totalExpenses) / totalIncome > 0.2 
                  ? "Great savings rate!" 
                  : "Try to save more"}
              </p>
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
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${transaction.type === "expense" ? 'bg-red-100' : 'bg-green-100'}`}>
                          {transaction.type === "expense" ? (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(transaction.date, "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                      <p className={`font-medium ${transaction.type === "expense" ? 'text-red-500' : 'text-green-500'}`}>
                        {transaction.type === "expense" ? '-' : '+'}${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    No transactions yet. Add one to get started.
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Link href="/transactions">
                  <Button variant="outline" className="w-full">View All Transactions</Button>
                </Link>
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
                {upcomingBills.length > 0 ? (
                  upcomingBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{bill.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Due on {format(bill.date, "dd MMM yyyy")}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${bill.amount.toFixed(2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    No upcoming bills.
                  </div>
                )}
              </div>
              <div className="mt-4">
                <AddTransactionDialog onTransactionAdded={() => {}}>
                  <Button variant="outline" className="w-full">Add New Bill</Button>
                </AddTransactionDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
