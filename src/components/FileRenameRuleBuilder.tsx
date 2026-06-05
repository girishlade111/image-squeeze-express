import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  Type,
  Hash,
  CaseSensitive,
  Space,
  Eraser,
  Info,
  RotateCcw,
  Pencil,
} from 'lucide-react';
import type {
  RenameRule,
  CaseMode,
  WhitespaceMode,
  ReplaceMode,
} from '@/utils/fileRenamer';

interface FileRenameRuleBuilderProps {
  rules: RenameRule[];
  onAdd: (rule: RenameRule) => void;
  onUpdate: (index: number, patch: Partial<RenameRule>) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onReset: () => void;
}

const addableRuleTypes: {
  kind: RenameRule['kind'];
  label: string;
  desc: string;
  icon: typeof Search;
  factory: () => RenameRule;
}[] = [
  {
    kind: 'replace',
    label: 'Find & Replace',
    desc: 'Replace text or regex in the name',
    icon: Search,
    factory: () => ({ kind: 'replace', find: '', replace: '', mode: 'plain', caseSensitive: true }),
  },
  {
    kind: 'prefix',
    label: 'Add Prefix',
    desc: 'Prepend text to the name',
    icon: Pencil,
    factory: () => ({ kind: 'prefix', text: '' }),
  },
  {
    kind: 'suffix',
    label: 'Add Suffix',
    desc: 'Append text before the extension',
    icon: Pencil,
    factory: () => ({ kind: 'suffix', text: '' }),
  },
  {
    kind: 'numbering',
    label: 'Numbering',
    desc: 'Add sequential numbers',
    icon: Hash,
    factory: () => ({
      kind: 'numbering',
      enabled: true,
      position: 'start',
      separator: '_',
      start: 1,
      pad: 0,
    }),
  },
  {
    kind: 'case',
    label: 'Change Case',
    desc: 'lower / UPPER / Title / Sentence',
    icon: CaseSensitive,
    factory: () => ({ kind: 'case', mode: 'lower' }),
  },
  {
    kind: 'whitespace',
    label: 'Whitespace',
    desc: 'Replace or remove spaces',
    icon: Space,
    factory: () => ({ kind: 'whitespace', mode: 'dash' }),
  },
  {
    kind: 'removeChars',
    label: 'Remove Chars',
    desc: 'Strip specific characters',
    icon: Eraser,
    factory: () => ({ kind: 'removeChars', chars: '' }),
  },
];

const InfoTip = ({ children }: { children: React.ReactNode }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Info
        className="h-3 w-3 cursor-help text-muted-foreground/70 transition-colors hover:text-muted-foreground"
        aria-hidden
      />
    </TooltipTrigger>
    <TooltipContent className="max-w-[220px] text-xs leading-relaxed">
      {children}
    </TooltipContent>
  </Tooltip>
);

