import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

const COLUMN_BOUNDS = [
  { key: 'flatNumber',      min: 55,  max: 108 },
  { key: 'name',            min: 108, max: 175 },
  { key: 'mobile',          min: 175, max: 245 },
  { key: 'ownerOrResident', min: 245, max: 290 },
  { key: 'date',            min: 290, max: 330 },
  { key: 'amount',          min: 330, max: 370 },
  { key: 'cashReceiver',    min: 370, max: 405 },
  { key: 'bankDetail',      min: 405, max: 450 },
  { key: 'lateDays',        min: 450, max: 999 },
];
const FLAT_REGEX = /^(?:[A-Z]-?\d{2,4}|Shop\s*-?\s*\d{1,2})$/i;
const ROW_TOLERANCE = 5;

const data = new Uint8Array(fs.readFileSync('/tmp/ledger.pdf'));
const pdf = await pdfjsLib.getDocument({ data }).promise;
const allRecords = [];
for (let p = 1; p <= pdf.numPages; p++) {
  const page = await pdf.getPage(p);
  const vp = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();
  const items = tc.items.map(it => ({ x: it.transform[4], y: vp.height - it.transform[5], text: (it.str || '').trim() })).filter(it => it.text);
  items.sort((a, b) => a.y - b.y || a.x - b.x);
  const bands = [];
  for (const it of items) {
    const b = bands.find(b => Math.abs(b.y - it.y) < ROW_TOLERANCE);
    if (b) b.items.push(it); else bands.push({ y: it.y, items: [it] });
  }
  let current = null;
  for (const band of bands) {
    const hasFlat = band.items.some(it => it.x < 108 && FLAT_REGEX.test(it.text));
    if (hasFlat) { if (current) allRecords.push(current); current = [...band.items]; }
    else if (current) current.push(...band.items);
  }
  if (current) allRecords.push(current);
}
const rows = allRecords.map(items => {
  const row = { flatNumber:'',name:'',mobile:'',ownerOrResident:'',date:'',amount:'',cashReceiver:'',bankDetail:'',lateDays:'' };
  for (const col of COLUMN_BOUNDS) {
    const parts = items.filter(it => it.x >= col.min && it.x < col.max).sort((a,b) => a.y - b.y || a.x - b.x).map(it => it.text);
    row[col.key] = parts.join(' ').replace(/\s+/g, ' ').trim();
  }
  row.flatNumber = row.flatNumber.toUpperCase().replace(/\s+/g,' ');
  if (!row.lateDays) row.lateDays = '0';
  return row;
}).filter(r => r.flatNumber && /^(?:[A-Z]-?\d|SHOP)/i.test(r.flatNumber) && !/TOTAL|COUNT/i.test(r.flatNumber));

console.log('Total records:', rows.length);
console.log('\nFirst 6:');
rows.slice(0,6).forEach(r => console.log(JSON.stringify(r)));
console.log('\nSpot checks:');
['A-203','A-702','SHOP 1','SHOP 5','SHOP 9','B-102','B-1304','A-1304'].forEach(f => {
  const r = rows.find(x => x.flatNumber === f);
  if (r) console.log(f, '→', JSON.stringify(r));
});
