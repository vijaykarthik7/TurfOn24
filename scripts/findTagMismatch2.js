const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'src', 'routes', 'index.tsx');
const src = fs.readFileSync(file, 'utf8');
const lines = src.split(/\r?\n/);
const voids = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']);
const regex = /<([A-Za-z][A-Za-z0-9-]*)\b[^>]*>|<\\/([A-Za-z][A-Za-z0-9-]*)\s*>|<([A-Za-z][A-Za-z0-9-]*)\s*\/\s*>/g;
const stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  regex.lastIndex = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match[3]) continue; // self-closing
    if (match[1]) {
      const tag = match[1].toLowerCase();
      if (!voids.has(tag)) {
        stack.push({ tag, line: i + 1, text: line.trim() });
      }
    } else if (match[2]) {
      const tag = match[2].toLowerCase();
      if (stack.length === 0) {
        console.log(`unmatched closing </${tag}> at line ${i + 1}: ${line.trim()}`);
        process.exit(1);
      }
      const last = stack[stack.length - 1];
      if (last.tag === tag) {
        stack.pop();
      } else {
        console.log(`mismatch: <${last.tag}> opened at line ${last.line} (${last.text}) but closed with </${tag}> at line ${i + 1}: ${line.trim()}`);
        process.exit(1);
      }
    }
  }
}
if (stack.length) {
  const last = stack[stack.length - 1];
  console.log(`unclosed <${last.tag}> opened at line ${last.line}: ${last.text}`);
  process.exit(1);
}
console.log('all balanced');
