const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'src', 'routes', 'index.tsx');
const src = fs.readFileSync(file, 'utf8');
const lines = src.split(/\r?\n/);

function findMismatch() {
  const stack = [];
  const tagRegex = /<([A-Za-z][A-Za-z0-9-]*)\b[^>]*>|<\\/([A-Za-z][A-Za-z0-9-]*)\s*>|<([A-Za-z][A-Za-z0-9-]*)\s*\/\s*>/g;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    tagRegex.lastIndex = 0;
    while ((match = tagRegex.exec(line)) !== null) {
      if (match[3]) {
        // self-closing
        continue;
      } else if (match[1]) {
        // opening
        const tag = match[1];
        // ignore common void elements
        const voids = ['img','input','br','hr','meta','link','area','base','col','embed','source','track','wbr'];
        if (!voids.includes(tag.toLowerCase())) {
          stack.push({tag, line: i+1});
        }
      } else if (match[2]) {
        const tag = match[2];
        if (stack.length === 0) {
          console.log(`Unmatched closing </${tag}> at line ${i+1}`);
          return;
        }
        const last = stack[stack.length-1];
        if (last.tag === tag) {
          stack.pop();
        } else {
          console.log(`Tag mismatch: expected </${last.tag}> but found </${tag}> at line ${i+1}. Last opened at line ${last.line}`);
          return;
        }
      }
    }
  }
  if (stack.length > 0) {
    const last = stack[stack.length-1];
    console.log(`File ended but tag <${last.tag}> opened at line ${last.line} was not closed.`);
  } else {
    console.log('All tags appear balanced (heuristic).');
  }
}

findMismatch();
