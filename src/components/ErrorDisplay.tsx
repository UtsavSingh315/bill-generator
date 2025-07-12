"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ErrorDisplayProps {
  error: string;
  validationErrors: string[];
}

export default function ErrorDisplay({
  error,
  validationErrors,
}: ErrorDisplayProps) {
  const { toast } = useToast();

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);

  // Show validation errors toast when validation errors change
  useEffect(() => {
    if (validationErrors.length > 0) {
      // Show each validation error as a separate toast for better readability
      validationErrors.forEach((error, index) => {
        setTimeout(() => {
          toast({
            variant: "warning",
            title: "Configuration Issues",
            description: error,
          });
        }, index * 100); // Slight delay between toasts
      });
    }
  }, [validationErrors, toast]);

  // Return null since we're using toasts instead of static display
  return null;
}
