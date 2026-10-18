/** Tiny helpers for email-safe, inline-styled HTML (email clients ignore <style> and classes). */
export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const C = {
  ink: '#0B0B0B',
  mist: '#F5F7F5',
  line: '#E4E8E4',
  muted: '#6B6F6B',
  mint: '#B8F2C4',
  deep: '#1F7A3A',
};

export function layout({
  storeName,
  preheader,
  heading,
  body,
  footer,
}: {
  storeName: string;
  preheader: string;
  heading: string;
  body: string;
  footer: string;
}) {
  return `<!doctype html><html><body style="margin:0;background:${C.mist};font-family:Inter,Arial,Helvetica,sans-serif;color:${C.ink}">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.mist};padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden">
<tr><td style="background:${C.ink};padding:20px 28px;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;text-transform:uppercase">${esc(storeName)}<span style="color:${C.mint}">.</span></td></tr>
<tr><td style="padding:32px 28px 8px"><h1 style="margin:0 0 12px;font-size:24px;line-height:1.2;text-transform:uppercase;letter-spacing:-0.5px">${esc(heading)}</h1>${body}</td></tr>
<tr><td style="padding:24px 28px;border-top:1px solid ${C.line};font-size:12px;color:${C.muted};line-height:1.6">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

export const p = (html: string) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.6">${html}</p>`;
export const muted = (html: string) =>
  `<p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:${C.muted}">${html}</p>`;
export const badge = (text: string) =>
  `<span style="display:inline-block;background:${C.mint};color:${C.ink};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 10px;border-radius:4px">${esc(text)}</span>`;
export const button = (label: string, href: string) =>
  `<p style="margin:24px 0"><a href="${esc(href)}" style="display:inline-block;background:${C.ink};color:#fff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:14px 22px;border-radius:4px">${esc(label)}</a></p>`;

export function table(rows: [string, string][], opts: { boldLast?: boolean } = {}) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;font-size:14px">${rows
    .map(([k, v], i) => {
      const last = opts.boldLast && i === rows.length - 1;
      const s = last
        ? `font-weight:700;font-size:16px;border-top:2px solid ${C.ink};padding-top:10px`
        : `color:${C.ink}`;
      return `<tr><td style="padding:6px 0;${s}">${k}</td><td align="right" style="padding:6px 0;${s}">${v}</td></tr>`;
    })
    .join('')}</table>`;
}

export function section(title: string, html: string) {
  return `<h2 style="margin:24px 0 8px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted}">${esc(title)}</h2>${html}`;
}
