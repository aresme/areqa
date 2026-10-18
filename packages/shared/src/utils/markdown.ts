/**
 * Tiny, safe Markdown subset for owner-edited content (policy pages, FAQ answers,
 * product descriptions). Produces a plain data tree — no HTML strings, so nothing
 * can be injected. Supported: ## / ### headings, paragraphs, - and 1. lists,
 * **bold**, *italic*, [text](url).
 */
export type Inline =
  | { type: 'text'; text: string }
  | { type: 'bold'; children: Inline[] }
  | { type: 'italic'; children: Inline[] }
  | { type: 'link'; href: string; children: Inline[] };

export type Block =
  | { type: 'heading'; level: 2 | 3; children: Inline[] }
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] };

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push({ type: 'text', text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ type: 'bold', children: parseInline(m[1]) });
    else if (m[2] !== undefined) out.push({ type: 'italic', children: parseInline(m[2]) });
    else if (m[3] !== undefined && m[4] !== undefined) {
      if (SAFE_HREF.test(m[4])) out.push({ type: 'link', href: m[4], children: parseInline(m[3]) });
      else out.push({ type: 'text', text: m[3] });
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
  return out;
}

export function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (para.length) blocks.push({ type: 'paragraph', children: parseInline(para.join(' ')) });
    if (list)
      blocks.push({ type: 'list', ordered: list.ordered, items: list.items.map(parseInline) });
    para = [];
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    const heading = line.match(/^(#{2,3})\s+(.*)$/);
    const bullet = line.match(/^[-*]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (!line) {
      flush();
    } else if (heading) {
      flush();
      blocks.push({
        type: 'heading',
        level: heading[1]!.length as 2 | 3,
        children: parseInline(heading[2]!),
      });
    } else if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (para.length || (list && list.ordered !== ordered)) flush();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]!);
    } else if (list) {
      // Continuation line of the last list item.
      list.items[list.items.length - 1] += ` ${line}`;
    } else {
      para.push(line);
    }
  }
  flush();
  return blocks;
}

/** Plain text (for meta descriptions and previews). */
export function markdownToText(src: string): string {
  const inline = (n: Inline[]): string =>
    n.map((x) => (x.type === 'text' ? x.text : inline(x.children))).join('');
  return parseMarkdown(src)
    .map((b) => (b.type === 'list' ? b.items.map(inline).join(' ') : inline(b.children)))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
