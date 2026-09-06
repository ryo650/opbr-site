const RATE_NOISE = [
  /^\d+(?:[.,]\d+)?%$/,
  /^[*.<>‹•\-\s]+$/,
  /drop rates? are rounded/i,
  /total number of the listed drop rates/i,
  /^(home|rate|close|cancel)$/i,
];

const EFFECT_PATTERNS = [
  {
    expression: /\bIncrease\s+(HP|ATK|DEF|CRIT)\s+by\s+(\d+(?:[.,]\d+)?)%/i,
    resolve(match) {
      const stat = match[1].toLowerCase();
      return {
        effectId: `${stat}-increase`,
        label: `${match[1].toUpperCase()} Increase`,
        value: Number(match[2].replace(",", ".")),
        unit: "percent",
        capGroup: `${stat}-increase-percent`,
      };
    },
  },
  {
    expression: /\bBoost\s+(?:the\s+)?cooldown reduction speed of Skill\s+([12])\s+by\s+(\d+(?:[.,]\d+)?)%/i,
    resolve(match) {
      return {
        effectId: `skill${match[1]}-cooldown-reduction-speed`,
        label: `Cooldown Reduction (Skill ${match[1]})`,
        value: Number(match[2].replace(",", ".")),
        unit: "percent",
        capGroup: `skill${match[1]}-cooldown-reduction-speed`,
      };
    },
  },
  {
    expression: /\bIncrease\s+damage dealt\s+by\s+(\d+(?:[.,]\d+)?)%/i,
    resolve(match) {
      return {
        effectId: "damage-dealt-increase",
        label: "Damage Dealt Increase",
        value: Number(match[1].replace(",", ".")),
        unit: "percent",
        capGroup: "damage-dealt-increase",
      };
    },
  },
  {
    expression: /\bReduce\s+damage received\s+by\s+(\d+(?:[.,]\d+)?)%/i,
    resolve(match) {
      return {
        effectId: "damage-received-reduction",
        label: "Damage Received Reduction",
        value: Number(match[1].replace(",", ".")),
        unit: "percent",
        capGroup: "damage-received-reduction",
      };
    },
  },
  {
    expression: /\bReduces?\s+duration of\s+(.+?)\s+by\s+(\d+(?:[.,]\d+)?)%/i,
    resolve(match) {
      const targetId = match[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const effectId = `${targetId}-duration-reduction`;
      return {
        effectId,
        label: `${match[1].trim()} Duration Reduction`,
        value: Number(match[2].replace(",", ".")),
        unit: "percent",
        capGroup: effectId,
      };
    },
  },
];

const REVIEWED_STAT_PERCENT_VALUES = new Set([6.5, 7.5, 12, 14, 16, 18]);

export const REVIEWED_FIXTURE_EVIDENCE = [
  ["rate-traits.test:B/C", "Boost the cooldown reduction speed of Skill 1 by 1%."],
  ["rate-traits.test:B/C", "Boost the cooldown reduction speed of Skill 2 by 1%."],
  ["rate-traits.test:D", 'When the equipped character is character type "Straw Hat Pirates": Boost the cooldown reduction speed of Skill 2 by 1%.'],
  ["rate-traits.test:E", 'When character type is "Runner": Boost the cooldown reduction speed of Skill 1 by 2%.'],
  ["rate-traits.test:E", "Boost the cooldown reduction speed of Skill 1 by 3%."],
  ["rate-traits.test:damage-navy", 'character type "Navy": Increase damage dealt by 3%.'],
  ["rate-traits.test:damage-logia", 'When attacking a character type "Logia" enemy: Increase damage dealt by 3%.'],
  ["rate-traits.test:damage-grand-line", 'character type "The Grand Line": Increase damage dealt by 5%.'],
  ["rate-traits.test:damage-grand-line", 'character type "The Grand Line": Reduce damage received by 3%.'],
  ["rate-traits.test:status", "Reduces duration of Stun by 36%."],
];

function isNoise(line) {
  const trimmed = line.trim();
  return !trimmed || RATE_NOISE.some((pattern) => pattern.test(trimmed));
}

function cleanLine(line) {
  return line.trim().replace(/^[*•‹:\-]+\s*/, "");
}

function conditionFromPrefix(prefix) {
  if (!prefix) return { condition: undefined };
  if (/Roger, Pirates/i.test(prefix)) {
    return { issue: "Condition contains an ambiguous OCR comma." };
  }

  const tagMatch = prefix.match(/(?:character type\s+is|character type|type)\s+"([^"]+)"\s*:\s*$/i);
  if (tagMatch) {
    return {
      condition: {
        kind: "text",
        description: `When the equipped character is character type "${tagMatch[1]}".`,
      },
    };
  }

  const attackMatch = prefix.match(/When attacking a character type\s+"([^"]+)"\s+enemy\s*:\s*$/i);
  if (attackMatch) {
    return {
      condition: {
        kind: "text",
        description: `When attacking an enemy with the ${attackMatch[1]} tag.`,
      },
    };
  }

  return { issue: "Condition text could not be normalized safely." };
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stableDefinitionId(definition) {
  const condition = definition.condition?.description ?? "unconditional";
  return slug(`${definition.effectId}-${definition.value}-${definition.unit}-${condition}`);
}

