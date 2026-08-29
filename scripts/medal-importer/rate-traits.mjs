import {
  createUnknownNativeEffectIssue,
  extractCooldownNativeEffectCandidate,
  extractDamageNativeEffectCandidate,
  resolveNativeEffect,
} from "./native-effects.mjs";
import {
  createUnknownStatusEffectIssue,
  resolveStatusEffect,
} from "./status-effects.mjs";

const KNOWN_NATIVE_TRAITS = new Set(["atk", "def", "hp", "crit"]);

function normalizeText(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function issue(code, message, screenshot, ocrText, extra = {}) {
  return { code, message, screenshot, ocrText, ...extra };
}

function isRateNoiseLine(line) {
  const trimmed = line.trim();
  const normalized = normalizeText(trimmed);
  return (
    !trimmed ||
    /^\d+(?:[.,]\d+)?%$/.test(trimmed) ||
    /^[*.<>\-\s]+$/.test(trimmed) ||
    trimmed === "X O" ||
    /drop rates? are rounded/i.test(trimmed) ||
    /total number of the listed drop rates/i.test(trimmed) ||
    /^(home|rate|close|cancel|select the|general|types?)\b/i.test(trimmed) ||
    /^(extra trait|trait rate|drop rate)\b/i.test(trimmed) ||
    /^(★|\*)?\s*[123](?:\s*star)?$/i.test(trimmed) ||
    normalized === "x o"
  );
}

function isConditionOnlyLine(line) {
  const trimmed = line.trim();
  if (/[:：]\s*$/.test(trimmed)) return true;
  return /^(when|while|if|after|during|in|with|for)\b/i.test(trimmed) &&
    !/\b(increase|boost|reduce|decrease|recover|restore|nullif|shorten|extend|inflict|remove)\b/i.test(
      trimmed,
    );
}

function unknownEffectDisplayName(line) {
  const effectClause = line.includes(":") ? line.slice(line.lastIndexOf(":") + 1) : line;
  const withoutValue = effectClause
    .trim()
    .replace(/[.。]\s*$/, "")
    .replace(/\s+by\s+\d+(?:[.,]\d+)?%.*$/i, "")
    .replace(/^(boost|increase|reduce|decrease|recover|restore|nullify|shorten|extend|inflict|remove)\s+(?:the\s+)?/i, "")
    .trim();
  return withoutValue || effectClause.trim() || line.trim();
}

function isTraitLikeUnparsedLine(line) {
  const trimmed = line.trim();
  if (isRateNoiseLine(trimmed) || isConditionOnlyLine(trimmed)) return false;
  if (/^(chance|rate|probability)\b/i.test(trimmed)) return false;
  const hasStructuredValue =
    /\d+(?:[.,]\d+)?%/.test(trimmed) || /\bby\s+\d/i.test(trimmed);
  const hasKnownEffectGrammar =
    /\b(boost|decrease|reduces?|recover|restore|nullif(?:y)?|shorten|extend|inflict|remove)\b/i.test(
      trimmed,
    );
  return /[a-z]{3}/i.test(trimmed) &&
    (hasStructuredValue || hasKnownEffectGrammar);
}

function findSafeContinuation(lines, startIndex, matches) {
  const lastIndex = Math.min(lines.length - 1, startIndex + 3);
  for (let index = startIndex + 1; index <= lastIndex; index += 1) {
    const candidate = lines[index].trim();
    if (matches(candidate)) return index;
    if (!isRateNoiseLine(candidate)) return -1;
  }
  return -1;
}

export function reconstructRateTraitLines(lines) {
  const consumed = new Set();
  const reconstructed = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (consumed.has(index)) continue;
    const line = lines[index].trim();

    if (/\bincrease\s*$/i.test(line)) {
      const continuationIndex = findSafeContinuation(
        lines,
        index,
        (candidate) =>
          /^(?:[•*]+\s*)?(?:ATK|DEF|HP|CRIT)\s+by\s+\d+(?:[.,]\d+)?%/i.test(
            candidate,
          ),
      );
      if (continuationIndex !== -1) {
        reconstructed.push(`${line} ${lines[continuationIndex].trim()}`);
        consumed.add(continuationIndex);
        continue;
      }
    }

    if (/\bboost\s+(?:the\s+)?cooldown\b/i.test(line) && !/%/.test(line)) {
      const continuationIndex = findSafeContinuation(
        lines,
        index,
        (candidate) =>
          /^(?:(?:reduction\s+)?speed\s+of\s+)?skill\s+\d+\s+by\s+\d+(?:[.,]\d+)?%/i.test(
            candidate,
          ) ||
          /^reduction\s+speed\s+of\s+skill\s+\d+\s+by\s+\d+(?:[.,]\d+)?%/i.test(
            candidate,
          ),
      );
      if (continuationIndex !== -1) {
        reconstructed.push(`${line} ${lines[continuationIndex].trim()}`);
        consumed.add(continuationIndex);
        continue;
      }
    }

    reconstructed.push(line);
  }

  return reconstructed;
}

