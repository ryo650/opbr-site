import { fileURLToPath } from 'node:url';
import { characters } from '../../src/data/characters/index.ts';
import { readCatalog } from './store.mjs';
const snapshot = await readCatalog(fileURLToPath(new URL('../../src/data/characters/max-level-stats.json', import.meta.url)), characters);
console.log(`Validated ${snapshot.records.length} reviewed max-level records. Base Stats catalog unchanged.`);