export function parseExtraTraitText(text, sourceRef) {
  for (const pattern of EFFECT_PATTERNS) {
    const match = text.match(pattern.expression);
    if (!match) continue;
    const prefix = text.slice(0, match.index).trim();
    const conditionResult = conditionFromPrefix(prefix);
    if (conditionResult.issue) {
      return { issue: { sourceRef, text, reason: conditionResult.issue } };
    }
    const resolved = pattern.resolve(match);
    if (/^(hp|atk|def|crit)-increase$/.test(resolved.effectId) && !REVIEWED_STAT_PERCENT_VALUES.has(resolved.value)) {
      return {
        issue: {
          sourceRef,
          text,
          reason: "Stat value is outside the reviewed Rate values and may be an OCR decimal error.",
        },
      };
    }
    const definition = {
      ...resolved,
      condition: conditionResult.condition,
      sourceRefs: [sourceRef],
    };
    return { definition: { id: stableDefinitionId(definition), ...definition } };
  }
  return {
    issue: {
      sourceRef,
      text,
      reason: "Effect, value, or unit could not be parsed safely.",
    },
  };
}

export function extractExtraTraitEvidenceFromDraft(draft) {
  const parsed = [];
  const issues = [];

  for (const medal of draft.medals ?? []) {
    if (!medal.validationPassed || medal.needsReview) continue;
    for (const screen of medal.ocr?.rates ?? []) {
      let pending = [];
      for (const rawLine of screen.lines ?? []) {
        if (isNoise(rawLine)) continue;
        pending.push(cleanLine(rawLine));
        const text = pending.join(" ");
        const hasCompleteEffect = EFFECT_PATTERNS.some(({ expression }) => expression.test(text));
        if (!hasCompleteEffect) continue;
        parsed.push(parseExtraTraitText(text, `${medal.id}:${screen.file}`));
        pending = [];
      }
      if (pending.some((line) => /\b(increase|boost|reduce)\b/i.test(line))) {
        issues.push({
          sourceRef: `${medal.id}:${screen.file}`,
          text: pending.join(" "),
          reason: "Effect, value, or unit could not be parsed safely.",
        });
      }
    }
  }

  return { parsed, issues };
}

export function createExtraTraitCatalog(draft) {
  const extracted = extractExtraTraitEvidenceFromDraft(draft);
  const parsed = [
    ...extracted.parsed,
    ...REVIEWED_FIXTURE_EVIDENCE.map(([sourceRef, text]) => parseExtraTraitText(text, sourceRef)),
  ];
  const definitionsById = new Map();
  const needsReview = [...extracted.issues];

  for (const result of parsed) {
    if (result.issue) {
      needsReview.push(result.issue);
      continue;
    }
    const existing = definitionsById.get(result.definition.id);
    if (!existing) {
      definitionsById.set(result.definition.id, result.definition);
      continue;
    }
    existing.sourceRefs = [...new Set([...existing.sourceRefs, ...result.definition.sourceRefs])].sort();
  }

  const definitions = [...definitionsById.values()].sort((left, right) =>
    left.label.localeCompare(right.label) ||
    left.value - right.value ||
    (left.condition?.description ?? "").localeCompare(right.condition?.description ?? ""),
  );
  needsReview.sort((left, right) => left.sourceRef.localeCompare(right.sourceRef));
  return { definitions, needsReview };
}

export function renderExtraTraitCatalog({ definitions, needsReview }) {
  return `import type { ExtraTraitCatalogIssue, RawExtraTraitDefinition } from "./extra-traits.ts";\n\n` +
    `// Generated from validation-passed Rate OCR plus reviewed importer fixtures.\n` +
    `// Run npm run medals:generate-extra-traits to regenerate.\n` +
    `export const extraTraitCatalog = ${JSON.stringify(definitions, null, 2)} as const satisfies readonly RawExtraTraitDefinition[];\n\n` +
    `export const extraTraitCatalogNeedsReview = ${JSON.stringify(needsReview, null, 2)} as const satisfies readonly ExtraTraitCatalogIssue[];\n`;
}
