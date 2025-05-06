"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ImportCreditPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main import page, which now handles both types
    router.push("/transactions/import");
  }, [router]);
  
  return null;
} 