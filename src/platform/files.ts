import { open, save } from "@tauri-apps/plugin-dialog";

import { commands } from "./invoke";

export interface FileFilter {
  extensions: string[];
  name: string;
}

/** Native save picker, then write contents. Returns false if cancelled. */
export async function saveTextFile(options: {
  contents: string;
  defaultPath: string;
  filters: FileFilter[];
  title?: string;
}): Promise<boolean> {
  const path = await save({
    defaultPath: options.defaultPath,
    filters: options.filters,
    title: options.title,
  });
  if (!path) {
    return false;
  }
  await commands.writeTextFile(path, options.contents);
  return true;
}

/** Native open picker, then read UTF-8 text. Returns null if cancelled. */
export async function openTextFile(options: {
  filters: FileFilter[];
  title?: string;
}): Promise<string | null> {
  const path = await open({
    directory: false,
    filters: options.filters,
    multiple: false,
    title: options.title,
  });
  if (typeof path !== "string" || path.length === 0) {
    return null;
  }
  return commands.readTextFile(path);
}
