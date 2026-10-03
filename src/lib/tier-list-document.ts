// Share data contains stable catalog IDs, never mutable catalog array indexes.
export const TIER_IDS = ["god", "ss", "s", "a", "b", "c", "d"] as const;
export type TierGrade = typeof TIER_IDS[number];
export type TierState = Record<TierGrade, string[]>;
export type TierListDocument = { v: 1; title: string; tiers: TierState; pool: string[] };
export const STORAGE_KEY = "opbr:create-tier-list:v1";
export const SHARE_PREFIX = "#tier=v1.";
export const MAX_TITLE_LENGTH = 120;
export const MAX_DOCUMENT_BYTES = 256_000;
export const MAX_SHARE_URL_LENGTH = 8_000;
export const DEFAULT_TITLE = "My OPBR Tier List";
export const emptyTiers = (): TierState => ({ god: [], ss: [], s: [], a: [], b: [], c: [], d: [] });
export const emptyDocument = (ids: string[]): TierListDocument => ({ v: 1, title: DEFAULT_TITLE, tiers: emptyTiers(), pool: [...ids] });

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateDocument(value: unknown, ids: string[]): TierListDocument {
  if (!record(value) || value.v !== 1) throw new Error("This tier list format is not supported.");
  if (typeof value.title !== "string" || value.title.length > MAX_TITLE_LENGTH) throw new Error("The tier list name is invalid or too long.");
  if (!record(value.tiers) || Object.keys(value.tiers).length !== TIER_IDS.length || !Array.isArray(value.pool)) throw new Error("The tier list structure is invalid.");
  const known = new Set(ids);
  const seen = new Set<string>();
  const readIds = (items: unknown): string[] => {
    if (!Array.isArray(items) || items.length > ids.length) throw new Error("The tier list has too many characters.");
    return items.map((id) => {
      if (typeof id !== "string" || !known.has(id)) throw new Error("This tier list contains an unknown character. It may need a newer site version.");
      if (seen.has(id)) throw new Error("This tier list contains duplicate characters.");
      seen.add(id);
      return id;
    });
  };
  const tiers = Object.fromEntries(TIER_IDS.map((id) => [id, readIds((value.tiers as Record<string, unknown>)[id])])) as TierState;
  const pool = readIds(value.pool);
  // Catalog additions are available without changing any saved placements/order.
  pool.push(...ids.filter((id) => !seen.has(id)));
  return { v: 1, title: value.title, tiers, pool };
}

export function parseDocument(text: string, ids: string[]): TierListDocument {
  if (new TextEncoder().encode(text).length > MAX_DOCUMENT_BYTES) throw new Error("The tier list file is too large.");
  return validateDocument(JSON.parse(text), ids);
}

export function snapshotDocument(title: string, tiers: TierState, pool: string[]): TierListDocument {
  const ranked = new Set(Object.values(tiers).flat());
  return { v: 1, title, tiers, pool: pool.filter((id) => !ranked.has(id)) };
}

async function readBounded(stream: ReadableStream<Uint8Array>, limit: number): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > limit) throw new Error("The shared tier list is too large.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

export async function createShareUrl(document: TierListDocument, baseUrl: string): Promise<string> {
  if (typeof CompressionStream === "undefined") throw new Error("Link sharing is unavailable in this browser. Download the tier list file instead.");
  const bytes = new TextEncoder().encode(JSON.stringify(document));
  if (bytes.length > MAX_DOCUMENT_BYTES) throw new Error("This tier list is too large to share. Download the tier list file instead.");
  const compressed = await readBounded(new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip")), MAX_DOCUMENT_BYTES);
  const encoded = btoa(Array.from(compressed, (byte) => String.fromCharCode(byte)).join("")).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  const url = new URL(baseUrl);
  url.hash = SHARE_PREFIX + encoded;
  if (url.href.length > MAX_SHARE_URL_LENGTH) throw new Error(`This link exceeds ${MAX_SHARE_URL_LENGTH.toLocaleString()} characters. Download and share the tier list file instead.`);
  return url.href;
}

export async function readShareHash(hash: string, ids: string[]): Promise<TierListDocument | null> {
  if (!hash.startsWith("#tier=")) return null;
  if (!hash.startsWith(SHARE_PREFIX)) throw new Error("This shared tier list version is not supported.");
  if (hash.length > MAX_SHARE_URL_LENGTH) throw new Error("The shared tier list link is too large.");
  const encoded = hash.slice(SHARE_PREFIX.length);
  if (!encoded || !/^[A-Za-z0-9_-]+$/.test(encoded)) throw new Error("The shared tier list link is invalid.");
  if (typeof DecompressionStream === "undefined") throw new Error("Open this link in a newer browser, or import a tier list file.");
  const binary = atob(encoded.replaceAll("-", "+").replaceAll("_", "/"));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const decompressed = await readBounded(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")), MAX_DOCUMENT_BYTES);
  return parseDocument(new TextDecoder("utf-8", { fatal: true }).decode(decompressed), ids);
}
