function normalizeText(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function inspectDetailsBody(lines) {
  const normalizedLines = lines.map(normalizeText);
  const hasMedalName = lines.some(
    (line) =>
      /\S+\s+medals?$/i.test(line.trim()) &&
      normalizeText(line) !== "medal details",
  );
  const hasUniqueTrait = normalizedLines.includes("unique trait");
  const hasTag = normalizedLines.includes("tag");
  const hasLimits = normalizedLines.includes("limits");
  const hasExtraTrait = normalizedLines.some((line) =>
    /^extra trait(?: \d+)?$/.test(line),
  );
  const hasRate = normalizedLines.includes("rate");
  const hasUnlockWithUpgrade = normalizedLines.some((line) =>
    /^unlock with upgrade \d+$/.test(line),
  );
  const hasCraft = normalizedLines.includes("craft");
  const evidence = {
    medalName: hasMedalName,
    uniqueTrait: hasUniqueTrait,
    tag: hasTag,
    limits: hasLimits,
    extraTrait: hasExtraTrait,
    rate: hasRate,
    unlockWithUpgrade: hasUnlockWithUpgrade,
    craft: hasCraft,
  };
  const evidenceCount = Object.values(evidence).filter(Boolean).length;

  return {
    evidence,
    evidenceCount,
    accepted:
      hasUniqueTrait ||
      (hasExtraTrait && hasRate && hasCraft) ||
      (evidenceCount >= 4 && hasExtraTrait && hasRate),
  };
}

export function classifyScreen(ocr, file) {
  const ocrText = ocr.lines.join(" | ");
  const titleTypes = new Set(
    ocr.observations
      .filter(
        ({ x, y, width }) =>
          x >= 0.35 && x + width <= 0.65 && y >= 0.85,
      )
      .map(({ text }) => {
        const title = normalizeText(text);
        if (title === "medal details") return "details";
        if (title === "tag") return "tag";
        if (title === "rate") return "rate";
        return null;
      })
      .filter(Boolean),
  );

  if (titleTypes.size !== 1) {
    const found = [...titleTypes].join(", ") || "none";
    throw new Error(
      `${file}: expected exactly one recognized modal title, found ${found}\nOCR: ${ocrText}`,
    );
  }

  const [type] = titleTypes;
  const normalizedLines = ocr.lines.map(normalizeText);
  const hasRateDescription = normalizedLines.some((line) =>
    line.includes("drop rates are rounded off"),
  );
  const hasPercentage = ocr.lines.some((line) => /\d+(?:[.,]\d+)?%/.test(line));
  const hasRateSignature = hasRateDescription && hasPercentage;
  const detailsBody = inspectDetailsBody(ocr.lines);

  if (type === "rate" && !hasRateSignature) {
    throw new Error(
      `${file}: Rate title conflicts with missing Rate signature\nOCR: ${ocrText}`,
    );
  }
  if (type !== "rate" && hasRateSignature) {
    throw new Error(
      `${file}: ${type} title conflicts with Rate signature\nOCR: ${ocrText}`,
    );
  }
  if (type === "details" && !detailsBody.accepted) {
    throw new Error(
      `${file}: Medal Details title conflicts with missing Details body structure\nDetails evidence: ${JSON.stringify(detailsBody.evidence)}\nOCR: ${ocrText}`,
    );
  }
  if (type === "tag" && detailsBody.evidence.uniqueTrait) {
    throw new Error(
      `${file}: Tag title conflicts with Details signature\nOCR: ${ocrText}`,
    );
  }

  return type;
}
