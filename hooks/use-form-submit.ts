import { useState } from 'react';
import { toast } from 'sonner';

export function useFormSubmit() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitForm = async (
    submitFn: () => Promise<void>,
    successMessage: string,
    onSuccess?: () => void
  ) => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      await submitFn();
      setIsSuccess(true);
      toast.success(successMessage);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setIsSuccess(false);
  };

  return {
    isLoading,
    isSuccess,
    submitForm,
    reset,
  };
}