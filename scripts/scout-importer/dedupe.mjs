export function deduplicateScreenshots(items) {
  const bySignature = new Map();
  const unique = [];
  const skipped = [];

  for (const item of items) {
    const existing = bySignature.get(item.signature);
    if (existing) {
      skipped.push({ item, duplicateOf: existing });
      continue;
    }
    bySignature.set(item.signature, item);
    unique.push(item);
  }

  return { unique, skipped };
}
