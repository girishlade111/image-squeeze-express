/**
 * Pure rule engine for bulk file renaming. The engine operates on the *base
 * name* only — file extensions are preserved untouched by every base rule.
 * Extension-only rules (`replaceExt`) are applied separately to the extension
 * after all base rules have run.
 *
 * Rules are applied in the order they appear in the array. The numbering and
 * counter rules have access to the file's index in the queue and the total
 * count. The date rule has access to the file's lastModified timestamp.
 */

export type CaseMode = 'none' | 'lower' | 'upper' | 'title' | 'sentence';
export type ReplaceMode = 'plain' | 'regex';
export type WhitespaceMode = 'none' | 'dash' | 'underscore' | 'remove';
export type DateFormat =
  | 'YYYY-MM-DD'
  | 'YYYYMMDD'
  | 'YYYY-MM-DD_HHMMSS'
  | 'YYYY-MM-DD HHMM'
  | 'ISO'
  | 'DD-MM-YYYY'
  | 'MM-DD-YYYY';
export type TrimMode = 'start' | 'end' | 'both' | 'truncate';
export type ExtMode = 'set' | 'lower' | 'upper' | 'remove';
export type CounterWhere = 'first' | 'last';

export interface ReplaceRule {
  kind: 'replace';
  find: string;
  replace: string;
  mode: ReplaceMode;
  caseSensitive: boolean;
}

export interface AffixRule {
  kind: 'prefix' | 'suffix';
  text: string;
}

export interface NumberingRule {
  kind: 'numbering';
  enabled: boolean;
  position: 'start' | 'end';
  separator: string;
  start: number;
  pad: number;
}

export interface CaseRule {
  kind: 'case';
  mode: CaseMode;
}

export interface WhitespaceRule {
  kind: 'whitespace';
  mode: WhitespaceMode;
}

export interface RemoveCharsRule {
  kind: 'removeChars';
  chars: string;
}

export interface DateRule {
  kind: 'date';
  format: DateFormat;
  position: 'start' | 'end';
  separator: string;
  /** When true, the current date is used instead of the file's lastModified. */
  useCurrent: boolean;
}

export interface InsertAtRule {
  kind: 'insertAt';
  /** Character index. Negative values count from the end (-1 = before last char). */
  index: number;
  text: string;
}

export interface TrimRule {
  kind: 'trim';
  mode: TrimMode;
  /** Used by start / end / both — number of characters to strip. */
  count: number;
  /** Used by truncate — maximum total length. Takes precedence over `count`. */
  maxLength: number;
  /** Used by truncate — append "..." when the name is cut. */
  ellipsis: boolean;
}

export interface ReplaceExtRule {
  kind: 'replaceExt';
  mode: ExtMode;
  /** Required when mode is 'set'. Leading dot is optional. */
  extension?: string;
}

export interface ExtractCounterRule {
  kind: 'extractCounter';
  /** Which number in the *original* name to use as the starting value. */
  where: CounterWhere;
  /** Where in the *new* name to place the re-numbered value. */
  position: 'start' | 'end';
  separator: string;
  pad: number;
  /** Used when the original name contains no digits at all. */
  fallbackStart: number;
}

export interface ReverseRule {
  kind: 'reverse';
}

export type RenameRule =
  | ReplaceRule
  | AffixRule
  | NumberingRule
  | CaseRule
  | WhitespaceRule
  | RemoveCharsRule
  | DateRule
  | InsertAtRule
  | TrimRule
  | ReplaceExtRule
  | ExtractCounterRule
  | ReverseRule;

export const DEFAULT_RULES: RenameRule[] = [];

export interface RenamePlanEntry {
  id: string;
  originalName: string;
  renamedName: string;
  changed: boolean;
}

export interface BuildPlanInput {
  files: { id: string; name: string; lastModified?: number }[];
  rules: RenameRule[];
}

/** Optional metadata passed alongside the (base, rules, index, total) tuple. */
export interface RenameContext {
  /** The base name as it was on disk, before any rules ran. */
  originalBase?: string;
  /** The file's lastModified timestamp in ms, if known. */
  lastModified?: number;
}

/** Split "photo.JPG" → { base: "photo", ext: ".JPG" } */
export function splitExtension(name: string): { base: string; ext: string } {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) {
    return { base: name, ext: '' };
  }
  return { base: name.slice(0, dot), ext: name.slice(dot) };
}

