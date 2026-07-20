import { useCallback, useEffect, useMemo, useRef } from "react";

import { isCooldownActive } from "../cooldown/cooldown";
import { useCooldown } from "../cooldown/use-cooldown";
import { useExport } from "../export/use-export";
import { LogPanel } from "../feedback/log-panel";
import { useToast } from "../feedback/toast";
import { useForget } from "../forget/use-forget";
import { useSignIn } from "../login/use-login";
import { commands } from "../platform/invoke";
import { usePreferences } from "../preferences/use-preferences";
import { RosterList } from "../roster/roster-list";
import { useRoster } from "../roster/use-roster";
import { useStatus } from "../status/use-status";
import { useUpdater } from "../updater/use-updater";
import { ShellDialogs } from "./dialogs";
import { filterAccounts } from "./filter-accounts";
import { Footer } from "./footer";
import styles from "./shell.module.css";
import { Toolbar } from "./toolbar";
import { useSelection } from "./use-selection";
import { useShellEvents } from "./use-shell-events";
import { useShellShortcuts } from "./use-shell-shortcuts";
import { useShellUi } from "./use-shell-ui";

export function App() {
  const { accounts, loading, error, patchProfile } = useRoster();
  const statuses = useStatus(!loading, patchProfile);
  const { preferences, setPreference, patchPreferences } = usePreferences();
  const { signIn, pending } = useSignIn();
  const { remove, removeMany } = useForget();
  const { startMany, clearMany } = useCooldown();
  const { notify } = useToast();
  const { exportCountFor, copyExport, exportFile, copyUsername } = useExport();
  const { available, busy, currentVersion, checkForUpdate, install, dismiss } =
    useUpdater(notify);
  const { selectedIds, selectAccount, clearSelection } = useSelection();
  const {
    ui,
    openSearch,
    closeSearch,
    setQuery,
    openImport,
    closeImport,
    openSettings,
    closeSettings,
    askRemove,
    closeRemove,
    askCooldownSignIn,
    closeCooldown,
    askBulkCooldown,
    closeBulkCooldown,
  } = useShellUi();
  const searchRef = useRef<HTMLInputElement>(null);

  const requestSignIn = useCallback(
    (steamid: string) => {
      const account = accounts.find(
        (candidate) => candidate.steamid === steamid
      );
      if (account && isCooldownActive(account.cooldown_until)) {
        askCooldownSignIn(account);
        return;
      }
      signIn(steamid);
    },
    [accounts, askCooldownSignIn, signIn]
  );

  const openProfile = useCallback(
    async (steamid: string) => {
      try {
        await commands.openSteamProfile(steamid);
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify]
  );

  useShellEvents({ error, notify, openImport });
  useShellShortcuts({
    clearSelection,
    closeSearch,
    openSearch,
    requestSignIn,
    searchOpen: ui.searchOpen,
    selectedIds,
  });

  useEffect(() => {
    if (ui.searchOpen) {
      searchRef.current?.focus();
    }
  }, [ui.searchOpen]);

  const filtered = useMemo(
    () => filterAccounts(accounts, ui.query),
    [accounts, ui.query]
  );
  const countLabel =
    filtered.length === accounts.length
      ? `${accounts.length}`
      : `${filtered.length}/${accounts.length}`;

  const exportCountForFiltered = useCallback(
    (steamids: string[]) => exportCountFor(accounts, steamids),
    [accounts, exportCountFor]
  );

  const handleCheckForUpdates = useCallback(() => {
    checkForUpdate(true).catch(() => undefined);
  }, [checkForUpdate]);

  const handleConfirmCooldownSignIn = useCallback(() => {
    if (ui.cooldownTarget) {
      signIn(ui.cooldownTarget.steamid);
    }
  }, [ui.cooldownTarget, signIn]);

  const handleConfirmRemove = useCallback(() => {
    const ids = ui.removeTargets.map((account) => account.steamid);
    if (ids.length === 1) {
      remove(ids[0]);
    } else {
      removeMany(ids);
    }
    clearSelection();
  }, [ui.removeTargets, remove, removeMany, clearSelection]);

  const handleInstallUpdate = useCallback(() => {
    install().catch(() => undefined);
  }, [install]);

  const handleStartBulkCooldown = useCallback(
    (seconds: number) => {
      startMany(ui.bulkCooldownIds, seconds);
      closeBulkCooldown();
    },
    [startMany, ui.bulkCooldownIds, closeBulkCooldown]
  );

  return (
    <div className={styles.app}>
      <Toolbar
        accountCount={accounts.length}
        countLabel={countLabel}
        onCloseSearch={closeSearch}
        onOpenImport={openImport}
        onOpenSearch={openSearch}
        onOpenSettings={openSettings}
        onQueryChange={setQuery}
        query={ui.query}
        searchOpen={ui.searchOpen}
        searchRef={searchRef}
      />

      <main className={styles.main}>
        <RosterList
          accounts={filtered}
          exportCountFor={exportCountForFiltered}
          loading={loading}
          onClearCooldown={clearMany}
          onClearSelection={clearSelection}
          onCooldown={startMany}
          onCopyExport={copyExport}
          onCopyUsername={copyUsername}
          onCustomCooldown={askBulkCooldown}
          onExportFile={exportFile}
          onOpenProfile={openProfile}
          onRemove={askRemove}
          onSelect={selectAccount}
          onSignIn={requestSignIn}
          pending={pending}
          selectedIds={selectedIds}
          statuses={statuses}
          streamer={preferences.streamer_mode}
        />
      </main>

      <LogPanel visible={preferences.show_log_panel} />
      <Footer currentVersion={currentVersion} />

      <ShellDialogs
        available={available}
        bulkCooldownIds={ui.bulkCooldownIds}
        cooldownTarget={ui.cooldownTarget}
        currentVersion={currentVersion}
        importOpen={ui.importOpen}
        importPrefill={ui.importPrefill}
        onChangePreference={setPreference}
        onCheckForUpdates={handleCheckForUpdates}
        onCloseBulkCooldown={closeBulkCooldown}
        onCloseCooldown={closeCooldown}
        onCloseImport={closeImport}
        onCloseRemove={closeRemove}
        onCloseSettings={closeSettings}
        onConfirmCooldownSignIn={handleConfirmCooldownSignIn}
        onConfirmRemove={handleConfirmRemove}
        onDismissUpdate={dismiss}
        onInstallUpdate={handleInstallUpdate}
        onPatchPreferences={patchPreferences}
        onStartBulkCooldown={handleStartBulkCooldown}
        preferences={preferences}
        removeTargets={ui.removeTargets}
        settingsOpen={ui.settingsOpen}
        updateBusy={busy}
      />
    </div>
  );
}
