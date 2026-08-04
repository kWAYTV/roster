import { useCallback, useRef } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/primitives/alert-dialog";
import { Button } from "@/ui/primitives/button";

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

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign in after import?</AlertDialogTitle>
          <AlertDialogDescription>
            Sign into the last imported account, or store tokens without
            switching.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-end">
          <Button
            onClick={handleStoreOnly}
            size="sm"
            type="button"
            variant="outline"
          >
            Store only
          </Button>
          <Button autoFocus onClick={handleSignIn} size="sm" type="button">
            Sign in
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