function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function toSentenceCase(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function applyCase(s: string, mode: CaseMode): string {
  switch (mode) {
    case 'lower':
      return s.toLowerCase();
    case 'upper':
      return s.toUpperCase();
    case 'title':
      return toTitleCase(s);
    case 'sentence':
      return toSentenceCase(s);
    case 'none':
    default:
      return s;
  }
}

function applyWhitespace(s: string, mode: WhitespaceMode): string {
  switch (mode) {
    case 'dash':
      return s.replace(/\s+/g, '-');
    case 'underscore':
      return s.replace(/\s+/g, '_');
    case 'remove':
      return s.replace(/\s+/g, '');
    case 'none':
    default:
      return s;
  }
}

function applyReplace(
  s: string,
  find: string,
  replace: string,
  mode: ReplaceMode,
  caseSensitive: boolean
): string {
  if (find.length === 0) return s;
  if (mode === 'regex') {
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      return s.replace(new RegExp(find, flags), replace);
    } catch {
      // Invalid regex — leave unchanged
      return s;
    }
  }
  if (caseSensitive) {
    return s.split(find).join(replace);
  }
  const re = new RegExp(escapeRegExp(find), 'gi');
  return s.replace(re, replace);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyRemoveChars(s: string, chars: string): string {
  if (chars.length === 0) return s;
  // Escape regex meta-characters in the user-supplied character set
  const escaped = chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return s.replace(new RegExp(`[${escaped}]`, 'g'), '');
}

function applyNumbering(
  s: string,
  rule: NumberingRule,
  index: number,
  _total: number
): string {
  if (!rule.enabled) return s;
  const n = rule.start + index;
  const padded =
    rule.pad > 0 ? String(n).padStart(rule.pad, '0') : String(n);
  // The separator sits *between* the number and the name regardless of
  // position so the result reads as a natural delimiter, not a trailing
  // punctuation mark.
  return rule.position === 'start' ? `${padded}${rule.separator}${s}` : `${s}${rule.separator}${padded}`;
}

function formatDate(d: Date, format: DateFormat): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  switch (format) {
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
    case 'YYYYMMDD':
      return `${yyyy}${mm}${dd}`;
    case 'YYYY-MM-DD_HHMMSS':
      return `${yyyy}-${mm}-${dd}_${hh}${mi}${ss}`;
    case 'YYYY-MM-DD HHMM':
      return `${yyyy}-${mm}-${dd} ${hh}${mi}`;
    case 'ISO':
      return d.toISOString();
    case 'DD-MM-YYYY':
      return `${dd}-${mm}-${yyyy}`;
    case 'MM-DD-YYYY':
      return `${mm}-${dd}-${yyyy}`;
    default:
      return `${yyyy}-${mm}-${dd}`;
  }
}

function applyDate(rule: DateRule, lastModified: number | undefined): string {
  const d =
    rule.useCurrent || lastModified == null ? new Date() : new Date(lastModified);
  return formatDate(d, rule.format);
}

function applyInsertAt(s: string, rule: InsertAtRule): string {
  if (rule.text.length === 0) return s;
  const len = s.length;
  let idx = rule.index;
  // Negative indices count from the end: -1 = append at the end, -2 =
  // insert before the last char, etc. We add 1 so that -1 maps to `len`.
  if (idx < 0) idx = Math.max(0, len + idx + 1);
  if (idx > len) idx = len;
  return s.slice(0, idx) + rule.text + s.slice(idx);
}

function applyTrim(s: string, rule: TrimRule): string {
  const n = Math.max(0, Math.floor(rule.count));
  switch (rule.mode) {
    case 'start':
      return s.slice(Math.min(n, s.length));
    case 'end':
      return s.slice(0, Math.max(0, s.length - n));
    case 'both': {
      const half = Math.floor(n / 2);
      const startRem = Math.min(half, s.length);
      const endRem = Math.min(n - half, Math.max(0, s.length - startRem));
      return s.slice(startRem, s.length - endRem);
    }
    case 'truncate': {
      const max =
        rule.maxLength != null
          ? Math.max(0, Math.floor(rule.maxLength))
          : n;
      if (s.length <= max) return s;
      if (rule.ellipsis && max > 3) return `${s.slice(0, max - 3)}...`;
      return s.slice(0, max);
    }
    default:
      return s;
  }
}

function applyExtractCounter(
  rule: ExtractCounterRule,
  originalBase: string,
  index: number
): string {
  const matches = originalBase.match(/\d+/g);
  let startVal = rule.fallbackStart;
  if (matches && matches.length > 0) {
    const chosen =
      rule.where === 'first' ? matches[0] : matches[matches.length - 1];
    const parsed = parseInt(chosen, 10);
    if (Number.isFinite(parsed)) startVal = parsed;
  }
  const n = startVal + index;
  const padded = rule.pad > 0 ? String(n).padStart(rule.pad, '0') : String(n);
  return rule.position === 'start'
    ? `${padded}${rule.separator}`
    : `${rule.separator}${padded}`;
}

function applyReverse(s: string): string {
  return s.split('').reverse().join('');
}

