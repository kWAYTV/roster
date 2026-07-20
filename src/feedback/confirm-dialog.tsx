import { useCallback } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/primitives/alert-dialog";

interface ConfirmDialogProps {
  closeOnConfirm?: boolean;
  confirmDisabled?: boolean;
  confirmLabel: string;
  danger?: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger,
  confirmDisabled,
  closeOnConfirm = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        onClose();
      }
    },
    [onClose]
  );

  const handleConfirm = useCallback(() => {
    onConfirm();
    if (closeOnConfirm) {
      onClose();
    }
  }, [onConfirm, closeOnConfirm, onClose]);

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogTitle className={danger ? "text-destructive" : undefined}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={confirmDisabled}
            onClick={handleConfirm}
            size="sm"
            variant={danger ? "destructive" : "default"}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
