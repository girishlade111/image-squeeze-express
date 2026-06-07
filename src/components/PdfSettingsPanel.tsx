import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Info,
  ImageIcon,
  FileType2,
  Hash,
  BookOpen,
  EyeOff,
  Lightbulb,
  Settings2,
  Crop,
} from 'lucide-react';
import {
  Rocket,
  Lightning,
  CheckCircle,
  Sparkle,
  CircleNotch,
  WarningCircle,
} from '@phosphor-icons/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type {
  PdfProcessSettings,
  PdfQualityPreset,
} from '@/utils/pdfProcessor';
import { getPdfFilenameTokenDocs } from '@/utils/pdfProcessor';

interface PdfSettingsPanelProps {
  preset: PdfQualityPreset;
  onPresetChange: (preset: PdfQualityPreset) => void;
  quality: number;
  onQualityChange: (quality: number) => void;
  settings: PdfProcessSettings;
  onSettingsChange: (next: PdfProcessSettings) => void;
}

const presets: {
  id: PdfQualityPreset;
  name: string;
  desc: string;
  quality: number;
  icon: typeof Rocket;
}[] = [
  {
    id: 'low',
    name: 'Strong',
    desc: 'Smallest file — emails & sharing',
    quality: 0.4,
    icon: Rocket,
  },
  {
    id: 'medium',
    name: 'Balanced',
    desc: 'Recommended for most uses',
    quality: 0.6,
    icon: Lightning,
  },
  {
    id: 'high',
    name: 'Light',
    desc: 'Best quality — bigger file',
    quality: 0.82,
    icon: CheckCircle,
  },
];

function qualityLabel(q: number): { icon: typeof CheckCircle; text: string; color: string } {
  if (q >= 0.8) return { icon: CheckCircle, text: 'High quality', color: 'text-emerald-500' };
  if (q >= 0.55) return { icon: CircleNotch, text: 'Balanced', color: 'text-amber-500' };
  return { icon: WarningCircle, text: 'Strong compression', color: 'text-rose-500' };
}

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

const DPI_PRESETS: number[] = [72, 96, 150, 300];

function previewFilename(
  pattern: string,
  base: string,
  q: number,
  pages: number,
  sizeKB: number
): string {
  const replacements: Record<string, string> = {
    '{name}': base,
    '{ext}': 'pdf',
    '{format}': 'pdf',
    '{pages}': String(pages),
    '{size}': String(sizeKB),
    '{date}': new Date().toISOString().slice(0, 10),
    '{q}': String(Math.round(q * 100)),
    '{index}': '1',
  };
  let out = pattern;
  for (const [token, val] of Object.entries(replacements)) {
    out = out.split(token).join(val);
  }
  out = out
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .trim();
  if (!out) out = `${base}_compressed.pdf`;
  if (!out.toLowerCase().endsWith('.pdf')) out = `${out}.pdf`;
  if (out.length > 60) out = `${out.slice(0, 55)}…pdf`;
  return out;
}

