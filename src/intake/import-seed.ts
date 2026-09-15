const LINE_SPLIT = /\r?\n/;
const TEXT_FILE = /\.(txt|csv|log|jwt)$/i;

export function seedText(prefill: string | undefined): string {
  return typeof prefill === "string" ? prefill.trim() : "";
}

export function importLabel(busy: boolean, count: number): string {
  if (busy) {
    return "Importing…";
  }
  if (count > 1) {
    return `Import ${count}`;
  }
  return "Import";
}

export function looksLikeBulk(text: string): boolean {
  return text.split(LINE_SPLIT).filter((line) => line.trim()).length > 1;
}

export function isImportFile(file: File): boolean {
  return TEXT_FILE.test(file.name) || file.type.startsWith("text/");
}
