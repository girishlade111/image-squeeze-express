import { describe, it, expect } from 'vitest';
import {
  splitExtension,
  renameBase,
  buildRenamePlan,
  sanitizeFileName,
  type RenameRule,
} from '../utils/fileRenamer';

describe('fileRenamer', () => {
  describe('splitExtension', () => {
    it('splits simple file names', () => {
      expect(splitExtension('photo.JPG')).toEqual({ base: 'photo', ext: '.JPG' });
      expect(splitExtension('my.file.name.png')).toEqual({
        base: 'my.file.name',
        ext: '.png',
      });
    });

    it('returns empty extension for files with no dot', () => {
      expect(splitExtension('README')).toEqual({ base: 'README', ext: '' });
    });

    it('treats leading-dot hidden files as having no extension', () => {
      expect(splitExtension('.gitignore')).toEqual({ base: '.gitignore', ext: '' });
    });

    it('returns the whole name as the base for trailing-dot files', () => {
      // A file literally named "weird." has no extension. The whole name is
      // the base — re-attachment round-trips it losslessly.
      expect(splitExtension('weird.')).toEqual({ base: 'weird.', ext: '' });
    });
  });

  describe('replace rule', () => {
    it('replaces plain text case-sensitively by default', () => {
      const rule: RenameRule = {
        kind: 'replace',
        find: 'IMG',
        replace: 'image',
        mode: 'plain',
        caseSensitive: true,
      };
      expect(renameBase('IMG_2024', [rule], 0, 1)).toBe('image_2024');
      expect(renameBase('img_2024', [rule], 0, 1)).toBe('img_2024');
    });

    it('replaces plain text case-insensitively when configured', () => {
      const rule: RenameRule = {
        kind: 'replace',
        find: 'IMG',
        replace: 'image',
        mode: 'plain',
        caseSensitive: false,
      };
      expect(renameBase('img_2024', [rule], 0, 1)).toBe('image_2024');
      expect(renameBase('Img_2024', [rule], 0, 1)).toBe('image_2024');
    });

    it('replaces using regex with global flag', () => {
      const rule: RenameRule = {
        kind: 'replace',
        find: '\\d+',
        replace: '#',
        mode: 'regex',
        caseSensitive: true,
      };
      expect(renameBase('photo 2024 05 17', [rule], 0, 1)).toBe('photo # # #');
    });

    it('leaves the string alone when find is empty', () => {
      const rule: RenameRule = {
        kind: 'replace',
        find: '',
        replace: 'X',
        mode: 'plain',
        caseSensitive: true,
      };
      expect(renameBase('hello', [rule], 0, 1)).toBe('hello');
    });

    it('does not throw on invalid regex', () => {
      const rule: RenameRule = {
        kind: 'replace',
        find: '[unclosed',
        replace: 'X',
        mode: 'regex',
        caseSensitive: true,
      };
      expect(renameBase('hello', [rule], 0, 1)).toBe('hello');
    });
  });

  describe('prefix / suffix rules', () => {
    it('prepends text to the name', () => {
      const rule: RenameRule = { kind: 'prefix', text: 'IMG_' };
      expect(renameBase('photo', [rule], 0, 1)).toBe('IMG_photo');
    });

    it('appends text to the name', () => {
      const rule: RenameRule = { kind: 'suffix', text: '_final' };
      expect(renameBase('photo', [rule], 0, 1)).toBe('photo_final');
    });

    it('ignores empty prefix/suffix', () => {
      expect(
        renameBase('photo', [{ kind: 'prefix', text: '' }], 0, 1)
      ).toBe('photo');
      expect(
        renameBase('photo', [{ kind: 'suffix', text: '' }], 0, 1)
      ).toBe('photo');
    });
  });

  describe('numbering rule', () => {
    const rule: RenameRule = {
      kind: 'numbering',
      enabled: true,
      position: 'start',
      separator: '_',
      start: 1,
      pad: 0,
    };

    it('numbers from the start index', () => {
      expect(renameBase('photo', [rule], 0, 5)).toBe('1_photo');
      expect(renameBase('photo', [rule], 4, 5)).toBe('5_photo');
    });

    it('honors the start offset', () => {
      const r = { ...rule, start: 10 };
      expect(renameBase('photo', [r], 0, 1)).toBe('10_photo');
    });

    it('zero-pads when configured', () => {
      const r = { ...rule, pad: 3 };
      expect(renameBase('photo', [r], 0, 100)).toBe('001_photo');
      expect(renameBase('photo', [r], 9, 100)).toBe('010_photo');
    });

    it('appends to the end when position is "end"', () => {
      const r = { ...rule, position: 'end' as const };
      expect(renameBase('photo', [r], 0, 1)).toBe('photo_1');
    });

    it('no-ops when disabled', () => {
      const r = { ...rule, enabled: false };
      expect(renameBase('photo', [r], 0, 1)).toBe('photo');
    });
  });

  describe('case rule', () => {
    it('lowercases', () => {
      expect(renameBase('Hello World', [{ kind: 'case', mode: 'lower' }], 0, 1)).toBe(
        'hello world'
      );
    });
    it('uppercases', () => {
      expect(renameBase('Hello World', [{ kind: 'case', mode: 'upper' }], 0, 1)).toBe(
        'HELLO WORLD'
      );
    });
    it('title-cases', () => {
      expect(renameBase('hello WORLD', [{ kind: 'case', mode: 'title' }], 0, 1)).toBe(
        'Hello World'
      );
    });
    it('sentence-cases', () => {
      expect(renameBase('hello WORLD', [{ kind: 'case', mode: 'sentence' }], 0, 1)).toBe(
        'Hello world'
      );
    });
  });

  describe('whitespace rule', () => {
    it('replaces spaces with dashes', () => {
      expect(
        renameBase('hello world', [{ kind: 'whitespace', mode: 'dash' }], 0, 1)
      ).toBe('hello-world');
    });
    it('replaces spaces with underscores', () => {
      expect(
        renameBase('hello world', [{ kind: 'whitespace', mode: 'underscore' }], 0, 1)
      ).toBe('hello_world');
    });
    it('removes spaces', () => {
      expect(
        renameBase('hello world', [{ kind: 'whitespace', mode: 'remove' }], 0, 1)
      ).toBe('helloworld');
    });
    it('collapses multiple spaces', () => {
      expect(
        renameBase('a   b', [{ kind: 'whitespace', mode: 'remove' }], 0, 1)
      ).toBe('ab');
    });
  });

  describe('removeChars rule', () => {
    it('strips a set of characters', () => {
      expect(
        renameBase('hello#world!', [{ kind: 'removeChars', chars: '#!' }], 0, 1)
      ).toBe('helloworld');
    });
    it('is a no-op for empty char set', () => {
      expect(
        renameBase('hello', [{ kind: 'removeChars', chars: '' }], 0, 1)
      ).toBe('hello');
    });
  });

  describe('date rule', () => {
    // 2024-05-17 14:23:15 in local time
    const TS = new Date(2024, 4, 17, 14, 23, 15).getTime();

    it('formats the file mtime as YYYY-MM-DD', () => {
      const rule: RenameRule = {
        kind: 'date',
        format: 'YYYY-MM-DD',
        position: 'prefix',
        separator: '_',
        useCurrent: false,
      };
      expect(renameBase('photo', [rule], 0, 1, { lastModified: TS })).toBe(
        '2024-05-17_photo'
      );
    });

    it('formats with the YYYYMMDD token', () => {
      const rule: RenameRule = {
        kind: 'date',
        format: 'YYYYMMDD',
        position: 'suffix',
        separator: '-',
        useCurrent: false,
      };
      expect(renameBase('photo', [rule], 0, 1, { lastModified: TS })).toBe(
        'photo-20240517'
      );
    });

    it('uses the current date when useCurrent=true', () => {
      const before = new Date();
      const rule: RenameRule = {
        kind: 'date',
        format: 'YYYY-MM-DD',
        position: 'prefix',
        separator: '_',
        useCurrent: true,
      };
      const result = renameBase('photo', [rule], 0, 1, { lastModified: TS });
      const after = new Date();
      const stamp = result.split('_')[0];
      // The stamp must be a real YYYY-MM-DD that lies between before and after.
      expect(stamp).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const stampMs = new Date(stamp).getTime();
      expect(stampMs).toBeGreaterThanOrEqual(
        new Date(before.getFullYear(), before.getMonth(), before.getDate()).getTime()
      );
      expect(stampMs).toBeLessThanOrEqual(
        new Date(after.getFullYear(), after.getMonth(), after.getDate()).getTime()
      );
    });

    it('falls back to now() when no lastModified is provided', () => {
      const rule: RenameRule = {
        kind: 'date',
        format: 'YYYYMMDD',
        position: 'prefix',
        separator: '_',
        useCurrent: false,
      };
      const result = renameBase('photo', [rule], 0, 1);
      expect(result).toMatch(/^\d{8}_photo$/);
    });
  });

  describe('insertAt rule', () => {
    it('inserts at the start when index=0', () => {
      expect(
        renameBase('photo', [{ kind: 'insertAt', index: 0, text: 'IMG_' }], 0, 1)
      ).toBe('IMG_photo');
    });
    it('inserts in the middle', () => {
      expect(
        renameBase('photo', [{ kind: 'insertAt', index: 2, text: 'XX' }], 0, 1)
      ).toBe('phXXoto');
    });
    it('inserts at the end when index=length', () => {
      expect(
        renameBase('photo', [{ kind: 'insertAt', index: 5, text: '_v2' }], 0, 1)
      ).toBe('photo_v2');
    });
    it('clamps a too-large index to the end', () => {
      expect(
        renameBase('photo', [{ kind: 'insertAt', index: 99, text: '!' }], 0, 1)
      ).toBe('photo!');
    });
    it('supports negative indices (counted from the end)', () => {
      expect(
        renameBase('photo', [{ kind: 'insertAt', index: -1, text: 'X' }], 0, 1)
      ).toBe('photoX');
      expect(
        renameBase('photo', [{ kind: 'insertAt', index: -3, text: 'X' }], 0, 1)
      ).toBe('phXoto');
    });
    it('is a no-op for empty text', () => {
      expect(
        renameBase('photo', [{ kind: 'insertAt', index: 2, text: '' }], 0, 1)
      ).toBe('photo');
    });
  });

  describe('trim rule', () => {
    it('trims N characters from the start', () => {
      expect(
        renameBase('hello world', [{ kind: 'trim', mode: 'start', count: 6, maxLength: 50, ellipsis: true }], 0, 1)
      ).toBe('world');
    });
    it('trims N characters from the end', () => {
      expect(
        renameBase('hello world', [{ kind: 'trim', mode: 'end', count: 6, maxLength: 50, ellipsis: true }], 0, 1)
      ).toBe('hello');
    });
    it('trims from both sides (split count)', () => {
      // count=2 → 1 from each side
      expect(
        renameBase('abcdef', [{ kind: 'trim', mode: 'both', count: 2, maxLength: 50, ellipsis: true }], 0, 1)
      ).toBe('bcde');
    });
    it('truncates to a max length', () => {
      expect(
        renameBase(
          'this is a long name',
          [{ kind: 'trim', mode: 'truncate', count: 0, maxLength: 10, ellipsis: false }],
          0,
          1
        )
      ).toBe('this is a ');
    });
    it('truncates with ellipsis', () => {
      expect(
        renameBase(
          'this is a long name',
          [{ kind: 'trim', mode: 'truncate', count: 0, maxLength: 10, ellipsis: true }],
          0,
          1
        )
      ).toBe('this is...');
    });
    it('leaves short strings untouched when truncating', () => {
      expect(
        renameBase(
          'short',
          [{ kind: 'trim', mode: 'truncate', count: 0, maxLength: 50, ellipsis: true }],
          0,
          1
        )
      ).toBe('short');
    });
  });

  describe('reverse rule', () => {
    it('reverses a string', () => {
      expect(renameBase('photo', [{ kind: 'reverse' }], 0, 1)).toBe('otpoh');
    });
    it('handles empty strings', () => {
      expect(renameBase('', [{ kind: 'reverse' }], 0, 1)).toBe('');
    });
    it('handles palindromes', () => {
      expect(renameBase('aba', [{ kind: 'reverse' }], 0, 1)).toBe('aba');
    });
  });

  describe('extractCounter rule', () => {
    it('extracts the first number from the original name', () => {
      const rule: RenameRule = {
        kind: 'extractCounter',
        where: 'first',
        position: 'end',
        separator: '_',
        pad: 0,
        fallbackStart: 1,
      };
      const original = 'photo12-v2';
      expect(renameBase(original, [rule], 0, 3, { originalBase: original })).toBe('photo12-v2_12');
      expect(renameBase(original, [rule], 1, 3, { originalBase: original })).toBe('photo12-v2_13');
    });

    it('extracts the last number from the original name', () => {
      const rule: RenameRule = {
        kind: 'extractCounter',
        where: 'last',
        position: 'start',
        separator: '_',
        pad: 0,
        fallbackStart: 1,
      };
      const original = 'photo12-v2';
      expect(renameBase(original, [rule], 0, 3, { originalBase: original })).toBe('2_photo12-v2');
      expect(renameBase(original, [rule], 2, 3, { originalBase: original })).toBe('4_photo12-v2');
    });

    it('zero-pads the new counter', () => {
      const rule: RenameRule = {
        kind: 'extractCounter',
        where: 'last',
        position: 'end',
        separator: '_',
        pad: 3,
        fallbackStart: 1,
      };
      const original = 'photo-v2';
      expect(renameBase(original, [rule], 0, 5, { originalBase: original })).toBe('photo-v2_002');
    });

    it('falls back to fallbackStart when the original has no number', () => {
      const rule: RenameRule = {
        kind: 'extractCounter',
        where: 'last',
        position: 'end',
        separator: '_',
        pad: 0,
        fallbackStart: 100,
      };
      const original = 'photo';
      expect(renameBase(original, [rule], 0, 1, { originalBase: original })).toBe('photo_100');
    });
  });

  describe('rule ordering', () => {
    it('applies rules in array order', () => {
      const rules: RenameRule[] = [
        { kind: 'prefix', text: 'A_' },
        { kind: 'suffix', text: '_Z' },
      ];
      expect(renameBase('photo', rules, 0, 1)).toBe('A_photo_Z');
    });

    it('combines multiple transforms coherently', () => {
      const rules: RenameRule[] = [
        { kind: 'replace', find: ' ', replace: '-', mode: 'plain', caseSensitive: true },
        { kind: 'case', mode: 'lower' },
        { kind: 'prefix', text: 'img-' },
        {
          kind: 'numbering',
          enabled: true,
          position: 'end',
          separator: '-',
          start: 1,
          pad: 2,
        },
      ];
      expect(renameBase('Hello World', rules, 0, 1)).toBe('img-hello-world-01');
    });
  });

  describe('buildRenamePlan', () => {
    it('returns the same name (with `changed: false`) when no rules apply', () => {
      const plan = buildRenamePlan({
        files: [{ id: '1', name: 'photo.jpg' }],
        rules: [],
      });
      expect(plan[0].renamedName).toBe('photo.jpg');
      expect(plan[0].changed).toBe(false);
    });

    it('preserves the file extension', () => {
      const plan = buildRenamePlan({
        files: [{ id: '1', name: 'My Photo.JPG' }],
        rules: [{ kind: 'case', mode: 'lower' }],
      });
      expect(plan[0].renamedName).toBe('my photo.JPG');
    });

    it('de-duplicates colliding names by appending (n)', () => {
      const plan = buildRenamePlan({
        files: [
          { id: '1', name: 'a.txt' },
          { id: '2', name: 'b.txt' },
        ],
        rules: [{ kind: 'replace', find: 'a', replace: 'X', mode: 'plain', caseSensitive: false }],
      });
      // First file becomes "X.txt" — second's 'b' is not 'a' so it stays
      // 'b.txt'. No collision here.
      expect(plan.map((p) => p.renamedName)).toEqual(['X.txt', 'b.txt']);

      // Now two files that *do* collide after the rule.
      const plan2 = buildRenamePlan({
        files: [
          { id: '1', name: 'A.txt' },
          { id: '2', name: 'a.txt' },
        ],
        rules: [{ kind: 'case', mode: 'upper' }],
      });
      // Base "A" -> "A", base "a" -> "A". Both become "A.txt" — extensions
      // are preserved untouched, so the dedup must compare on the full name.
      expect(plan2[0].renamedName).toBe('A.txt');
      expect(plan2[1].renamedName).toBe('A (2).txt');
    });

    it('indexes numbering from 0 with the configured start offset', () => {
      const plan = buildRenamePlan({
        files: [
          { id: '1', name: 'a.jpg' },
          { id: '2', name: 'b.jpg' },
          { id: '3', name: 'c.jpg' },
        ],
        rules: [
          {
            kind: 'numbering',
            enabled: true,
            position: 'start',
            separator: '-',
            start: 100,
            pad: 0,
          },
        ],
      });
      expect(plan.map((p) => p.renamedName)).toEqual([
        '100-a.jpg',
        '101-b.jpg',
        '102-c.jpg',
      ]);
    });
  });

  describe('sanitizeFileName', () => {
    it('strips characters that are illegal on Windows', () => {
      expect(sanitizeFileName('a<b>c:d"e/f\\g|h?i*j.txt')).toBe('a_b_c_d_e_f_g_h_i_j.txt');
    });
    it('strips control characters (replaced with underscore)', () => {
      // Control chars are illegal and are replaced with '_', not removed.
      // The trailing '_' before the extension survives the trim pass because
      // it is not at the very end of the string.
      expect(sanitizeFileName('bad\x00name\x1f.txt')).toBe('bad_name_.txt');
    });
    it('collapses runs of underscores', () => {
      expect(sanitizeFileName('a____b.txt')).toBe('a_b.txt');
    });
    it('trims leading/trailing dots and spaces', () => {
      expect(sanitizeFileName('  .hello.  ')).toBe('hello');
    });
    it('caps long names at 200 characters', () => {
      const long = 'a'.repeat(500) + '.txt';
      const result = sanitizeFileName(long);
      expect(result.length).toBe(200);
    });
    it('falls back to "untitled" when everything is stripped', () => {
      expect(sanitizeFileName('...___...')).toBe('untitled');
    });
  });
});
