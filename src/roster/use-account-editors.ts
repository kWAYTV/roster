import { useCallback, useState } from "react";

import type { AccountView } from "./account";

/// Owns note / tags / overrides dialog targets for the roster domain.
export function useAccountEditors() {
  const [noteTarget, setNoteTarget] = useState<AccountView | null>(null);
  const [tagsTarget, setTagsTarget] = useState<AccountView | null>(null);
  const [overridesTarget, setOverridesTarget] = useState<AccountView | null>(
    null
  );

  const closeNote = useCallback(() => {
    setNoteTarget(null);
  }, []);

  const closeTags = useCallback(() => {
    setTagsTarget(null);
  }, []);

  const closeOverrides = useCallback(() => {
    setOverridesTarget(null);
  }, []);

  return {
    closeNote,
    closeOverrides,
    closeTags,
    noteTarget,
    openNote: setNoteTarget,
    openOverrides: setOverridesTarget,
    openTags: setTagsTarget,
    overridesTarget,
    tagsTarget,
  };
}
