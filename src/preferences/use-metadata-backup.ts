import { useCallback } from "react";

import { useToast } from "../feedback/toast";
import { commands } from "../platform/invoke";

export function useMetadataBackup() {
  const { notify } = useToast();

  const exportBackup = useCallback(async () => {
    try {
      const json = await commands.exportMetadata();
      const blob = new Blob([`${json}\n`], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "roster-metadata.json";
      anchor.click();
      URL.revokeObjectURL(url);
      notify("Metadata exported");
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, [notify]);

  const importBackup = useCallback(async () => {
    try {
      const text = await pickTextFile();
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

function pickTextFile(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.accept = ".json,application/json,text/plain";
    input.type = "file";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      file.text().then(resolve).catch(reject);
    });
    input.click();
  });
}
