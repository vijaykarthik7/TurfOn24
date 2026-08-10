const fs = require('fs');
const ts = require('typescript');
const path = require('path');
const file = path.resolve(__dirname, '..', 'src', 'routes', 'index.tsx');
const src = fs.readFileSync(file, 'utf8');
const res = ts.transpileModule(src, { compilerOptions: { jsx: ts.JsxEmit.Preserve }, reportDiagnostics: true });
const out = { diagnostics: [] };
if (res.diagnostics && res.diagnostics.length) {
  res.diagnostics.forEach((d) => {
    const msg = typeof d.messageText === 'string' ? d.messageText : d.messageText.messageText;
    out.diagnostics.push({ message: msg, start: d.start, length: d.length });
  });
}
const outPath = require('path').resolve(__dirname, 'diag.json');
require('fs').writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('Wrote diagnostics to', outPath);