function applyExtRules(ext: string, rules: ReplaceExtRule[]): string {
  let out = ext;
  for (const rule of rules) {
    switch (rule.mode) {
      case 'lower':
        out = out.toLowerCase();
        break;
      case 'upper':
        out = out.toUpperCase();
        break;
      case 'set': {
        if (!rule.extension) break;
        let e = rule.extension.trim();
        if (e.length === 0) break;
        if (!e.startsWith('.')) e = `.${e}`;
        out = e;
        break;
      }
      case 'remove':
        out = '';
        break;
    }
  }
  return out;
}

/**
 * Applies the rules in order to a single base name. The caller is responsible
 * for stripping the extension first and re-attaching it after. The optional
 * `context` carries metadata (original base, lastModified) used by date and
 * counter rules — pass it from `buildRenamePlan` for production use.
 */
export function renameBase(
  base: string,
  rules: RenameRule[],
  index: number,
  total: number,
  context: RenameContext = {}
): string {
  let out = base;
  const originalBase = context.originalBase ?? base;
  const lastModified = context.lastModified;

  for (const rule of rules) {
    switch (rule.kind) {
      case 'replace':
        out = applyReplace(out, rule.find, rule.replace, rule.mode, rule.caseSensitive);
        break;
      case 'prefix':
        if (rule.text) out = `${rule.text}${out}`;
        break;
      case 'suffix':
        if (rule.text) out = `${out}${rule.text}`;
        break;
      case 'numbering':
        out = applyNumbering(out, rule, index, total);
        break;
      case 'case':
        out = applyCase(out, rule.mode);
        break;
      case 'whitespace':
        out = applyWhitespace(out, rule.mode);
        break;
      case 'removeChars':
        out = applyRemoveChars(out, rule.chars);
        break;
      case 'date': {
        const stamp = applyDate(rule, lastModified);
        out =
          rule.position === 'start'
            ? `${stamp}${rule.separator}${out}`
            : `${out}${rule.separator}${stamp}`;
        break;
      }
      case 'insertAt':
        out = applyInsertAt(out, rule);
        break;
      case 'trim':
        out = applyTrim(out, rule);
        break;
      case 'extractCounter': {
        const counter = applyExtractCounter(rule, originalBase, index);
        out =
          rule.position === 'start' ? `${counter}${out}` : `${out}${counter}`;
        break;
      }
      case 'reverse':
        out = applyReverse(out);
        break;
      case 'replaceExt':
        // Extension rules are applied separately — skip here.
        break;
    }
  }

  return out;
}

/**
 * Builds a complete preview of the rename plan: each file's new name plus a
 * `changed` flag. Names are de-duplicated by appending " (n)" to handle the
 * common case where two files would otherwise collide (e.g. when find/replace
 * collapses them).
 */
export function buildRenamePlan({ files, rules }: BuildPlanInput): RenamePlanEntry[] {
  // Split the rule list once so base- and ext-only rules run in their own
  // pass. Both lists preserve the user's original ordering.
  const baseRules = rules.filter((r) => r.kind !== 'replaceExt');
  const extRules = rules.filter(
    (r): r is ReplaceExtRule => r.kind === 'replaceExt'
  );

  const total = files.length;
  const seen = new Map<string, number>();
  const entries: RenamePlanEntry[] = [];

  files.forEach((f, i) => {
    const split = splitExtension(f.name);
    const newBase = renameBase(split.base, baseRules, i, total, {
      originalBase: split.base,
      lastModified: f.lastModified,
    });
    const newExt = applyExtRules(split.ext, extRules);
    let candidate = `${newBase}${newExt}`;

    // De-duplicate to avoid silent file overwrites inside the ZIP. The
    // check runs on the *generated* name regardless of whether it changed,
    // so two source files that both resolve to the same final name still
    // get unique entries.
    const key = candidate.toLowerCase();
    const count = seen.get(key) ?? 0;
    if (count > 0) {
      const { base: cBase, ext: cExt } = splitExtension(candidate);
      candidate = `${cBase} (${count + 1})${cExt}`;
    }
    seen.set(key, count + 1);

    entries.push({
      id: f.id,
      originalName: f.name,
      renamedName: candidate,
      changed: candidate !== f.name,
    });
  });

  return entries;
}

/**
 * Sanitises a name so it is safe to use as a file name on every common OS
 * (Windows, macOS, Linux). Strips control chars, reserved characters, and
 * trims leading/trailing whitespace and dots. Used as a final safety net so
 * we never produce a path that an OS would reject.
 */
export function sanitizeFileName(name: string): string {
  // Remove characters that are illegal on Windows/macOS/Linux
  // eslint-disable-next-line no-control-regex
  let clean = name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
  // Collapse runs of underscores
  clean = clean.replace(/_+/g, '_');
  // Trim whitespace and dots from the ends
  clean = clean.replace(/^[.\s_]+|[.\s_]+$/g, '');
  // Cap length at 200 characters (OS-agnostic safe limit)
  if (clean.length > 200) clean = clean.slice(0, 200);
  return clean || 'untitled';
}
