import { describe, expect, it } from 'vitest';
import { markdownToText, parseInline, parseMarkdown } from './markdown';

describe('markdown subset', () => {
  it('parses headings, paragraphs and lists', () => {
    const blocks = parseMarkdown(
      'Intro line\ncontinues here.\n\n## Zones\n- **Nakuru:** KSh 150\n- Nairobi\n\n1. Order\n2. Pay',
    );
    expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'heading', 'list', 'list']);
    expect(blocks[2]).toMatchObject({
      type: 'list',
      ordered: false,
      items: [
        [{ type: 'bold' }, { type: 'text', text: ' KSh 150' }],
        [{ type: 'text', text: 'Nairobi' }],
      ],
    });
    expect(blocks[3]).toMatchObject({ ordered: true });
  });
  it('keeps only safe links', () => {
    expect(parseInline('[Track](/track)')[0]).toMatchObject({ type: 'link', href: '/track' });
    expect(parseInline('[x](javascript:alert(1))')[0]).toMatchObject({ type: 'text', text: 'x' });
    expect(parseInline('[x](//evil.com)')[0]).toMatchObject({ type: 'text' });
  });
  it('treats raw HTML as text', () => {
    expect(parseInline('<img src=x onerror=alert(1)>')).toEqual([
      { type: 'text', text: '<img src=x onerror=alert(1)>' },
    ]);
  });
  it('flattens to text', () =>
    expect(markdownToText('## Hi\nSee **our** [page](/x).')).toBe('Hi See our page.'));
});
