"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useInvoices } from "@/context/invoice-context";

export default function InvoicesPage() {
  const { invoices, loading } = useInvoices();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Faturas</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Carregando faturas...</p>
          </div>
        ) : (
          <div>
            {invoices.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 dark:text-gray-400">Nenhuma fatura encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mostraremos as faturas aqui em breve */}
                <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                  {JSON.stringify(invoices, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
