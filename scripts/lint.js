import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '..', 'src');
const ERRORS = [];
const WARNINGS = [];
let fileCount = 0;

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.name.endsWith('.js')) {
      lintFile(fullPath);
    }
  }
}

function lintFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relPath = path.relative(path.join(__dirname, '..'), filePath);
  fileCount++;

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    if (line.includes('console.log') && !filePath.includes('server.js')) {
      WARNINGS.push(`${relPath}:${lineNum} - console.log found`);
    }

    if (line.includes('debugger')) {
      ERRORS.push(`${relPath}:${lineNum} - debugger statement found`);
    }

    if (line.includes('var ')) {
      WARNINGS.push(`${relPath}:${lineNum} - use 'let' or 'const' instead of 'var'`);
    }

    if (line.length > 150) {
      WARNINGS.push(`${relPath}:${lineNum} - line exceeds 150 chars (${line.length})`);
    }
  });

  const importRegex = /import\s+.*from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.') || importPath.startsWith('/')) {
      const resolvedPath = path.resolve(path.dirname(filePath), importPath);
      if (!fs.existsSync(resolvedPath)) {
        ERRORS.push(`${relPath}:0 - import '${importPath}' file not found`);
      }
    }
  }
}

console.log('🔍 Linting source files...\n');
walkDir(SRC_DIR);

if (ERRORS.length > 0) {
  console.log('❌ ERRORS:');
  ERRORS.forEach((e) => console.log(`  ${e}`));
  console.log('');
}

if (WARNINGS.length > 0) {
  console.log('⚠️  WARNINGS:');
  WARNINGS.forEach((w) => console.log(`  ${w}`));
  console.log('');
}

console.log(`✅ Linted ${fileCount} files: ${ERRORS.length} errors, ${WARNINGS.length} warnings`);

if (ERRORS.length > 0) {
  process.exit(1);
}
