import { useToast as useToastShadcn } from "@/components/ui/toast";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const { toast } = useToastShadcn();

  return {
    toast: (props: ToastProps) => {
      toast({
        ...props,
        duration: 3000,
      });
    },
  };
} 