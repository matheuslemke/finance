"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UseFormSetValue } from "react-hook-form";
import { Transaction } from "@/types";
import { useState, useEffect } from "react";

interface DateSelectorProps {
  date: Date;
  setDate: (date: Date) => void;
  setValue: UseFormSetValue<Omit<Transaction, "id">>;
  isSubmitting: boolean;
}

export function DateSelector({ date, setDate, setValue, isSubmitting }: DateSelectorProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDateSafe = (date: Date) => {
    if (!isClient) {
      return date.toLocaleDateString('pt-BR');
    }
    return format(date, "PPP", { locale: ptBR });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="date">Data</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={isSubmitting}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? formatDateSafe(date) : <span>Escolha uma data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              if (date) {
                setDate(date);
                setValue("date", date);
              }
            }}
            initialFocus
            disabled={isSubmitting}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
} 