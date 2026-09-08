import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

function propertyName(node) {
  if (
    ts.isStringLiteral(node) ||
    ts.isNumericLiteral(node) ||
    ts.isIdentifier(node)
  ) {
    return node.text;
  }
  return null;
}

function stringProperty(object, name) {
  const property = object.properties.find(
    (candidate) =>
      ts.isPropertyAssignment(candidate) &&
      propertyName(candidate.name) === name,
  );
  if (!property || !ts.isPropertyAssignment(property)) return null;
  return ts.isStringLiteralLike(property.initializer)
    ? property.initializer.text
    : null;
}

function charactersFromSource(source, file) {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const characters = [];

  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isObjectLiteralExpression(node.initializer)) {
      for (const property of node.initializer.properties) {
        if (
          !ts.isPropertyAssignment(property) ||
          !ts.isObjectLiteralExpression(property.initializer)
        ) {
          continue;
        }
        const key = propertyName(property.name);
        const declaredId = stringProperty(property.initializer, "id");
        const name = stringProperty(property.initializer, "name");
        const grade = stringProperty(property.initializer, "grade");
        const element = stringProperty(property.initializer, "element");
        const role = stringProperty(property.initializer, "role");
        if (!key || !declaredId || !name || !grade || !element || !role) continue;
        // Scout Simulator resolves Record keys, so the object key is the
        // authoritative characterId even when legacy value.id contains a typo.
        characters.push({
          id: key,
          declaredId,
          name,
          grade,
          element,
          role,
          source: file,
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return characters;
}

export async function loadCharacterMaster(characterDir) {
  const files = (await readdir(characterDir))
    .filter((file) => /^(?:red|blue|green|black|white)\.ts$/.test(file))
    .sort();
  const characters = [];
  for (const file of files) {
    const filePath = path.join(characterDir, file);
    characters.push(
      ...charactersFromSource(await readFile(filePath, "utf8"), file),
    );
  }

  if (characters.length === 0) {
    throw new Error(`No characters found in ${characterDir}`);
  }
  const byId = new Map();
  for (const character of characters) {
    if (byId.has(character.id)) {
      throw new Error(`Duplicate character id in master: ${character.id}`);
    }
    byId.set(character.id, character);
  }
  return { characters, byId };
}
