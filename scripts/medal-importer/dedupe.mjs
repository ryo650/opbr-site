export function comparableMedal(medal) {
  const content = { ...medal };
  delete content.sources;
  delete content.colorCheck;
  return {
    ...content,
    tags: [...content.tags].sort(
      (left, right) =>
        left.id.localeCompare(right.id) || left.name.localeCompare(right.name),
    ),
    nativeTraits: [...content.nativeTraits].sort(),
    ...(content.statusReductions
      ? { statusReductions: [...content.statusReductions].sort() }
      : {}),
  };
}

export function differingFields(left, right) {
  const fields = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...fields].filter(
    (field) => JSON.stringify(left[field]) !== JSON.stringify(right[field]),
  );
}

export function deduplicateMedals(medals) {
  const byId = new Map();
  const unique = [];
  const skipped = [];

  for (const medal of medals) {
    const existing = byId.get(medal.id);
    if (!existing) {
      byId.set(medal.id, medal);
      unique.push(medal);
      continue;
    }

    const existingContent = comparableMedal(existing);
    const incomingContent = comparableMedal(medal);
    if (JSON.stringify(existingContent) !== JSON.stringify(incomingContent)) {
      const fields = differingFields(existingContent, incomingContent);
      throw new Error(
        `Duplicate medal ID conflict: ${medal.id}\nDiffering fields: ${fields.join(", ")}\nFirst Details: ${existing.sources.details}\nDuplicate Details: ${medal.sources.details}`,
      );
    }

    skipped.push({ medal, duplicateOf: existing });
  }

  return { unique, skipped };
}

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
