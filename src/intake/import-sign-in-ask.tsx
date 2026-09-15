import { useCallback, useRef } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/primitives/alert-dialog";
import { Button } from "@/ui/primitives/button";
import { cn } from "@/ui/primitives/cn";

import styles from "./import-sign-in-ask.module.css";

interface ImportSignInAskProps {
  onCancel: () => void;
  onSignIn: () => void;
  onStoreOnly: () => void;
  open: boolean;
}

/// Prompt when the import-without-sign-in preference is set to Ask.
export function ImportSignInAsk({
  open,
  onSignIn,
  onStoreOnly,
  onCancel,
}: ImportSignInAskProps) {
  const decidedRef = useRef(false);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!(next || decidedRef.current)) {
        onCancel();
      }
      if (!next) {
        decidedRef.current = false;
      }
    },
    [onCancel]
  );

  const handleSignIn = useCallback(() => {
    decidedRef.current = true;
    onSignIn();
  }, [onSignIn]);

  const handleStoreOnly = useCallback(() => {
    decidedRef.current = true;
    onStoreOnly();
  }, [onStoreOnly]);

  const handleCancel = useCallback(() => {
    decidedRef.current = true;
    onCancel();
  }, [onCancel]);

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign in after import?</AlertDialogTitle>
          <AlertDialogDescription>
            Steam can switch to the last imported account, or stay on this
            session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className={styles.choices}>
          <Button
            autoFocus
            className={cn(styles.choice, "h-auto w-full whitespace-normal")}
            onClick={handleSignIn}
            type="button"
          >
            <span className={styles.choiceLabel}>Sign in</span>
            <span className={styles.choiceHint}>
              Switch Steam to the last imported account
            </span>
          </Button>
          <Button
            className={cn(styles.choice, "h-auto w-full whitespace-normal")}
            onClick={handleStoreOnly}
            type="button"
            variant="outline"
          >
            <span className={styles.choiceLabel}>Store only</span>
            <span className={styles.choiceHint}>Keep the current session</span>
          </Button>
          <Button
            className="self-start"
            onClick={handleCancel}
            size="sm"
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