export function analyzeRateTraits(
  ocr,
  medalName,
  file,
  { statusEffectsByName, nativeEffectsByName },
) {
  const parsedLines = reconstructRateTraitLines(ocr.lines);
  const nativeTraits = new Set();
  const nativeEffects = new Set();
  const statusReductions = new Set();
  const traitKinds = new Set();
  const issues = [];
  const consumedLines = new Set();

  function addIssue(nextIssue) {
    if (
      !issues.some(
        (existing) =>
          existing.code === nextIssue.code &&
          existing.ocrText === nextIssue.ocrText,
      )
    ) {
      issues.push(nextIssue);
    }
  }

  for (let index = 0; index < parsedLines.length; index += 1) {
    const line = parsedLines[index];
    const nativeMatches = [...line.matchAll(/\bincrease\s+([a-z]+)\s+by\b/gi)];
    for (const match of nativeMatches) {
      consumedLines.add(index);
      const trait = match[1].toLowerCase();
      if (!KNOWN_NATIVE_TRAITS.has(trait)) {
        traitKinds.add(`unknown-native:${trait}`);
        addIssue(
          issue(
            "unknown-native-trait",
            `Unknown native trait detected: "${match[1]}"`,
            file,
            line,
            { medalName, unknownTraitText: match[1] },
          ),
        );
        continue;
      }
      nativeTraits.add(trait);
      traitKinds.add(`native:${trait}`);
    }

    if (/^reduces?\s+duration\s+of\b/i.test(line.trim())) {
      consumedLines.add(index);
      let statusText = line.trim();
      let lookahead = index + 1;
      while (
        !/\bduration\s+of\s+.+?\s+by\b/i.test(statusText) &&
        lookahead < parsedLines.length &&
        lookahead <= index + 3
      ) {
        const continuation = parsedLines[lookahead].trim();
        if (!isRateNoiseLine(continuation)) {
          statusText += ` ${continuation}`;
          consumedLines.add(lookahead);
        }
        lookahead += 1;
      }
      const match = statusText.match(/\bduration\s+of\s+(.+?)\s+by(?:\s|$)/i);
      if (!match) {
        addIssue(
          issue(
            "unparsed-rate-trait",
            "Status reduction trait could not be parsed",
            file,
            statusText,
            { medalName, unknownTraitText: statusText },
          ),
        );
        continue;
      }
      const displayNameCandidate = match[1].trim();
      const approvedStatus = resolveStatusEffect(
        statusEffectsByName,
        displayNameCandidate,
      );
      traitKinds.add(
        `status:${approvedStatus?.id ?? `unknown-${normalizeText(displayNameCandidate)}`}`,
      );
      if (!approvedStatus) {
        addIssue(
          createUnknownStatusEffectIssue({
            medalName,
            displayNameCandidate,
            ocrText: statusText,
            screenshot: file,
          }),
        );
        continue;
      }
      statusReductions.add(approvedStatus.id);
      continue;
    }

    const nativeEffectCandidate =
      extractCooldownNativeEffectCandidate(line) ??
      extractDamageNativeEffectCandidate(line);
    if (nativeEffectCandidate) {
      consumedLines.add(index);
      const approvedEffect = resolveNativeEffect(
        nativeEffectsByName,
        nativeEffectCandidate,
      );
      traitKinds.add(
        `native-effect:${approvedEffect?.id ?? `unknown-${normalizeText(nativeEffectCandidate)}`}`,
      );
      if (!approvedEffect) {
        addIssue(
          createUnknownNativeEffectIssue({
            medalName,
            displayNameCandidate: nativeEffectCandidate,
            ocrText: line,
            screenshot: file,
          }),
        );
        continue;
      }
      nativeEffects.add(approvedEffect.id);
    }
  }

  for (let index = 0; index < parsedLines.length; index += 1) {
    const line = parsedLines[index];
    if (consumedLines.has(index) || !isTraitLikeUnparsedLine(line)) continue;

    if (/\bincrease\b/i.test(line)) {
      addIssue(
        issue(
          "unparsed-rate-trait",
          "Rate contains an Increase trait that could not be parsed",
          file,
          line,
          { medalName, unknownTraitText: line },
        ),
      );
      continue;
    }

    const displayNameCandidate = unknownEffectDisplayName(line);
    traitKinds.add(`native-effect:unknown-${normalizeText(displayNameCandidate)}`);
    addIssue(
      createUnknownNativeEffectIssue({
        medalName,
        displayNameCandidate,
        ocrText: line,
        screenshot: file,
      }),
    );
  }

  if (traitKinds.size === 0) {
    issues.push(
      issue(
        "unparsed-rate-trait",
        "No native trait could be parsed from Rate screen",
        file,
        ocr.lines.join(" | "),
        { medalName },
      ),
    );
  }

  return {
    nativeTraits,
    nativeEffects,
    statusReductions,
    traitKinds,
    issues,
  };
}

export function isRateTraitRetryResolved(initial, retried) {
  const blockingCodes = new Set([
    "unknown-native-trait",
    "unknown-native-effect",
    "unparsed-rate-trait",
  ]);
  if (retried.issues.some(({ code }) => blockingCodes.has(code))) return false;
  const initialBlockingIssues = initial.issues.filter(({ code }) =>
    blockingCodes.has(code),
  );
  const unknownEffectIssues = initialBlockingIssues.filter(
    ({ code }) => code === "unknown-native-effect",
  );
  if (unknownEffectIssues.length > 0) {
    const safelyReplaced = unknownEffectIssues.every((item) => {
    const nativeTrait = item.ocrText?.match(/\b(atk|def|hp|crit)\s+by\b/i)?.[1];
    return nativeTrait
      ? retried.nativeTraits.has(nativeTrait.toLowerCase())
      : false;
    });
    if (!safelyReplaced) return false;
    if (unknownEffectIssues.length === initialBlockingIssues.length) return true;
  }

  return retried.traitKinds.size >= initial.traitKinds.size;
}
