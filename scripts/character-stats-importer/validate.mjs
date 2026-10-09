import { fileURLToPath } from 'node:url';
import { characters } from '../../src/data/characters/index.ts';
import { readCatalog } from './store.mjs';
import { readBaseCatalog } from './base-store.mjs';
const snapshot = await readCatalog(fileURLToPath(new URL('../../src/data/characters/max-level-stats.json', import.meta.url)), characters);
const base = await readBaseCatalog(fileURLToPath(new URL('../../src/data/characters/level-100-base-stats.ts', import.meta.url)), characters);
console.log(`Validated ${snapshot.records.length} reviewed max-level records and ${base.records.length} existing Base Stats records.`);
