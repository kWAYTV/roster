export type PendingExport =
  | { kind: "copy"; steamids: string[] }
  | { kind: "file"; steamids: string[] }
  | null;
