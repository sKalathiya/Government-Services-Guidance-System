import { useEffect } from "react";

type ToastDismissProps = {
  id: string;
  onDismiss: (id: string) => void;
};

export const ToastDismiss = ({ id, onDismiss }: ToastDismissProps) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onDismiss(id);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [id, onDismiss]);
  return null;
};
