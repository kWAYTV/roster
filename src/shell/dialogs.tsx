import { lazy, Suspense } from "react";

import { CooldownDialog } from "../cooldown/cooldown-dialog";
import { ConfirmDialog } from "../feedback/confirm-dialog";
import type { Preferences } from "../preferences/preferences";
import type { AccountView } from "../roster/account";
import { cooldownMessage, removeMessage } from "./confirm-messages";

interface AvailableUpdate {
  version: string;
}

const ImportDialog = lazy(() =>
  import("../intake/import-dialog").then((module) => ({ default: module.ImportDialog })),
);
const SettingsDialog = lazy(() =>
  import("../preferences/settings-dialog").then((module) => ({
    default: module.SettingsDialog,
  })),
);

interface ShellDialogsProps {
  importOpen: boolean;
  importPrefill: string;
  settingsOpen: boolean;
  preferences: Preferences;
  currentVersion: string | null;
  updateBusy: boolean;
  available: AvailableUpdate | null;
  removeTargets: AccountView[];
  cooldownTarget: AccountView | null;
  bulkCooldownIds: string[];
  onCloseImport: () => void;
  onCloseSettings: () => void;
  onChangePreference: (key: keyof Preferences, value: boolean) => void;
  onPatchPreferences: (patch: Partial<Preferences>) => void;
  onCheckForUpdates: () => void;
  onInstallUpdate: () => void;
  onDismissUpdate: () => void;
  onConfirmRemove: () => void;
  onCloseRemove: () => void;
  onConfirmCooldownSignIn: () => void;
  onCloseCooldown: () => void;
  onStartBulkCooldown: (seconds: number) => void;
  onCloseBulkCooldown: () => void;
}

export function ShellDialogs({
  importOpen,
  importPrefill,
  settingsOpen,
  preferences,
  currentVersion,
  updateBusy,
  available,
  removeTargets,
  cooldownTarget,
  bulkCooldownIds,
  onCloseImport,
  onCloseSettings,
  onChangePreference,
  onPatchPreferences,
  onCheckForUpdates,
  onInstallUpdate,
  onDismissUpdate,
  onConfirmRemove,
  onCloseRemove,
  onConfirmCooldownSignIn,
  onCloseCooldown,
  onStartBulkCooldown,
  onCloseBulkCooldown,
}: ShellDialogsProps) {
  return (
    <>
      <Suspense fallback={null}>
        {importOpen ? (
          <ImportDialog
            open={importOpen}
            prefill={importPrefill}
            onClose={onCloseImport}
          />
        ) : null}
        {settingsOpen ? (
          <SettingsDialog
            open={settingsOpen}
            preferences={preferences}
            currentVersion={currentVersion}
            updateBusy={updateBusy}
            onChange={onChangePreference}
            onPatch={onPatchPreferences}
            onCheckForUpdates={onCheckForUpdates}
            onClose={onCloseSettings}
          />
        ) : null}
      </Suspense>
      <CooldownDialog
        open={bulkCooldownIds.length > 0}
        onClose={onCloseBulkCooldown}
        onStart={onStartBulkCooldown}
      />
      <ConfirmDialog
        open={available !== null}
        title="Update available"
        message={
          available
            ? `Roster ${available.version} is ready. Install now and restart?`
            : ""
        }
        confirmLabel={updateBusy ? "Installing…" : "Install and restart"}
        confirmDisabled={updateBusy}
        closeOnConfirm={false}
        onConfirm={onInstallUpdate}
        onClose={onDismissUpdate}
      />
      <ConfirmDialog
        open={removeTargets.length > 0}
        title={removeTargets.length > 1 ? "Remove accounts" : "Remove account"}
        message={removeMessage(removeTargets, preferences.streamer_mode)}
        confirmLabel="Remove"
        danger
        onConfirm={onConfirmRemove}
        onClose={onCloseRemove}
      />
      <ConfirmDialog
        open={cooldownTarget !== null}
        title="Account on cooldown"
        message={cooldownMessage(cooldownTarget, preferences.streamer_mode)}
        confirmLabel="Sign in anyway"
        danger
        onConfirm={onConfirmCooldownSignIn}
        onClose={onCloseCooldown}
      />
    </>
  );
}
