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

/// Add pasted or dropped entries to a draft, one entry per line, skipping
/// an exact repeat of what is already there.
export function appendEntries(current: string, incoming: string): string {
  const base = current.trim();
  const next = incoming.trim();
  if (!base) {
    return next;
  }
  if (!next || base.includes(next)) {
    return base;
  }
  // Re-import prefill ("name----") wants the token on the same line.
  if (base.endsWith("----") && !next.includes("\n")) {
    return `${base}${next}`;
  }
  return `${base}\n${next}`;
}
