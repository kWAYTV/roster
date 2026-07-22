import { useCallback, useState } from "react";

import type { AccountView } from "../roster/account";
import { initialShellUi, type ShellUiAction, shellUiReducer } from "./shell-ui";

export function useShellUi() {
  const [ui, setUi] = useState(initialShellUi);

  const dispatch = useCallback((action: ShellUiAction) => {
    setUi((state) => shellUiReducer(state, action));
  }, []);

  const openSearch = useCallback(() => {
    dispatch({ type: "open-search" });
  }, [dispatch]);

  const closeSearch = useCallback(() => {
    dispatch({ type: "close-search" });
  }, [dispatch]);

  const setQuery = useCallback(
    (query: string) => {
      dispatch({ query, type: "set-query" });
    },
    [dispatch]
  );

  const openImport = useCallback(
    (prefill = "") => {
      // Click handlers pass a MouseEvent as arg1 — only accept real strings.
      dispatch({
        prefill: typeof prefill === "string" ? prefill : "",
        type: "open-import",
      });
    },
    [dispatch]
  );

  const closeImport = useCallback(() => {
    dispatch({ type: "close-import" });
  }, [dispatch]);

  const openSettings = useCallback(() => {
    dispatch({ type: "open-settings" });
  }, [dispatch]);

  const closeSettings = useCallback(() => {
    dispatch({ type: "close-settings" });
  }, [dispatch]);

  const askRemove = useCallback(
    (accounts: AccountView[]) => {
      dispatch({ accounts, type: "ask-remove" });
    },
    [dispatch]
  );

  const closeRemove = useCallback(() => {
    dispatch({ type: "close-remove" });
  }, [dispatch]);

  const askCooldownSignIn = useCallback(
    (account: AccountView) => {
      dispatch({ account, type: "ask-cooldown-sign-in" });
    },
    [dispatch]
  );

  const closeCooldown = useCallback(() => {
    dispatch({ type: "close-cooldown" });
  }, [dispatch]);

  const askBulkCooldown = useCallback(
    (steamids: string[]) => {
      dispatch({ steamids, type: "ask-bulk-cooldown" });
    },
    [dispatch]
  );

  const closeBulkCooldown = useCallback(() => {
    dispatch({ type: "close-bulk-cooldown" });
  }, [dispatch]);

  return {
    askBulkCooldown,
    askCooldownSignIn,
    askRemove,
    closeBulkCooldown,
    closeCooldown,
    closeImport,
    closeRemove,
    closeSearch,
    closeSettings,
    openImport,
    openSearch,
    openSettings,
    setQuery,
    ui,
  };
}
