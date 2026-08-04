const LINE_SPLIT = /\r?\n/;

export function seedFields(prefill: string | undefined): {
  bulk: string;
  single: string;
} {
  const next = typeof prefill === "string" ? prefill.trim() : "";
  if (!next) {
    return { bulk: "", single: "" };
  }
  if (looksLikeBulk(next)) {
    return { bulk: next, single: "" };
  }
  return { bulk: "", single: next };
}

export function importLabel(busy: boolean, count: number): string {
  if (busy) {
    return "Importing…";
  }
  if (count > 0) {
    return `Import ${count}`;
  }
  return "Import";
}

export function looksLikeBulk(text: string): boolean {
  return text.split(LINE_SPLIT).filter((line) => line.trim()).length > 1;
}
