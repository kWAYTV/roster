import { useState } from "react";

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
  open: boolean;
  preferences: Preferences;
  currentVersion: string | null;
  updateBusy: boolean;
  onChange: (key: keyof Preferences, value: boolean) => void;
  onPatch: (patch: Partial<Preferences>) => void;
  onCheckForUpdates: () => void;
  onClose: () => void;
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

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="gap-4 p-5 sm:max-w-md">
          <DialogHeader className="pr-8">
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <Tabs value={tab} onValueChange={setTab} className="gap-4">
            <TabsList
              variant="line"
              className="h-auto w-full justify-stretch gap-0 border-b border-border pb-0"
            >
              <TabsTrigger value="sign-in" className="flex-1 rounded-none px-2 text-xs">
                Sign-in
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex-1 rounded-none px-2 text-xs">
                Privacy
              </TabsTrigger>
              <TabsTrigger value="app" className="flex-1 rounded-none px-2 text-xs">
                App
              </TabsTrigger>
              <TabsTrigger value="updates" className="flex-1 rounded-none px-2 text-xs">
                Updates
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="flex-1 rounded-none px-2 text-xs text-destructive hover:text-destructive data-active:text-destructive after:bg-destructive dark:text-destructive dark:hover:text-destructive dark:data-active:text-destructive"
              >
                Danger
              </TabsTrigger>
            </TabsList>

            <SettingsTabs
              preferences={preferences}
              currentVersion={currentVersion}
              updateBusy={updateBusy}
              onChange={onChange}
              onPatch={onPatch}
              onCheckForUpdates={onCheckForUpdates}
              onRequestReset={() => setResetOpen(true)}
            />
          </Tabs>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={resetOpen}
        title="Reset login data"
        message="This clears every saved Steam login on this PC. Continue?"
        confirmLabel="Reset"
        danger
        onConfirm={reset}
        onClose={() => setResetOpen(false)}
      />
    </>
  );
}
