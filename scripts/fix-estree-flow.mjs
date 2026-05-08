import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const flowFilePath = resolve(process.cwd(), 'node_modules', '@types', 'estree', 'flow.d.ts');
const patchBlock = [
  "type Node = import('./index').Node;",
  "type Literal = import('./index').Literal;",
  "type Declaration = import('./index').Declaration;",
  "type Identifier = import('./index').Identifier;",
  "type Expression = import('./index').Expression;",
  "type BlockStatement = import('./index').BlockStatement;",
  '',
].join('\n');

try {
  const current = readFileSync(flowFilePath, 'utf8');

  if (current.startsWith("type Node = import('./index').Node;")) {
    process.exit(0);
  }

  writeFileSync(flowFilePath, `${patchBlock}${current}`, 'utf8');
} catch (error) {
  console.warn('Skipping estree flow patch:', error instanceof Error ? error.message : String(error));
}