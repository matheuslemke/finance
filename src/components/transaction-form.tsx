"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Transaction, TransactionType, TransactionClass, DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS, DEFAULT_WEDDING_CATEGORIES } from "@/types";

interface TransactionFormProps {
  onSubmit: (data: Omit<Transaction, "id">) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function TransactionForm({ onSubmit, onCancel, isSubmitting = false }: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>("expense");
  const [includeWedding, setIncludeWedding] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<Omit<Transaction, "id">>({
    defaultValues: {
      type: "expense",
      date: new Date(),
      description: "",
      category: "",
      amount: 0,
      account: "",
      class: "essential" as TransactionClass,
    }
  });

  register("type", { required: true });
  register("date", { required: true });
  register("category", { required: true });
  register("account", { required: true });
  register("class", { required: true });
  register("weddingCategory", { required: includeWedding });

  const submitForm = (data: Partial<Omit<Transaction, "id">>) => {
    if (!data.description || !data.category || !data.account || !data.class || !data.amount || data.amount <= 0) {
      return;
    }

    if (includeWedding && !data.weddingCategory) {
      return;
    }

    const formattedData = {
      type: transactionType,
      date: date,
      description: data.description || "",
      category: data.category || "",
      amount: parseFloat(data.amount?.toString() || "0"),
      account: data.account || "",
      class: data.class as TransactionClass,
      weddingCategory: includeWedding ? data.weddingCategory : undefined,
    } as Omit<Transaction, "id">;
    
    onSubmit(formattedData);
    reset();
    setTransactionType("expense");
    setIncludeWedding(false);
    setDate(new Date());
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-base">Tipo de Transação</Label>
          <RadioGroup 
            defaultValue="expense" 
            className="grid grid-cols-2 gap-4 mt-2"
            onValueChange={(value) => {
              setTransactionType(value as TransactionType);
              setValue("type", value as TransactionType);
            }}
            value={transactionType}
            disabled={isSubmitting}
          >
            <div>
              <RadioGroupItem value="expense" id="expense" className="peer sr-only" />
              <Label
                htmlFor="expense"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                Despesa
              </Label>
            </div>
            <div>
              <RadioGroupItem value="income" id="income" className="peer sr-only" />
              <Label
                htmlFor="income"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                Receita
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
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
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register("amount", { required: true, min: 0.01 })}
              disabled={isSubmitting}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">O valor é obrigatório e deve ser maior que 0</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            placeholder="Digite a descrição"
            {...register("description", { required: true })}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-sm text-red-500">A descrição é obrigatória</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select 
              onValueChange={(value) => setValue("category", value)} 
              defaultValue=""
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_CATEGORIES[transactionType].map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">A categoria é obrigatória</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Conta</Label>
            <Select 
              onValueChange={(value) => setValue("account", value)} 
              defaultValue=""
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_ACCOUNTS.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.account && (
              <p className="text-sm text-red-500">A conta é obrigatória</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="class">Classe</Label>
          <Select 
            onValueChange={(value) => setValue("class", value as TransactionClass)} 
            defaultValue="essential"
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a classe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="essential">Essencial</SelectItem>
              <SelectItem value="non-essential">Não Essencial</SelectItem>
              <SelectItem value="investment">Investimento</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="business">Negócio</SelectItem>
            </SelectContent>
          </Select>
          {errors.class && (
            <p className="text-sm text-red-500">A classe é obrigatória</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            id="wedding" 
            checked={includeWedding}
            onCheckedChange={setIncludeWedding}
            disabled={isSubmitting}
          />
          <Label htmlFor="wedding">Incluir categoria de casamento</Label>
        </div>

        {includeWedding && (
          <div className="space-y-2">
            <Label htmlFor="weddingCategory">Categoria de Casamento</Label>
            <Select 
              onValueChange={(value) => setValue("weddingCategory", value)} 
              defaultValue=""
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria de casamento" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_WEDDING_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.weddingCategory && (
              <p className="text-sm text-red-500">A categoria de casamento é obrigatória</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Transação"
          )}
        </Button>
      </div>
    </form>
  );
} 