"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, Wallet, Settings, LogOut, Menu, X, Tag, CreditCard, FileText, ArrowDownUp, BarChart3, ChevronDown, LineChart, DollarSign, Heart, PiggyBank } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/transactions", label: "Transações", icon: ArrowDownUp },
  { href: "/accounts", label: "Contas", icon: Wallet },
  { href: "/investments", label: "Investimentos", icon: LineChart },
  { href: "/investments/dividends", label: "Dividendos", icon: DollarSign },
  { href: "/investments/analytics", label: "Análise", icon: BarChart3 },
  { href: "/wedding", label: "Casamento", icon: Heart },
  { href: "/goals", label: "Objetivos", icon: PiggyBank },
  { href: "/categories", label: "Categorias", icon: PieChart },
  { href: "/reports", label: "Relatórios", icon: BarChart3 },
  { href: "/invoices", label: "Faturas", icon: CreditCard },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Fechar o menu móvel quando a rota mudar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Fechar o menu móvel quando a tela for redimensionada para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header móvel */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">App de Finanças</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Sidebar para desktop */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">App de Finanças</h1>
          <ThemeToggle />
        </div>
        <nav className="mt-6 px-3 space-y-1">
          {links.map((link) => {
            const LinkIcon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Button 
                key={link.href} 
                variant={isActive ? "secondary" : "ghost"} 
                className="justify-start" 
                asChild
              >
                <Link href={link.href}>
                  <LinkIcon className="mr-3 h-5 w-5" />
                  {link.label}
                </Link>
              </Button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 w-full dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
            <LogOut className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
            Sair
          </button>
        </div>
      </aside>

      {/* Menu móvel */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-gray-800">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">App de Finanças</h1>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {links.map((link) => {
                const LinkIcon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Button 
                    key={link.href} 
                    variant={isActive ? "secondary" : "ghost"} 
                    className="justify-start" 
                    asChild
                  >
                    <Link href={link.href}>
                      <LinkIcon className="mr-3 h-5 w-5" />
                      {link.label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button className="flex items-center px-3 py-3 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 w-full dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
                <LogOut className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto p-4 lg:p-8 dark:bg-gray-900 dark:text-gray-100">{children}</main>
    </div>
  );
} 