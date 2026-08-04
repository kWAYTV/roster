import { useCallback } from "react";

import { notify } from "../feedback/status";
import { openTextFile, saveTextFile } from "../platform/files";
import { commands } from "../platform/invoke";

export function useMetadataBackup() {
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
  }, []);

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
  }, []);

  return { exportBackup, importBackup };
}
