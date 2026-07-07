#!/usr/bin/env node
/**
 * Validates all content/dayNN/*.json files against Zod schemas.
 * Usage: node scripts/validate-content.mjs
 * Exit 0 = all pass, 1 = validation failures.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
const schemaBase = join(root, 'src/content-engine/schemas');

const schemaModules = [
  ['meta.json', 'meta.schema.ts', 'metaSchema'],
  ['lesson.json', 'lesson.schema.ts', 'lessonSchema'],
  ['quiz.json', 'quiz.schema.ts', 'quizSchema'],
  ['challenge.json', 'challenge.schema.ts', 'challengeSchema'],
  ['interview.json', 'interview.schema.ts', 'interviewSchema'],
  ['reflection.json', 'reflection.schema.ts', 'reflectionSchema'],
  ['resources.json', 'resources.schema.ts', 'resourcesSchema'],
];

const schemas = new Map();
for (const [file, moduleName, exportName] of schemaModules) {
  const mod = await import(pathToFileURL(join(schemaBase, moduleName)).href);
  schemas.set(file, mod[exportName]);
}

const dayDirs = readdirSync(contentDir)
  .filter((d) => d.startsWith('day') && statSync(join(contentDir, d)).isDirectory())
  .sort();

let passed = 0;
let failed = 0;
let empty = 0;
const errors = [];

for (const day of dayDirs) {
  const dir = join(contentDir, day);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

  if (files.length === 0) {
    empty++;
    errors.push({ day, file: null, message: 'empty day folder' });
    continue;
  }

  for (const file of files) {
    const schema = schemas.get(file);
    if (!schema) {
      failed++;
      errors.push({ day, file, message: `no schema registered for ${file}` });
      continue;
    }

    const raw = readFileSync(join(dir, file), 'utf8');
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      failed++;
      errors.push({ day, file, message: `invalid JSON: ${e.message}` });
      continue;
    }

    const result = schema.safeParse(data);
    if (!result.success) {
      failed++;
      const issue = result.error.issues[0];
      errors.push({
        day,
        file,
        message: issue ? `${issue.path.join('.')}: ${issue.message}` : 'validation failed',
      });
    } else {
      passed++;
    }
  }
}

console.log(`FrontForge content validation`);
console.log(`  Days scanned: ${dayDirs.length}`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Empty folders: ${empty}`);

if (errors.length > 0) {
  console.log('\nIssues:');
  for (const e of errors) {
    console.log(`  - ${e.day}/${e.file ?? '(folder)'}: ${e.message}`);
  }
  process.exit(1);
}

console.log('\nALL_PASS');
process.exit(0);
