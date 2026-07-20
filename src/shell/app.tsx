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
      const account = accounts.find((candidate) => candidate.steamid === steamid);
      if (account && isCooldownActive(account.cooldown_until)) {
        askCooldownSignIn(account);
        return;
      }
      signIn(steamid);
    },
    [accounts, askCooldownSignIn, signIn],
  );

  const openProfile = useCallback(
    async (steamid: string) => {
      try {
        await commands.openSteamProfile(steamid);
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify],
  );

  useShellEvents({ notify, openImport, error });
  useShellShortcuts({
    searchOpen: ui.searchOpen,
    selectedIds,
    closeSearch,
    clearSelection,
    openSearch,
    requestSignIn,
  });

  useEffect(() => {
    if (ui.searchOpen) {
      searchRef.current?.focus();
    }
  }, [ui.searchOpen]);

  const filtered = useMemo(
    () => filterAccounts(accounts, ui.query),
    [accounts, ui.query],
  );
  const countLabel =
    filtered.length === accounts.length
      ? `${accounts.length}`
      : `${filtered.length}/${accounts.length}`;

  return (
    <div className={styles.app}>
      <Toolbar
        searchOpen={ui.searchOpen}
        query={ui.query}
        countLabel={countLabel}
        accountCount={accounts.length}
        searchRef={searchRef}
        onQueryChange={setQuery}
        onOpenSearch={openSearch}
        onCloseSearch={closeSearch}
        onOpenImport={() => openImport()}
        onOpenSettings={openSettings}
      />

      <main className={styles.main}>
        <RosterList
          accounts={filtered}
          loading={loading}
          streamer={preferences.streamer_mode}
          pending={pending}
          statuses={statuses}
          selectedIds={selectedIds}
          onSelect={selectAccount}
          onClearSelection={clearSelection}
          onSignIn={requestSignIn}
          onRemove={askRemove}
          onCopyUsername={copyUsername}
          onOpenProfile={openProfile}
          onCopyExport={copyExport}
          onExportFile={exportFile}
          onCooldown={(steamids, seconds) => startMany(steamids, seconds)}
          onClearCooldown={(steamids) => clearMany(steamids)}
          onCustomCooldown={askBulkCooldown}
          exportCountFor={(steamids) => exportCountFor(accounts, steamids)}
        />
      </main>

      <LogPanel visible={preferences.show_log_panel} />
      <Footer currentVersion={currentVersion} />

      <ShellDialogs
        importOpen={ui.importOpen}
        importPrefill={ui.importPrefill}
        settingsOpen={ui.settingsOpen}
        preferences={preferences}
        currentVersion={currentVersion}
        updateBusy={busy}
        available={available}
        removeTargets={ui.removeTargets}
        cooldownTarget={ui.cooldownTarget}
        bulkCooldownIds={ui.bulkCooldownIds}
        onCloseImport={closeImport}
        onCloseSettings={closeSettings}
        onChangePreference={setPreference}
        onPatchPreferences={patchPreferences}
        onCheckForUpdates={() => void checkForUpdate(true)}
        onInstallUpdate={() => void install()}
        onDismissUpdate={dismiss}
        onConfirmRemove={() => {
          const ids = ui.removeTargets.map((account) => account.steamid);
          if (ids.length === 1) {
            remove(ids[0]);
          } else {
            removeMany(ids);
          }
          clearSelection();
        }}
        onCloseRemove={closeRemove}
        onConfirmCooldownSignIn={() => {
          if (ui.cooldownTarget) {
            signIn(ui.cooldownTarget.steamid);
          }
        }}
        onCloseCooldown={closeCooldown}
        onStartBulkCooldown={(seconds) => {
          startMany(ui.bulkCooldownIds, seconds);
          closeBulkCooldown();
        }}
        onCloseBulkCooldown={closeBulkCooldown}
      />
    </div>
  );
}
