export function groupScreens(screens) {
  const groups = [];
  let current = null;

  for (const screen of screens) {
    if (screen.type === "details") {
      if (screen.detailsContinuation) {
        if (!current) {
          throw new Error(
            `${screen.file}: Details continuation appears before the base Medal Details screen`,
          );
        }
        current.detailsContinuations ??= [];
        current.detailsContinuations.push({
          file: screen.file,
          ...screen.detailsContinuation,
        });
        continue;
      }
      current = { details: screen.file, tagScreens: [], rates: [] };
      groups.push(current);
      continue;
    }
    if (!current) {
      throw new Error(`${screen.file} appears before the first Medal Details screen`);
    }
    if (screen.type === "tag") {
      if (current.rates.length > 0) {
        throw new Error(
          `${screen.file}: Tag screen appears after Rate screens in group beginning ${current.details}`,
        );
      }
      current.tagScreens.push(screen.file);
      continue;
    }
    if (screen.type === "rate") {
      current.rates.push(screen.file);
      continue;
    }
    throw new Error(`Could not classify ${screen.file}; refusing to guess`);
  }

  for (const group of groups) {
    if (group.tagScreens.length === 0 || group.rates.length === 0) {
      throw new Error(`Incomplete group beginning ${group.details}`);
    }
  }
  return groups;
}

export function mergeTagPages(pageResults) {
  const tags = [];
  const issues = pageResults.flatMap((page) => page.issues ?? []);
  const tagById = new Map();
  const firstPageBySignature = new Map();

  for (const page of pageResults) {
    const signature = JSON.stringify(
      page.tags.map((tag) => ({ id: tag.id, name: tag.name })),
    );
    const duplicatePage = firstPageBySignature.get(signature);
    let added = 0;

    for (const tag of page.tags) {
      const existing = tagById.get(tag.id);
      if (!existing) {
        tagById.set(tag.id, tag);
        tags.push(tag);
        added += 1;
        continue;
      }
      if (existing.name !== tag.name) {
        issues.push({
          code: "tag-id-conflict",
          message: `Tag ID ${tag.id} has conflicting OCR names`,
          screenshot: page.file,
          ocrText: `${existing.name} | ${tag.name}`,
          conflictingTag: existing,
          currentTag: tag,
        });
      }
    }

    if (duplicatePage && added === 0) {
      issues.push({
        code: "duplicate-tag-page-content",
        message:
          "Tag page has identical extracted content and adds no new tags; possible accidental duplicate capture",
        screenshot: page.file,
        ocrText: page.tags.map((tag) => tag.name).join(" | "),
        duplicateScreenshot: duplicatePage,
      });
    } else if (!duplicatePage) {
      firstPageBySignature.set(signature, page.file);
    }
  }

  return {
    tags,
    issues,
    pages: pageResults.map((page) => ({
      screenshot: page.file,
      tags: page.tags,
    })),
  };
}
