/**
 * The small frontmatter subset ARC's note and translation files use — no YAML
 * dependency in the bundle. A file starts with `---`, then one `key: value`
 * per line, then `---` and the Markdown body.
 *
 * Values:
 * - plain text to the end of the line (`origin: Tokyo, Japan · singer`)
 * - a string wrapped in double quotes (JSON escapes) or single quotes (`''`)
 * - an integer (`releaseYear: 2020`)
 * - an inline list (`titles: [Lemon, "感電, Kanden"]`)
 * - a block list: `key:` followed by indented `- item` lines
 * - a folded block: `key: >` followed by indented lines, joined with spaces
 *
 * Lines starting with `#` are comments. Anything else is an error, so a
 * mistyped note fails the tests instead of silently losing a field.
 */

export type FrontmatterValue = string | number | string[];

export interface ParsedDocument {
  data: Record<string, FrontmatterValue>;
  body: string;
}

export class FrontmatterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FrontmatterError';
  }
}

const KEY_LINE = /^([A-Za-z][\w-]*):(?:\s+(.*))?$/;

function unquote(raw: string): string {
  if (raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"')) {
    try {
      return JSON.parse(raw) as string;
    } catch {
      throw new FrontmatterError(`Invalid double-quoted string: ${raw}`);
    }
  }
  if (raw.length >= 2 && raw.startsWith("'") && raw.endsWith("'")) {
    return raw.slice(1, -1).replace(/''/g, "'");
  }
  return raw;
}

/** Splits `a, "b, c", 'd'` on commas outside quoted items. */
function splitInlineList(inner: string): string[] {
  const items: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < inner.length; i += 1) {
    const char = inner[i]!;
    if (quote) {
      current += char;
      if (char === '\\' && quote === '"' && i + 1 < inner.length) {
        current += inner[i + 1];
        i += 1;
      } else if (char === quote) {
        quote = null;
      }
    } else if ((char === '"' || char === "'") && current.trim() === '') {
      // Quotes open only at the start of an item, so "Prospekt's" stays plain.
      quote = char;
      current += char;
    } else if (char === ',') {
      items.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (quote) throw new FrontmatterError(`Unclosed quote in list: [${inner}]`);
  if (current.trim()) items.push(current.trim());
  return items.map(unquote);
}

function scalar(raw: string): FrontmatterValue {
  const value = raw.trim();
  if (value.startsWith('[') && value.endsWith(']')) return splitInlineList(value.slice(1, -1));
  if (/^-?\d+$/.test(value)) return Number(value);
  return unquote(value);
}

export function parseFrontmatter(source: string): ParsedDocument {
  const text = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!text.startsWith('---\n')) throw new FrontmatterError('The file must start with a "---" frontmatter line.');
  const end = text.indexOf('\n---', 3);
  if (end < 0) throw new FrontmatterError('The frontmatter is not closed with "---".');
  const afterFence = text.indexOf('\n', end + 1);
  const header = text.slice(4, end).split('\n');
  const body = afterFence < 0 ? '' : text.slice(afterFence + 1);

  const data: Record<string, FrontmatterValue> = {};
  for (let i = 0; i < header.length; i += 1) {
    const line = header[i]!;
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const match = KEY_LINE.exec(line);
    if (!match) throw new FrontmatterError(`Unexpected frontmatter line: ${line}`);
    const key = match[1]!;
    const rest = match[2]?.trim() ?? '';
    if (key in data) throw new FrontmatterError(`Duplicate frontmatter key: ${key}`);

    if (rest === '' || rest === '>') {
      // Block list or folded text: the following indented lines.
      const block: string[] = [];
      while (i + 1 < header.length && /^\s+\S/.test(header[i + 1]!)) {
        block.push(header[i + 1]!.trim());
        i += 1;
      }
      if (rest === '>') {
        data[key] = block.join(' ');
      } else if (block.length === 0) {
        throw new FrontmatterError(`"${key}" has no value.`);
      } else {
        data[key] = block.map((item) => {
          if (!item.startsWith('- ')) throw new FrontmatterError(`"${key}" list items must start with "- ": ${item}`);
          return unquote(item.slice(2).trim());
        });
      }
      continue;
    }
    data[key] = scalar(rest);
  }
  return { data, body: body.trim() };
}

/** Typed field readers for the loaders; they throw with the file name on a bad field. */
export class FieldReader {
  constructor(
    private readonly data: Record<string, FrontmatterValue>,
    private readonly file: string,
  ) {}

  private fail(message: string): never {
    throw new FrontmatterError(`${this.file}: ${message}`);
  }

  string(key: string): string {
    const value = this.optionalString(key);
    if (value === undefined) this.fail(`"${key}" is required.`);
    return value;
  }

  optionalString(key: string): string | undefined {
    const value = this.data[key];
    if (value === undefined) return undefined;
    if (typeof value === 'number') return String(value);
    if (typeof value !== 'string') this.fail(`"${key}" must be text.`);
    return value.trim() || undefined;
  }

  list(key: string): string[] {
    const value = this.optionalList(key);
    if (!value?.length) this.fail(`"${key}" must list at least one value.`);
    return value;
  }

  optionalList(key: string): string[] | undefined {
    const value = this.data[key];
    if (value === undefined) return undefined;
    if (!Array.isArray(value)) this.fail(`"${key}" must be a list.`);
    return value.map((item) => item.trim()).filter(Boolean);
  }

  optionalNumber(key: string): number | undefined {
    const value = this.data[key];
    if (value === undefined) return undefined;
    if (typeof value !== 'number') this.fail(`"${key}" must be a number.`);
    return value;
  }
}

/** `./notes/albums/stray-sheep.md` → `stray-sheep`. */
export function fileKey(path: string): string {
  return path.replace(/^.*\//, '').replace(/\.[^.]+$/, '');
}
