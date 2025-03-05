"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, Wallet, Settings, LogOut, Menu, X, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Painel", href: "/", icon: Home },
  { name: "Transações", href: "/transactions", icon: Wallet },
  { name: "Categorias", href: "/categories", icon: Tag },
  { name: "Relatórios", href: "/reports", icon: PieChart },
  { name: "Configurações", href: "/settings", icon: Settings },
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
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Header móvel */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">App de Finanças</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar para desktop */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">App de Finanças</h1>
        </div>
        <nav className="mt-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 w-full">
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Sair
          </button>
        </div>
      </aside>

      {/* Menu móvel */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">App de Finanças</h1>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-3 text-base font-medium rounded-md ${
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button className="flex items-center px-3 py-3 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 w-full">
                <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
    </div>
  );
} 