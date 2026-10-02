import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, readFile } from "node:fs/promises";
import path from "node:path";

export function tagComparisonCrop({ width, height }, scale) {
  // Cover the complete existing extractTags viewport, with text-edge padding.
  const x = Math.max(0, Math.floor(width * 0.2) - 32);
  const y = Math.max(0, Math.floor(height * 0.15) - 32);
  return {
    x,
    y,
    width: Math.min(width, Math.ceil(width * 0.8) + 32) - x,
    height: Math.min(height, Math.ceil(height * 0.86) + 32) - y,
    scale,
  };
}

function tagIds(result) {
  if (!result || !Array.isArray(result.tags) || !Array.isArray(result.issues)) {
    throw new Error("Tag OCR comparison requires two completed extraction results");
  }
  return new Set(result.tags.map((tag) => {
    // extractTags already normalizes IDs with slugify; never fuzzy-match names.
    if (!tag || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag.id)) {
      throw new Error("Tag OCR comparison received an invalid normalized tag ID");
    }
    return tag.id;
  }));
}

export function compareTagResults(normal, region, sourceImage) {
  const detected = tagIds(normal);
  const dedicated = tagIds(region);
  if (region.issues.some((entry) => entry.code !== "missing-tags")) {
    throw new Error(`${sourceImage}: tag region extraction is incomplete; comparison cannot proceed`);
  }
  const matches = detected.size === dedicated.size &&
    [...detected].every((id) => dedicated.has(id));
  return {
    matches,
    // Preserve the normal array and its order, names, and existing issues.
    tags: normal.tags,
    issues: [
      ...normal.issues,
      ...(matches ? [] : [{
        code: "tag-ocr-mismatch",
        message: "Normal OCR and tag-region OCR detected different tag ID sets; manual review required",
        screenshot: sourceImage,
        ocrText: `${[...detected].join(" | ")} <> ${[...dedicated].join(" | ")}`,
        detectedTagIds: [...detected].sort(),
        tagRegionDetectedTagIds: [...dedicated].sort(),
      }]),
    ],
  };
}

export async function sourceImageSha256(file, readBytes = readFile) {
  const bytes = await readBytes(file);
  if (!Buffer.isBuffer(bytes) && !(bytes instanceof Uint8Array)) {
    throw new Error("Source image hash requires original image bytes");
  }
  return createHash("sha256").update(bytes).digest("hex");
}

export async function verifySourceImageHash(file, expectedHash) {
  if (!/^[a-f0-9]{64}$/.test(expectedHash) || await sourceImageSha256(file) !== expectedHash) {
    throw new Error(`${file}: source image changed during OCR; refusing inconsistent evidence`);
  }
}

export async function createTagAudit(directory, {
  startedAt = new Date(),
  runId = randomUUID(),
  mode = "incremental",
  openFile = open,
} = {}) {
  if (!/^[a-zA-Z0-9-]+$/.test(runId)) throw new Error("Invalid audit run ID");
  await mkdir(directory, { recursive: true });
  const stamp = startedAt.toISOString().replace(/[:.]/g, "-");
  const file = path.join(directory, `${stamp}-${runId}.jsonl`);
  const handle = await openFile(file, "wx");
  let queue = Promise.resolve();
  let closed = false;
  const audit = {
    file,
    append(entry) {
      if (closed) return Promise.reject(new Error("Audit is closed"));
      // One writer per run; after a failed write/sync, no further append is safe.
      queue = queue.then(async () => {
        for (const record of entry.records ?? []) {
          if (!/^[a-f0-9]{64}$/.test(record.sourceImageSha256)) {
            throw new Error("Audit evidence requires an original source image SHA-256");
          }
        }
        await handle.writeFile(`${JSON.stringify(entry)}\n`);
        await handle.sync();
      });
      return queue;
    },
    async close() {
      closed = true;
      try { await queue; } finally { await handle.close(); }
    },
  };
  try {
    await audit.append({ event: "run-started", mode });
  } catch (error) {
    await audit.close().catch(() => {});
    throw error;
  }
  return audit;
}

export function readTagAudit(text) {
  const lines = text.split("\n");
  const incompleteTail = lines.pop();
  // A complete malformed line is an error; never silently discard corruption.
  const events = lines.map((line) => JSON.parse(line));
  return { events, incompleteTail: incompleteTail !== "" };
}

export async function publishWithTagAudit({ audit, publish, records, now = () => new Date() }) {
  // This append includes fsync. Failure here prevents any production mutation.
  await audit.append({ event: "publication-started" });
  try {
    await publish();
  } catch (error) {
    try {
      await audit.append({ event: "publication-failed", error: error.message });
    } catch (auditError) {
      throw new AggregateError([error, auditError], "Production publication failed; audit failure also occurred");
    }
    throw error;
  }
  let auditError;
  try {
    const importedAt = now().toISOString();
    await audit.append({
      event: "publication-success",
      records: records.map((record) => ({ ...record, importedAt })),
    });
  } catch (error) {
    // Production already committed. Do not rollback or describe this as an import failure.
    auditError = error;
  }
  try {
    await audit.close();
  } catch (error) {
    auditError ??= error;
  }
  return { published: true, auditComplete: !auditError, ...(auditError ? { auditError } : {}) };
}
