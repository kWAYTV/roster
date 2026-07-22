import { CooldownDialog } from "../cooldown/cooldown-dialog";
import { ConfirmDialog } from "../feedback/confirm-dialog";
import { ImportDialog } from "../intake/import-dialog";
import type { Preferences } from "../preferences/preferences";
import { SettingsDialog } from "../preferences/settings-dialog";
import type { AccountView } from "../roster/account";
import { cooldownMessage, removeMessage } from "./confirm-messages";

interface AvailableUpdate {
  version: string;
}

interface ShellDialogsProps {
  available: AvailableUpdate | null;
  bulkCooldownIds: string[];
  cooldownTarget: AccountView | null;
  currentVersion: string | null;
  importOpen: boolean;
  importPrefill: string;
  importSession: number;
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
  onExportMetadata: () => void;
  onImportMetadata: () => void;
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
  importSession,
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
  onExportMetadata,
  onImportMetadata,
}: ShellDialogsProps) {
  return (
    <>
      {/*
        Eager + kept mounted while closing. Lazy Suspense(null) blanked the
        window; unmounting while open left a stuck Base UI backdrop.
      */}
      <ImportDialog
        key={importSession || "import"}
        onClose={onCloseImport}
        open={importOpen}
        prefill={importPrefill}
      />
      <SettingsDialog
        currentVersion={currentVersion}
        onChange={onChangePreference}
        onCheckForUpdates={onCheckForUpdates}
        onClose={onCloseSettings}
        onExportMetadata={onExportMetadata}
        onImportMetadata={onImportMetadata}
        onPatch={onPatchPreferences}
        open={settingsOpen}
        preferences={preferences}
        updateBusy={updateBusy}
      />
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
