import { CooldownDialog } from "@/cooldown/cooldown-dialog";
import { ExportConfirm } from "@/export/export-confirm";
import type { PendingExport } from "@/export/pending-export";
import { ConfirmDialog } from "@/feedback/confirm-dialog";
import { ImportDialog } from "@/intake/import-dialog";
import type { OverridePatch } from "@/platform/invoke";
import type { Preferences } from "@/preferences/preferences";
import { SettingsDialog } from "@/preferences/settings-dialog";
import type { AccountView } from "@/roster/account";
import { NoteDialog } from "@/roster/note-dialog";
import { OverridesDialog } from "@/roster/overrides-dialog";
import { TagsDialog } from "@/roster/tags-dialog";
import { cooldownMessage, removeMessage } from "@/shell/confirm-messages";

interface ShellDialogsProps {
  bulkCooldownIds: string[];
  cooldownTarget: AccountView | null;
  currentVersion: string | null;
  importOpen: boolean;
  importPrefill: string;
  importSession: number;
  noteTarget: AccountView | null;
  onCancelExport: () => void;
  onChangePreference: (key: keyof Preferences, value: boolean) => void;
  onCheckForUpdates: () => void;
  onCloseBulkCooldown: () => void;
  onCloseCooldown: () => void;
  onCloseImport: () => void;
  onCloseNote: () => void;
  onCloseOverrides: () => void;
  onCloseRemove: () => void;
  onCloseSettings: () => void;
  onCloseTags: () => void;
  onConfirmCooldownSignIn: () => void;
  onConfirmExport: () => void;
  onConfirmRemove: () => void;
  onExportMetadata: () => void;
  onImportMetadata: () => void;
  onPatchPreferences: (patch: Partial<Preferences>) => void;
  onSaveNote: (note: string) => void;
  onSaveOverrides: (steamid: string, patch: OverridePatch) => void;
  onSaveTags: (tags: string[]) => void;
  onStartBulkCooldown: (seconds: number) => void;
  overridesTarget: AccountView | null;
  pendingExport: PendingExport;
  preferences: Preferences;
  removeTargets: AccountView[];
  settingsOpen: boolean;
  tagsTarget: AccountView | null;
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
  noteTarget,
  tagsTarget,
  overridesTarget,
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
  onCloseNote,
  onSaveNote,
  onCloseTags,
  onSaveTags,
  onCloseOverrides,
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

      {noteTarget ? (
        <NoteDialog
          initial={noteTarget.note}
          key={`note-${noteTarget.steamid}`}
          name={noteTarget.display_name}
          onClose={onCloseNote}
          onSave={onSaveNote}
          open
        />
      ) : null}
      {tagsTarget ? (
        <TagsDialog
          initial={tagsTarget.tags}
          key={`tags-${tagsTarget.steamid}`}
          name={tagsTarget.display_name}
          onClose={onCloseTags}
          onSave={onSaveTags}
          open
        />
      ) : null}
      {overridesTarget ? (
        <OverridesDialog
          account={overridesTarget}
          key={overridesTarget.steamid}
          onClose={onCloseOverrides}
          onSave={onSaveOverrides}
          open
        />
      ) : null}
    </>
  );
}
