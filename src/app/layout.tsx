import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TransactionProvider } from "@/context/transaction-context";
import { CategoryProvider } from "@/context/category-context";
import { AccountProvider } from "@/context/account-context";
import { InvoiceProvider } from "@/context/invoice-context";
import { ThemeProvider } from "@/components/theme-provider";
import { InvestmentsProvider } from "@/contexts/InvestmentsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance",
  description: "Controle suas finanças pessoais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AccountProvider>
            <CategoryProvider>
              <TransactionProvider>
                <InvoiceProvider>
                  <InvestmentsProvider>
                    {children}
                    <Toaster />
                  </InvestmentsProvider>
                </InvoiceProvider>
              </TransactionProvider>
            </CategoryProvider>
          </AccountProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
