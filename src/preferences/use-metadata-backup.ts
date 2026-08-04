import { useCallback } from "react";

import { useToast } from "../feedback/toast";
import { openTextFile, saveTextFile } from "../platform/files";
import { commands } from "../platform/invoke";

export function useMetadataBackup() {
  const { notify } = useToast();

  const exportBackup = useCallback(async () => {
    try {
      const json = await commands.exportMetadata();
      const saved = await saveTextFile({
        contents: `${json}\n`,
        defaultPath: "roster-metadata.json",
        filters: [{ extensions: ["json"], name: "JSON" }],
        title: "Export metadata",
      });
      if (!saved) {
        return;
      }
      notify("Metadata exported");
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, [notify]);

  const importBackup = useCallback(async () => {
    try {
      const text = await openTextFile({
        filters: [{ extensions: ["json"], name: "JSON" }],
        title: "Import metadata",
      });
      if (text === null) {
        return;
      }
      notify(await commands.importMetadata(text));
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, [notify]);

  return { exportBackup, importBackup };
}
