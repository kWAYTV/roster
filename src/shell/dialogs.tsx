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
  import("../intake/import-dialog").then((module) => ({
    default: module.ImportDialog,
  }))
);
const SettingsDialog = lazy(() =>
  import("../preferences/settings-dialog").then((module) => ({
    default: module.SettingsDialog,
  }))
);

interface ShellDialogsProps {
  available: AvailableUpdate | null;
  bulkCooldownIds: string[];
  cooldownTarget: AccountView | null;
  currentVersion: string | null;
  importOpen: boolean;
  importPrefill: string;
  onChangePreference: (key: keyof Preferences, value: boolean) => void;
  onCheckForUpdates: () => void;
  onCloseBulkCooldown: () => void;
  onCloseCooldown: () => void;
  onCloseImport: () => void;
  onCloseRemove: () => void;
  onCloseSettings: () => void;
  onConfirmCooldownSignIn: () => void;
  onConfirmRemove: () => void;
  onDismissUpdate: () => void;
  onInstallUpdate: () => void;
  onPatchPreferences: (patch: Partial<Preferences>) => void;
  onStartBulkCooldown: (seconds: number) => void;
  preferences: Preferences;
  removeTargets: AccountView[];
  settingsOpen: boolean;
  updateBusy: boolean;
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
            onClose={onCloseImport}
            open={importOpen}
            prefill={importPrefill}
          />
        ) : null}
        {settingsOpen ? (
          <SettingsDialog
            currentVersion={currentVersion}
            onChange={onChangePreference}
            onCheckForUpdates={onCheckForUpdates}
            onClose={onCloseSettings}
            onPatch={onPatchPreferences}
            open={settingsOpen}
            preferences={preferences}
            updateBusy={updateBusy}
          />
        ) : null}
      </Suspense>
      <CooldownDialog
        onClose={onCloseBulkCooldown}
        onStart={onStartBulkCooldown}
        open={bulkCooldownIds.length > 0}
      />
      <ConfirmDialog
        closeOnConfirm={false}
        confirmDisabled={updateBusy}
        confirmLabel={updateBusy ? "Installing…" : "Install and restart"}
        message={
          available
            ? `Roster ${available.version} is ready. Install now and restart?`
            : ""
        }
        onClose={onDismissUpdate}
        onConfirm={onInstallUpdate}
        open={available !== null}
        title="Update available"
      />
      <ConfirmDialog
        confirmLabel="Remove"
        danger
        message={removeMessage(removeTargets, preferences.streamer_mode)}
        onClose={onCloseRemove}
        onConfirm={onConfirmRemove}
        open={removeTargets.length > 0}
        title={removeTargets.length > 1 ? "Remove accounts" : "Remove account"}
      />
      <ConfirmDialog
        confirmLabel="Sign in anyway"
        danger
        message={cooldownMessage(cooldownTarget, preferences.streamer_mode)}
        onClose={onCloseCooldown}
        onConfirm={onConfirmCooldownSignIn}
        open={cooldownTarget !== null}
        title="Account on cooldown"
      />
    </>
  );
}
