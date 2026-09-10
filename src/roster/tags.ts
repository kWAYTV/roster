const TAG_SPLIT = /[,#]+/;

/// Split a comma / hash tagged field into unique trimmed tags.
export function parseTags(value: string): string[] {
  const tags: string[] = [];
  const seen = new Set<string>();
  for (const part of value.split(TAG_SPLIT)) {
    const tag = part.trim();
    if (!tag) {
      continue;
    }
    const key = tag.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}