const PdfSettingsPanel = ({
  preset,
  onPresetChange,
  quality,
  onQualityChange,
  settings,
  onSettingsChange,
}: PdfSettingsPanelProps) => {
  const hint = qualityLabel(quality);
  const [filenameDraft, setFilenameDraft] = useState(settings.filenamePattern);
  const [pageRangeFrom, setPageRangeFrom] = useState(
    String(settings.pageRange?.from ?? '')
  );
  const [pageRangeTo, setPageRangeTo] = useState(
    String(settings.pageRange?.to ?? '')
  );

  const update = (patch: Partial<PdfProcessSettings>) =>
    onSettingsChange({ ...settings, ...patch });

  const commitPageRange = () => {
    const fromNum = parseInt(pageRangeFrom, 10);
    const toNum = parseInt(pageRangeTo, 10);
    if (Number.isNaN(fromNum) && Number.isNaN(toNum)) {
      update({ pageRange: null });
    } else {
      const from = Number.isNaN(fromNum) ? 1 : fromNum;
      const to = Number.isNaN(toNum) ? from : toNum;
      update({ pageRange: { from, to } });
    }
  };

  const filenameTokens = getPdfFilenameTokenDocs();
  const previewName = previewFilename(
    filenameDraft || settings.filenamePattern,
    'document',
    quality,
    settings.pageRange ? settings.pageRange.to - settings.pageRange.from + 1 : 1,
    Math.max(1, Math.round(quality * 120))
  );

  return (
    <motion.div
      className="mx-auto mt-6 max-w-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-3 shadow-lg space-y-4 sm:p-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-semibold sm:text-xs">Compression Level</Label>
              <InfoTip>
                We re-render every page as a JPEG and rebuild the PDF — this is the
                fastest and most reliable way to shrink a PDF in the browser.
              </InfoTip>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {presets.map((p) => {
              const Icon = p.icon;
              const isActive = preset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    onPresetChange(p.id);
                    onQualityChange(p.quality);
                    update({ dpi: null });
                  }}
                  aria-pressed={isActive}
                  aria-label={`${p.name} compression preset`}
                  className={`flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-lg border p-3 text-center transition-all sm:min-h-0 sm:p-2.5 ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border/40 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <Icon className="h-5 w-5 sm:h-3.5 sm:w-3.5" aria-hidden />
                  <span className="text-sm font-semibold sm:text-[11px]">{p.name}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight sm:text-[9px]">
                    {p.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-semibold sm:text-xs">JPEG Quality</Label>
              <InfoTip>
                Lower = smaller file, more visible compression artefacts. 0.6 is a
                good default for documents.
              </InfoTip>
            </div>
            <span className="text-sm font-bold tabular-nums text-primary sm:text-xs">
              {Math.round(quality * 100)}%
            </span>
          </div>
          <Slider
            value={[Math.round(quality * 100)]}
            onValueChange={([v]) => {
              onQualityChange(v / 100);
              onPresetChange('custom');
            }}
            min={10}
            max={95}
            step={1}
            className="mt-2"
            aria-label="PDF JPEG quality"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground sm:mt-1.5 sm:text-[10px]">
            <span className="inline-flex items-center gap-1">
              <hint.icon size={12} weight="fill" className={hint.color} />
              {hint.text}
            </span>
            <span className="tabular-nums">
              JPEG @ {Math.round(quality * 100)}%
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/30 bg-background/30 p-3 sm:p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Settings2 className="h-4 w-4 text-primary sm:h-3.5 sm:w-3.5" />
              <Label className="text-sm font-semibold sm:text-xs">Advanced</Label>
            </div>
            <Badge
              variant="outline"
              className="rounded-full border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary sm:px-1.5 sm:py-0 sm:text-[9px]"
            >
              {[
                settings.dpi ? 'dpi' : null,
                settings.targetSizeKB ? 'target' : null,
                settings.grayscale ? 'b&w' : null,
                settings.stripMetadata ? 'strip' : null,
                settings.pageRange ? 'range' : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'default'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="rounded-lg border border-border/30 bg-card/40 p-3 sm:p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5 text-primary sm:h-3 sm:w-3" />
                  <span className="text-sm font-semibold sm:text-[11px]">DPI</span>
                  <InfoTip>Override the render scale. 72 ≈ screen, 150 ≈ print, 300 ≈ high-quality print.</InfoTip>
                </div>
                {settings.dpi ? (
                  <button
                    onClick={() => update({ dpi: null })}
                    className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground sm:text-[9px]"
                    aria-label="Clear DPI"
                  >
                    Auto
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {DPI_PRESETS.map((d) => (
                  <button
                    key={d}
                    onClick={() =>
                      update({
                        dpi: settings.dpi === d ? null : d,
                      })
                    }
                    aria-pressed={settings.dpi === d}
                    className={`min-h-[44px] rounded-md border px-1 py-1.5 text-sm font-semibold tabular-nums transition-all sm:min-h-0 sm:py-1 sm:text-[10px] ${
                      settings.dpi === d
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/40 hover:border-primary/30'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border/30 bg-card/40 p-3 sm:p-2.5">
              <div className="mb-1.5 flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5 text-primary sm:h-3 sm:w-3" />
                <span className="text-sm font-semibold sm:text-[11px]">Target size (KB)</span>
                <InfoTip>The engine iteratively reduces quality and DPI to fit this size.</InfoTip>
              </div>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={50}
                  max={50000}
                  step={10}
                  placeholder="auto"
                  value={settings.targetSizeKB ?? ''}
                  onChange={(e) => {
                    const v = e.target.value ? parseInt(e.target.value, 10) : null;
                    update({ targetSizeKB: v && v > 0 ? v : null });
                  }}
                  className="h-11 text-sm sm:h-7 sm:text-[11px]"
                  aria-label="Target size in KB"
                />
                {settings.targetSizeKB ? (
                  <button
                    onClick={() => update({ targetSizeKB: null })}
                    className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground sm:text-[9px]"
                    aria-label="Clear target size"
                  >
                    Auto
                  </button>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border border-border/30 bg-card/40 p-3 sm:p-2.5">
              <div className="mb-1.5 flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5 text-primary sm:h-3 sm:w-3" />
                <span className="text-sm font-semibold sm:text-[11px]">Grayscale</span>
                <InfoTip>Convert pages to B&W. Saves ~25% on color PDFs with no text loss.</InfoTip>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground sm:text-[10px]">B&W output</span>
                <Switch
                  checked={settings.grayscale}
                  onCheckedChange={(v) => update({ grayscale: v })}
                  aria-label="Grayscale"
                />
              </div>
            </div>

            <div className="rounded-lg border border-border/30 bg-card/40 p-3 sm:p-2.5">
              <div className="mb-1.5 flex items-center gap-1">
                <EyeOff className="h-3.5 w-3.5 text-primary sm:h-3 sm:w-3" />
                <span className="text-sm font-semibold sm:text-[11px]">Strip metadata</span>
                <InfoTip>Remove title, author, producer, and creator from the output.</InfoTip>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground sm:text-[10px]">Anonymize</span>
                <Switch
                  checked={settings.stripMetadata}
                  onCheckedChange={(v) => update({ stripMetadata: v })}
                  aria-label="Strip metadata"
                />
              </div>
            </div>

            <div className="rounded-lg border border-border/30 bg-card/40 p-3 sm:col-span-2 sm:p-2.5">
              <div className="mb-1.5 flex items-center gap-1">
                <Crop className="h-3.5 w-3.5 text-primary sm:h-3 sm:w-3" />
                <span className="text-sm font-semibold sm:text-[11px]">Page range</span>
                <InfoTip>Compress only specific pages. Leave empty to include all pages.</InfoTip>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  placeholder="From"
                  value={pageRangeFrom}
                  onChange={(e) => setPageRangeFrom(e.target.value)}
                  onBlur={commitPageRange}
                  className="h-11 w-24 text-sm sm:h-7 sm:w-20 sm:text-[11px]"
                  aria-label="Page range from"
                />
                <span className="text-xs text-muted-foreground sm:text-[10px]">to</span>
                <Input
                  type="number"
                  min={1}
                  placeholder="To"
                  value={pageRangeTo}
                  onChange={(e) => setPageRangeTo(e.target.value)}
                  onBlur={commitPageRange}
                  className="h-11 w-24 text-sm sm:h-7 sm:w-20 sm:text-[11px]"
                  aria-label="Page range to"
                />
                {settings.pageRange ? (
                  <button
                    onClick={() => {
                      setPageRangeFrom('');
                      setPageRangeTo('');
                      update({ pageRange: null });
                    }}
                    className="h-9 rounded-md border border-border/40 bg-background/40 px-3 text-xs text-muted-foreground hover:text-foreground sm:h-6 sm:px-2 sm:text-[10px]"
                    aria-label="Clear page range"
                  >
                    All
                  </button>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border border-border/30 bg-card/40 p-3 sm:col-span-2 sm:p-2.5">
              <div className="mb-1.5 flex items-center gap-1">
                <FileType2 className="h-3.5 w-3.5 text-primary sm:h-3 sm:w-3" />
                <span className="text-sm font-semibold sm:text-[11px]">Filename pattern</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="ml-auto inline-flex h-9 items-center gap-1 rounded-md border border-border/40 bg-background/40 px-3 text-xs font-semibold text-primary hover:border-primary/40 sm:h-6 sm:px-1.5 sm:py-0.5 sm:text-[10px]"
                      aria-label="Show filename tokens"
                    >
                      <BookOpen className="h-3 w-3 sm:h-2.5 sm:w-2.5" />
                      Tokens
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="max-h-72 w-72 overflow-auto p-2 text-xs"
                  >
                    <div className="mb-1.5 font-semibold uppercase tracking-wider text-muted-foreground">
                      Filename tokens
                    </div>
                    <div className="space-y-1.5">
                      {filenameTokens.map((t) => (
                        <button
                          key={t.token}
                          onClick={() =>
                            setFilenameDraft((prev) => `${prev}${t.token}`)
                          }
                          className="flex w-full items-start gap-2 rounded-md border border-border/30 bg-card/40 p-1.5 text-left hover:border-primary/40"
                        >
                          <code className="min-w-[60px] rounded bg-primary/10 px-1 py-0.5 font-mono text-[11px] font-bold text-primary sm:text-[10px]">
                            {t.token}
                          </code>
                          <span className="text-[11px] text-muted-foreground sm:text-[10px]">
                            {t.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                type="text"
                value={filenameDraft}
                onChange={(e) => setFilenameDraft(e.target.value)}
                onBlur={() => update({ filenamePattern: filenameDraft || '{name}_compressed.pdf' })}
                placeholder="{name}_compressed.pdf"
                className="h-11 font-mono text-sm sm:h-7 sm:text-[11px]"
                aria-label="Filename pattern"
              />
              <p className="mt-1.5 truncate font-mono text-[11px] text-muted-foreground sm:mt-1 sm:text-[10px]" title={previewName}>
                → {previewName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-secondary/50 px-3 py-3 text-xs text-muted-foreground sm:py-2.5 sm:text-[11px]">
          <Sparkle size={16} weight="duotone" className="mt-0.5 flex-shrink-0 text-primary sm:h-3.5 sm:w-3.5" />
          <p className="leading-snug">
            Compression happens entirely in your browser — files are never uploaded.
            Output PDFs contain re-rendered page images, so text becomes non-selectable.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PdfSettingsPanel;
