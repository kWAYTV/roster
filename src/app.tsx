import { useEffect, useMemo, useState } from "react";

import { ConfirmDialog } from "./feedback/confirm-dialog";
import { useToast } from "./feedback/toast";
import { useForget } from "./forget/use-forget";
import { ImportDialog } from "./intake/import-dialog";
import { onStatus, onStatusError } from "./ipc/events";
import { useSignIn } from "./login/use-login";
import { SettingsDialog } from "./preferences/settings-dialog";
import { usePreferences } from "./preferences/use-preferences";
import { ResetControl } from "./reset/reset-control";
import type { AccountView } from "./roster/account";
import { RosterList } from "./roster/roster-list";
import { useRoster } from "./roster/use-roster";
import { useStatus } from "./status/use-status";
import styles from "./app.module.css";

export function App() {
  const { accounts, error } = useRoster();
  const statuses = useStatus();
  const { preferences, setPreference } = usePreferences();
  const { signIn, pending } = useSignIn();
  const { remove } = useForget();
  const { notify } = useToast();

  const [query, setQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AccountView | null>(null);

  useEffect(() => {
    const subscriptions = [onStatus(notify), onStatusError((message) => notify(message, "error"))];
    return () => {
      subscriptions.forEach((subscription) => subscription.then((stop) => stop()));
    };
  }, [notify]);

  useEffect(() => {
    if (error) {
      notify(error, "error");
    }
  }, [error, notify]);

  const filtered = useMemo(() => filterAccounts(accounts, query), [accounts, query]);

  return (
    <div className={styles.app}>
      <header className={styles.bar}>
        <div className={styles.brand}>
          <span className={styles.mark} />
          Roster
        </div>
        <div className={styles.actions}>
          <button className="btn btn-accent" onClick={() => setImportOpen(true)}>
            Import
          </button>
          <button className="btn-icon" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
            <GearIcon />
          </button>
        </div>
      </header>

      <div className={styles.search}>
        <input
          className="field"
          placeholder="Search accounts"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <main className={styles.main}>
        <RosterList
          accounts={filtered}
          streamer={preferences.streamer_mode}
          pending={pending}
          statuses={statuses}
          onSignIn={signIn}
          onRemove={setRemoveTarget}
        />
      </main>

      <footer className={styles.foot}>
        <ResetControl />
      </footer>

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      <SettingsDialog
        open={settingsOpen}
        preferences={preferences}
        onChange={setPreference}
        onClose={() => setSettingsOpen(false)}
      />
      <ConfirmDialog
        open={removeTarget !== null}
        title="Remove account"
        message={removeMessage(removeTarget, preferences.streamer_mode)}
        confirmLabel="Remove"
        danger
        onConfirm={() => removeTarget && remove(removeTarget.steamid)}
        onClose={() => setRemoveTarget(null)}
      />
    </div>
  );
}

function filterAccounts(accounts: AccountView[], query: string): AccountView[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return accounts;
  }
  return accounts.filter((account) =>
    `${account.display_name} ${account.account_name}`.toLowerCase().includes(needle),
  );
}

function removeMessage(account: AccountView | null, streamer: boolean): string {
  if (!account) {
    return "";
  }
  const name = streamer ? "this account" : account.display_name;
  return `Remove ${name}?`;
}

function GearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
