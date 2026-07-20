import { useCallback, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/primitives/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/ui/primitives/tabs";

import { ConfirmDialog } from "../feedback/confirm-dialog";
import { useReset } from "../reset/use-reset";
import type { Preferences } from "./preferences";
import { SettingsTabs } from "./settings-tabs";

interface SettingsDialogProps {
  currentVersion: string | null;
  onChange: (key: keyof Preferences, value: boolean) => void;
  onCheckForUpdates: () => void;
  onClose: () => void;
  onPatch: (patch: Partial<Preferences>) => void;
  open: boolean;
  preferences: Preferences;
  updateBusy: boolean;
}

export function SettingsDialog({
  open,
  preferences,
  currentVersion,
  updateBusy,
  onChange,
  onPatch,
  onCheckForUpdates,
  onClose,
}: SettingsDialogProps) {
  const [tab, setTab] = useState("sign-in");
  const [resetOpen, setResetOpen] = useState(false);
  const { reset } = useReset();

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        onClose();
      }
    },
    [onClose]
  );

  const requestReset = useCallback(() => {
    setResetOpen(true);
  }, []);

  const closeReset = useCallback(() => {
    setResetOpen(false);
  }, []);

  return (
    <>
      <Dialog onOpenChange={handleOpenChange} open={open}>
        <DialogContent className="gap-4 p-5 sm:max-w-md">
          <DialogHeader className="pr-8">
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <Tabs className="gap-4" onValueChange={setTab} value={tab}>
            <TabsList
              className="h-auto w-full justify-stretch gap-0 border-border border-b pb-0"
              variant="line"
            >
              <TabsTrigger
                className="flex-1 rounded-none px-2 text-xs"
                value="sign-in"
              >
                Sign-in
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 rounded-none px-2 text-xs"
                value="privacy"
              >
                Privacy
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 rounded-none px-2 text-xs"
                value="app"
              >
                App
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 rounded-none px-2 text-xs"
                value="updates"
              >
                Updates
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 rounded-none px-2 text-destructive text-xs after:bg-destructive hover:text-destructive data-active:text-destructive dark:text-destructive dark:data-active:text-destructive dark:hover:text-destructive"
                value="danger"
              >
                Danger
              </TabsTrigger>
            </TabsList>

            <SettingsTabs
              currentVersion={currentVersion}
              onChange={onChange}
              onCheckForUpdates={onCheckForUpdates}
              onPatch={onPatch}
              onRequestReset={requestReset}
              preferences={preferences}
              updateBusy={updateBusy}
            />
          </Tabs>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        confirmLabel="Reset"
        danger
        message="This clears every saved Steam login on this PC. Continue?"
        onClose={closeReset}
        onConfirm={reset}
        open={resetOpen}
        title="Reset login data"
      />
    </>
  );
}
