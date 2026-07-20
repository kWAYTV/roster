import { useCallback, useReducer } from "react";

import type { AccountView } from "../roster/account";
import { initialShellUi, shellUiReducer } from "./shell-ui";

export function useShellUi() {
  const [ui, dispatch] = useReducer(shellUiReducer, initialShellUi);

  const openSearch = useCallback(() => dispatch({ type: "open-search" }), []);
  const closeSearch = useCallback(() => dispatch({ type: "close-search" }), []);
  const setQuery = useCallback(
    (query: string) => dispatch({ type: "set-query", query }),
    [],
  );
  const openImport = useCallback(
    (prefill = "") => dispatch({ type: "open-import", prefill }),
    [],
  );
  const closeImport = useCallback(() => dispatch({ type: "close-import" }), []);
  const openSettings = useCallback(() => dispatch({ type: "open-settings" }), []);
  const closeSettings = useCallback(() => dispatch({ type: "close-settings" }), []);
  const askRemove = useCallback(
    (accounts: AccountView[]) => dispatch({ type: "ask-remove", accounts }),
    [],
  );
  const closeRemove = useCallback(() => dispatch({ type: "close-remove" }), []);
  const askCooldownSignIn = useCallback(
    (account: AccountView) => dispatch({ type: "ask-cooldown-sign-in", account }),
    [],
  );
  const closeCooldown = useCallback(() => dispatch({ type: "close-cooldown" }), []);
  const askBulkCooldown = useCallback(
    (steamids: string[]) => dispatch({ type: "ask-bulk-cooldown", steamids }),
    [],
  );
  const closeBulkCooldown = useCallback(
    () => dispatch({ type: "close-bulk-cooldown" }),
    [],
  );

  return {
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
  };
}
