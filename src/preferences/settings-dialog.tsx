import { useCallback, useState } from "react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/primitives/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/ui/primitives/tabs";

import { ConfirmDialog } from "../feedback/confirm-dialog";
import { useReset } from "../reset/use-reset";
import type { Preferences } from "./preferences";
import { SettingsApp } from "./settings-app";
import { SettingsDanger } from "./settings-danger";
import { SettingsPrivacy } from "./settings-privacy";
import { SettingsSignIn } from "./settings-sign-in";
import { SettingsUpdates } from "./settings-updates";

interface SettingsDialogProps {
  currentVersion: string | null;
  onChange: (key: keyof Preferences, value: boolean) => void;
  onCheckForUpdates: () => void;
  onClose: () => void;
  onExportMetadata: () => void;
  onImportMetadata: () => void;
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
  onExportMetadata,
  onImportMetadata,
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <DialogBody>
            <Tabs className="gap-4" onValueChange={setTab} value={tab}>
              <TabsList
                className="h-auto w-full justify-stretch gap-0 border-border border-b bg-transparent pb-0"
                variant="line"
              >
                <TabsTrigger
                  className="flex-1 rounded-none px-1.5 text-xs"
                  value="sign-in"
                >
                  Sign-in
                </TabsTrigger>
                <TabsTrigger
                  className="flex-1 rounded-none px-1.5 text-xs"
                  value="privacy"
                >
                  Privacy
                </TabsTrigger>
                <TabsTrigger
                  className="flex-1 rounded-none px-1.5 text-xs"
                  value="app"
                >
                  App
                </TabsTrigger>
                <TabsTrigger
                  className="flex-1 rounded-none px-1.5 text-xs"
                  value="updates"
                >
                  Updates
                </TabsTrigger>
                <TabsTrigger
                  className="flex-1 rounded-none px-1.5 text-destructive text-xs after:bg-destructive hover:text-destructive data-active:text-destructive dark:text-destructive dark:data-active:text-destructive dark:hover:text-destructive"
                  value="danger"
                >
                  Danger
                </TabsTrigger>
              </TabsList>

              <SettingsSignIn
                onChange={onChange}
                onPatch={onPatch}
                preferences={preferences}
              />
              <SettingsPrivacy onChange={onChange} preferences={preferences} />
              <SettingsApp
                onChange={onChange}
                onExportMetadata={onExportMetadata}
                onImportMetadata={onImportMetadata}
                onPatch={onPatch}
                preferences={preferences}
              />
              <SettingsUpdates
                currentVersion={currentVersion}
                onCheckForUpdates={onCheckForUpdates}
                updateBusy={updateBusy}
              />
              <SettingsDanger onRequestReset={requestReset} />
            </Tabs>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        confirmLabel="Reset"
        danger
        message="This clears every saved Steam login on this PC, plus Roster pins, notes, cooldowns, and tags. Continue?"
        onClose={closeReset}
        onConfirm={reset}
        open={resetOpen}
        title="Reset login data"
      />
    </>
  );
}
