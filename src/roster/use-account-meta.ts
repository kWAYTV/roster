import { useCallback } from "react";

import { notify } from "../feedback/status";
import { commands, type OverridePatch } from "../platform/invoke";

export function useAccountMeta() {
  const setPinned = useCallback(
    async (steamid: string, pinned: boolean): Promise<boolean> => {
      try {
        notify(await commands.setPinned(steamid, pinned));
        return true;
      } catch (cause) {
        notify(String(cause), "error");
        return false;
      }
    },
    []
  );

  const setPinnedMany = useCallback(
    async (steamids: string[], pinned: boolean) => {
      if (steamids.length === 0) {
        return;
      }
      try {
        notify(await commands.setPinnedMany(steamids, pinned));
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    []
  );

  const setNote = useCallback(async (steamid: string, note: string) => {
    try {
      notify(await commands.setNote(steamid, note));
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  const clearNotesMany = useCallback(async (steamids: string[]) => {
    if (steamids.length === 0) {
      return;
    }
    try {
      notify(await commands.clearNotesMany(steamids));
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  const setTags = useCallback(async (steamid: string, tags: string[]) => {
    try {
      notify(await commands.setTags(steamid, tags));
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  const setOverrides = useCallback(
    async (steamid: string, patch: OverridePatch) => {
      try {
        notify(await commands.setAccountOverrides(steamid, patch));
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    []
  );

  return {
    clearNotesMany,
    setNote,
    setOverrides,
    setPinned,
    setPinnedMany,
    setTags,
  };
}
