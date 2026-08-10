const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'src', 'routes', 'index.tsx');
const src = fs.readFileSync(file, 'utf8');
const lines = src.split('\n');
const stack = [];
const openRe = /<\s*(div|section|main)([\s>])/i;
const closeRe = /<\s*\/\s*(div|section|main)\s*>/i;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let m;
  // find all tags in line
  const tagRegex = /<\/?\s*([a-zA-Z0-9-:]+)([^>]*)>/g;
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    const full = match[0];
    const name = match[1];
    const isClosing = full.startsWith('</');
    if (!['div','section','main'].includes(name)) continue;
    if (!isClosing) {
      // self-closing?
      if (!/\/>\s*$/.test(full)) {
        stack.push({ tag: name, line: i + 1 });
      }
    } else {
      if (stack.length === 0) {
        console.log('Unmatched closing', name, 'at', i+1);
      } else {
        const last = stack.pop();
        if (last.tag !== name) {
          console.log('Tag mismatch at', i+1, 'expected', last.tag, 'but got', name);
        }
      }
    }
  }
}
if (stack.length) {
  console.log('Unclosed tags:');
  stack.forEach(s => console.log(s.tag, 'opened at', s.line));
} else {
  console.log('No unclosed div/section/main tags found');
}