const FileRenameRuleBuilder = ({
  rules,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
  onReset,
}: FileRenameRuleBuilderProps) => {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <motion.div
      className="mx-auto mt-6 max-w-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-semibold">Rename Rules</Label>
            <InfoTip>
              Rules are applied in the order shown. File extensions are never
              touched — only the base name is modified.
            </InfoTip>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={rules.length === 0}
              className="h-6 rounded-full px-2 text-[10px] text-muted-foreground hover:text-foreground"
              aria-label="Reset all rules"
            >
              <RotateCcw className="mr-1 h-2.5 w-2.5" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAdd((s) => !s)}
              className="h-6 rounded-full px-2.5 text-[10px]"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              }}
              aria-expanded={showAdd}
              aria-label="Add a new rule"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add rule
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {addableRuleTypes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.kind}
                      onClick={() => {
                        onAdd(t.factory());
                        setShowAdd(false);
                      }}
                      className="flex flex-col items-start gap-0.5 rounded-lg border border-border/40 bg-background/40 p-2 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-semibold">
                        <Icon className="h-3 w-3 text-primary" aria-hidden />
                        {t.label}
                      </div>
                      <span className="text-[9px] text-muted-foreground leading-tight">
                        {t.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {rules.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-dashed border-border/40 bg-secondary/20 p-4 text-center text-[11px] text-muted-foreground"
              >
                No rules yet. Add one above to start renaming — extensions are
                always preserved.
              </motion.div>
            )}

            {rules.map((rule, index) => (
              <motion.div
                key={`${rule.kind}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="rounded-xl border border-border/40 bg-background/40 p-2.5"
              >
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-[11px] font-semibold capitalize">
                    {rule.kind === 'removeChars'
                      ? 'Remove Chars'
                      : rule.kind === 'numbering'
                      ? 'Numbering'
                      : rule.kind}
                  </span>
                  <div className="ml-auto flex items-center gap-0.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onMove(index, -1)}
                          disabled={index === 0}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                          aria-label="Move rule up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Move up</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onMove(index, 1)}
                          disabled={index === rules.length - 1}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                          aria-label="Move rule down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Move down</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onRemove(index)}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                          aria-label="Remove rule"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Remove</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="mt-2">
                  <RuleEditor rule={rule} onChange={(patch) => onUpdate(index, patch)} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

function RuleEditor({
  rule,
  onChange,
}: {
  rule: RenameRule;
  onChange: (patch: Partial<RenameRule>) => void;
}) {
  if (rule.kind === 'replace') {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Input
            value={rule.find}
            onChange={(e) => onChange({ find: e.target.value })}
            placeholder="Find (text or /regex/)"
            className="h-7 text-[11px]"
            aria-label="Find text"
          />
          <Input
            value={rule.replace}
            onChange={(e) => onChange({ replace: e.target.value })}
            placeholder="Replace with"
            className="h-7 text-[11px]"
            aria-label="Replacement text"
          />
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <label className="flex items-center gap-1 text-muted-foreground">
            <input
              type="checkbox"
              checked={rule.mode === 'regex'}
              onChange={(e) => onChange({ mode: (e.target.checked ? 'regex' : 'plain') as ReplaceMode })}
              className="h-3 w-3 accent-[hsl(var(--primary))]"
            />
            Regex
          </label>
          <label className="flex items-center gap-1 text-muted-foreground">
            <input
              type="checkbox"
              checked={!rule.caseSensitive}
              onChange={(e) => onChange({ caseSensitive: !e.target.checked })}
              className="h-3 w-3 accent-[hsl(var(--primary))]"
            />
            Case-insensitive
          </label>
        </div>
      </div>
    );
  }

  if (rule.kind === 'prefix' || rule.kind === 'suffix') {
    return (
      <Input
        value={rule.text}
        onChange={(e) => onChange({ text: e.target.value } as Partial<RenameRule>)}
        placeholder={rule.kind === 'prefix' ? 'Text to prepend…' : 'Text to append…'}
        className="h-7 text-[11px]"
        aria-label={rule.kind === 'prefix' ? 'Prefix text' : 'Suffix text'}
      />
    );
  }

  if (rule.kind === 'numbering') {
    return (
      <div className="grid grid-cols-4 gap-1.5">
        <div>
          <label className="text-[9px] text-muted-foreground">Position</label>
          <select
            value={rule.position}
            onChange={(e) => onChange({ position: e.target.value as 'start' | 'end' })}
            className="h-7 w-full rounded-md border border-border/40 bg-background/40 px-1.5 text-[11px]"
            aria-label="Number position"
          >
            <option value="start">Start</option>
            <option value="end">End</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground">Separator</label>
          <Input
            value={rule.separator}
            onChange={(e) => onChange({ separator: e.target.value })}
            className="h-7 text-[11px]"
            aria-label="Separator"
          />
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground">Start</label>
          <Input
            type="number"
            value={rule.start}
            onChange={(e) => onChange({ start: Math.max(0, Number(e.target.value) || 0) })}
            className="h-7 text-[11px]"
            aria-label="Starting number"
          />
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground">Pad</label>
          <Input
            type="number"
            min={0}
            max={10}
            value={rule.pad}
            onChange={(e) =>
              onChange({ pad: Math.max(0, Math.min(10, Number(e.target.value) || 0)) })
            }
            className="h-7 text-[11px]"
            aria-label="Number padding"
          />
        </div>
      </div>
    );
  }

  if (rule.kind === 'case') {
    const cases: { value: CaseMode; label: string }[] = [
      { value: 'lower', label: 'lowercase' },
      { value: 'upper', label: 'UPPERCASE' },
      { value: 'title', label: 'Title Case' },
      { value: 'sentence', label: 'Sentence case' },
    ];
    return (
      <div className="grid grid-cols-4 gap-1">
        {cases.map((c) => (
          <button
            key={c.value}
            onClick={() => onChange({ mode: c.value } as Partial<RenameRule>)}
            aria-pressed={rule.mode === c.value}
            className={`rounded-md border px-1.5 py-1 text-[10px] font-semibold transition-all ${
              rule.mode === c.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/40 hover:border-primary/30'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    );
  }

  if (rule.kind === 'whitespace') {
    const modes: { value: WhitespaceMode; label: string }[] = [
      { value: 'dash', label: 'a-b' },
      { value: 'underscore', label: 'a_b' },
      { value: 'remove', label: 'ab' },
      { value: 'none', label: 'a b' },
    ];
    return (
      <div className="grid grid-cols-4 gap-1">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => onChange({ mode: m.value } as Partial<RenameRule>)}
            aria-pressed={rule.mode === m.value}
            className={`rounded-md border px-1.5 py-1 text-[10px] font-mono font-semibold transition-all ${
              rule.mode === m.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/40 hover:border-primary/30'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    );
  }

  if (rule.kind === 'removeChars') {
    return (
      <Input
        value={rule.chars}
        onChange={(e) => onChange({ chars: e.target.value } as Partial<RenameRule>)}
        placeholder="Characters to strip (e.g. #@!)"
        className="h-7 text-[11px]"
        aria-label="Characters to remove"
      />
    );
  }

  return null;
}

export default FileRenameRuleBuilder;
