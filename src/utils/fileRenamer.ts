/**
 * Pure rule engine for bulk file renaming. The engine operates on the *base
 * name* only — file extensions are always preserved untouched.
 *
 * Rules are applied in the order they appear in the array. The numbering rule
 * has access to the file's index in the queue and the total count.
 */

export type CaseMode = 'none' | 'lower' | 'upper' | 'title' | 'sentence';
export type ReplaceMode = 'plain' | 'regex';
export type WhitespaceMode = 'none' | 'dash' | 'underscore' | 'remove';

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
  /** Position relative to the (already-affixed) base name. */
  position: 'start' | 'end';
  /** Separator between the number and the name, e.g. "_" or "-". */
  separator: string;
  /** Starting integer. */
  start: number;
  /** Zero-pad width — 0 means no padding. */
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

export type RenameRule =
  | ReplaceRule
  | AffixRule
  | NumberingRule
  | CaseRule
  | WhitespaceRule
  | RemoveCharsRule;

export const DEFAULT_RULES: RenameRule[] = [];

export interface RenamePlanEntry {
  id: string;
  originalName: string;
  renamedName: string;
  changed: boolean;
}

export interface BuildPlanInput {
  files: { id: string; name: string }[];
  rules: RenameRule[];
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
  total: number
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

/**
 * Applies the rules in order to a single base name. The caller is responsible
 * for stripping the extension first and re-attaching it after.
 */
export function renameBase(
  base: string,
  rules: RenameRule[],
  index: number,
  total: number
): string {
  let out = base;

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
  const total = files.length;
  const seen = new Map<string, number>();
  const entries: RenamePlanEntry[] = [];

  files.forEach((f, i) => {
    const { base, ext } = splitExtension(f.name);
    const newBase = renameBase(base, rules, i, total);
    let candidate = `${newBase}${ext}`;

    // De-duplicate to avoid silent file overwrites inside the ZIP
    if (candidate !== f.name) {
      const key = candidate.toLowerCase();
      const count = seen.get(key) ?? 0;
      if (count > 0) {
        const { base: cBase, ext: cExt } = splitExtension(candidate);
        candidate = `${cBase} (${count + 1})${cExt}`;
      }
      seen.set(key, count + 1);
    }

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
