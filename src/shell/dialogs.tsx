import { CooldownDialog } from "@/cooldown/cooldown-dialog";
import { ExportConfirm } from "@/export/export-confirm";
import type { PendingExport } from "@/export/pending-export";
import { ConfirmDialog } from "@/feedback/confirm-dialog";
import { ImportDialog } from "@/intake/import-dialog";
import type { OverridePatch } from "@/platform/invoke";
import type { Preferences } from "@/preferences/preferences";
import { SettingsDialog } from "@/preferences/settings-dialog";
import type { AccountView } from "@/roster/account";
import { AccountSheet } from "@/roster/account-sheet";
import type { AccountSheetTab } from "@/roster/use-account-editors";
import { cooldownMessage, removeMessage } from "@/shell/confirm-messages";

interface ShellDialogsProps {
  bulkCooldownIds: string[];
  cooldownTarget: AccountView | null;
  currentVersion: string | null;
  detailAccount: AccountView | null;
  detailTab: AccountSheetTab;
  importOpen: boolean;
  importPrefill: string;
  importSession: number;
  onCancelExport: () => void;
  onChangePreference: (key: keyof Preferences, value: boolean) => void;
  onCheckForUpdates: () => void;
  onCloseBulkCooldown: () => void;
  onCloseCooldown: () => void;
  onCloseDetail: () => void;
  onCloseImport: () => void;
  onCloseRemove: () => void;
  onCloseSettings: () => void;
  onConfirmCooldownSignIn: () => void;
  onConfirmExport: () => void;
  onConfirmRemove: () => void;
  onDetailTabChange: (tab: AccountSheetTab) => void;
  onExportMetadata: () => void;
  onImportMetadata: () => void;
  onPatchPreferences: (patch: Partial<Preferences>) => void;
  onSaveNote: (note: string) => void;
  onSaveOverrides: (steamid: string, patch: OverridePatch) => void;
  onSaveTags: (tags: string[]) => void;
  onStartBulkCooldown: (seconds: number) => void;
  pendingExport: PendingExport;
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
  removeTargets,
  cooldownTarget,
  bulkCooldownIds,
  pendingExport,
  detailAccount,
  detailTab,
  onCloseImport,
  onCloseSettings,
  onChangePreference,
  onPatchPreferences,
  onCheckForUpdates,
  onConfirmRemove,
  onCloseRemove,
  onConfirmCooldownSignIn,
  onCloseCooldown,
  onStartBulkCooldown,
  onCloseBulkCooldown,
  onExportMetadata,
  onImportMetadata,
  onConfirmExport,
  onCancelExport,
  onCloseDetail,
  onDetailTabChange,
  onSaveNote,
  onSaveTags,
  onSaveOverrides,
}: ShellDialogsProps) {
  return (
    <>
      {/*
        Eager + kept mounted while closing. Lazy Suspense(null) blanked the
        window; unmounting while open left a stuck Base UI backdrop.
      */}
      <ImportDialog
        importWithoutSignIn={preferences.import_without_sign_in}
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
        key={bulkCooldownIds.join(",") || "cooldown"}
        onClose={onCloseBulkCooldown}
        onStart={onStartBulkCooldown}
        open={bulkCooldownIds.length > 0}
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
      <ExportConfirm
        onCancel={onCancelExport}
        onConfirm={onConfirmExport}
        pending={pendingExport}
      />
      <AccountSheet
        account={detailAccount}
        onClose={onCloseDetail}
        onSaveNote={onSaveNote}
        onSaveOverrides={onSaveOverrides}
        onSaveTags={onSaveTags}
        onTabChange={onDetailTabChange}
        open={detailAccount !== null}
        streamer={preferences.streamer_mode}
        tab={detailTab}
      />
    </>
  );
}
