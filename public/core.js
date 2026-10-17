/* ponytail: One shared, dependency-free cue policy for extension, demo and Worker. */
globalThis.HoldMyPlaceCore = (() => {
  const clean = (s, n = 100) => String(s || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
  const sensitive = c => /bank|health|hospital|medical|patient|password|vault|wallet|checkout|payment|credit.card/i.test(`${c.url || ''} ${c.title || ''}`);
  const dangerous = c => /submit|pay|purchase|confirm|place.order|send|transfer/i.test(c.focused?.label || '');
  function nextField(c) {
    const fields = c.fields || [];
    const index = fields.findIndex(f => f.key === c.focused?.key);
    return fields.slice(Math.max(0, index)).find(f => f.required && !f.filled) || fields.find(f => f.required && !f.filled) || fields.find(f => !f.filled);
  }
  function fallback(c) {
    if (dangerous(c)) return 'Check whether this was already submitted before continuing.';
    if (c.note) return clean(c.note, 240).split(/\s+/).slice(0, 20).join(' ');
    const next = nextField(c);
    return next ? `You are on ${clean(c.title, 45)}; next, complete ${clean(next.label, 45)}.`.split(/\s+/).slice(0,20).join(' ') : 'Check your progress on this page before continuing; the next step is unclear.';
  }
  function payload(c) {
    return { title: clean(c.title), headings: (c.headings || []).slice(0, 8).map(x => clean(x)), fields: (c.fields || []).slice(0, 40).map(f => ({label:clean(f.label, 70), required:!!f.required, filled:!!f.filled})), focused: {label:clean(c.focused?.label,70)}, step:clean(c.step,60), note:clean(c.note,240) };
  }
  function validCue(value) { return typeof value === 'string' && value.trim().length > 0 && value.length <= 240 && value.trim().split(/\s+/).length <= 20 && !/[<>\r\n]|[.!?]\s+\S/.test(value); }
  return {clean, sensitive, dangerous, nextField, fallback, payload, validCue};
})();
