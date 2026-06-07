import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Link2,
  Unlink2,
  Info,
  X,
  ImageIcon,
  Layers,
  FlipHorizontal,
  RotateCw,
  RotateCcw,
  FileText,
  Hash,
} from 'lucide-react';
import {
  InstagramLogo,
  Camera,
  LinkedinLogo,
  ChartBar,
  WhatsappLogo,
  ChatCircle,
  TwitterLogo,
  FacebookLogo,
  UsersThree,
  YoutubeLogo,
  PlayCircle,
  Monitor,
  Sparkle,
  Lightning,
  Star,
  CircleNotch,
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react';
import { Settings, QualityPreset, Rotation } from '@/hooks/useSettings';
import { isFormatSupported, getFilenameTokenDocs } from '@/utils/imageProcessor';

interface SettingsPanelProps {
  settings: Settings;
  files: { originalWidth: number; originalHeight: number }[];
  onUpdate: (partial: Partial<Settings>) => void;
  onResetResize: () => void;
  onSetWidth: (v: number | null, source?: { width: number; height: number } | null) => void;
  onSetHeight: (v: number | null, source?: { width: number; height: number } | null) => void;
  onApplyPreset: (preset: QualityPreset) => void;
  onResetAll: () => void;
}

const presets: { id: string; icon: typeof Camera; name: string; w: number; h: number }[] = [
  { id: 'ig-post', icon: InstagramLogo, name: 'IG Post', w: 1080, h: 1080 },
  { id: 'ig-story', icon: Camera, name: 'IG Story', w: 1080, h: 1920 },
  { id: 'li-post', icon: LinkedinLogo, name: 'LinkedIn', w: 1200, h: 627 },
  { id: 'li-banner', icon: ChartBar, name: 'LI Banner', w: 1584, h: 396 },
  { id: 'wa-dp', icon: WhatsappLogo, name: 'WhatsApp', w: 500, h: 500 },
  { id: 'tw-post', icon: TwitterLogo, name: 'Twitter', w: 1200, h: 675 },
  { id: 'fb-cover', icon: FacebookLogo, name: 'FB Cover', w: 820, h: 312 },
  { id: 'yt-thumb', icon: YoutubeLogo, name: 'YT Thumb', w: 1280, h: 720 },
  { id: 'fullhd', icon: Monitor, name: 'Full HD', w: 1920, h: 1080 },
];

const formats: {
  value: Settings['outputFormat'];
  label: string;
  desc: string;
  recommended?: boolean;
}[] = [
  { value: 'webp', label: 'WebP', desc: '~30% smaller than JPEG', recommended: true },
  { value: 'avif', label: 'AVIF', desc: '~50% smaller than JPEG' },
  { value: 'jpeg', label: 'JPEG', desc: 'Best for photos' },
  { value: 'png', label: 'PNG', desc: 'Lossless, supports transparency' },
  { value: 'original', label: 'Keep Original', desc: 'No format change' },
];

const qualityPresets: { value: QualityPreset; label: string; quality: number; desc: string }[] = [
  { value: 'max', label: 'Max', quality: 100, desc: 'Lossless' },
  { value: 'high', label: 'High', quality: 90, desc: 'Best quality' },
  { value: 'balanced', label: 'Balanced', quality: 75, desc: 'Recommended' },
  { value: 'compact', label: 'Compact', quality: 50, desc: 'Smallest file' },
];

const rotations: { value: Rotation; label: string }[] = [
  { value: 0, label: '0°' },
  { value: 90, label: '90°' },
  { value: 180, label: '180°' },
  { value: 270, label: '270°' },
];

function qualityHint(q: number) {
  if (q >= 90) return { icon: CheckCircle, text: 'High quality', color: 'text-emerald-500' };
  if (q >= 50) return { icon: CircleNotch, text: 'Balanced', color: 'text-amber-500' };
  return { icon: WarningCircle, text: 'Compact', color: 'text-rose-500' };
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

const SettingsPanel = ({
  settings,
  files,
  onUpdate,
  onResetResize,
  onSetWidth,
  onSetHeight,
  onApplyPreset,
  onResetAll,
}: SettingsPanelProps) => {
  const hint = qualityHint(settings.quality);

  // Use first file as the aspect-ratio source for the input handlers
  const firstFile = files[0];

  return (
    <motion.div
      className="mx-auto mt-6 max-w-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-3 shadow-lg metallic-rim metallic-surface sm:p-4">
        <Tabs defaultValue="compress">
          <div className="scrollbar-hide -mx-1 overflow-x-auto">
            <TabsList className="inline-flex h-11 w-max min-w-full rounded-xl bg-secondary/60 p-1 sm:h-9 sm:grid sm:w-full sm:grid-cols-4">
              <TabsTrigger
                value="compress"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <Sparkle size={12} weight="duotone" className="mr-1" />
                Compress
              </TabsTrigger>
              <TabsTrigger
                value="resize"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <ImageIcon className="mr-1 h-3 w-3" />
                Resize
              </TabsTrigger>
              <TabsTrigger
                value="convert"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <Layers className="mr-1 h-3 w-3" />
                Format
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <RotateCw className="mr-1 h-3 w-3" />
                More
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── COMPRESS ── */}
          <TabsContent value="compress" className="mt-4 space-y-4">
            {/* Quick quality presets */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm font-semibold sm:text-xs">Quick Preset</Label>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {qualityPresets.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => onApplyPreset(p.value)}
                    aria-pressed={settings.qualityPreset === p.value}
                    aria-label={`${p.label} quality preset`}
                    className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg border p-2 text-center transition-all ${
                      settings.qualityPreset === p.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/40 hover:border-primary/30 hover:bg-primary/5'
                    }`}
                  >
                    <span className="text-sm font-semibold sm:text-[11px]">{p.label}</span>
                    <span className="text-[11px] text-muted-foreground sm:text-[9px]">{p.quality}%</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality slider */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Label className="text-sm font-semibold sm:text-xs">Quality</Label>
                  <InfoTip>Higher = better quality, larger file. Lower = smaller file, slight quality loss.</InfoTip>
                </div>
                <span className="text-sm font-bold tabular-nums text-primary sm:text-xs">
                  {settings.lossless
                    ? 'Lossless'
                    : settings.autoOptimize
                    ? 'Auto'
                    : `${settings.quality}%`}
                </span>
              </div>
              <Slider
                value={[settings.quality]}
                onValueChange={([v]) => onUpdate({ quality: v, qualityPreset: 'custom' })}
                min={10}
                max={100}
                step={1}
                className="mt-2"
                disabled={settings.lossless}
                aria-label="Compression quality"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground sm:mt-1.5 sm:text-[10px]">
                <span className="inline-flex items-center gap-1">
                  {settings.lossless ? (
                    <>
                      <CheckCircle size={12} weight="fill" className="text-emerald-500" />
                      No quality loss
                    </>
                  ) : (
                    <>
                      <hint.icon size={12} weight="fill" className={hint.color} />
                      {hint.text}
                    </>
                  )}
                </span>
                <span className="tabular-nums">
                  {settings.lossless
                    ? '100% (lossless)'
                    : settings.autoOptimize
                    ? 'Auto-optimizing'
                    : `${settings.quality}%`}
                </span>
              </div>
            </div>

            {/* Auto optimize */}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 px-3 py-3 sm:py-2.5">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Sparkle size={16} weight="duotone" className="text-primary sm:h-3.5 sm:w-3.5" />
                <div className="min-w-0">
                  <Label className="text-sm font-semibold sm:text-xs">Auto Optimize</Label>
                  <p className="text-[11px] text-muted-foreground sm:text-[10px]">Picks best quality automatically</p>
                </div>
              </div>
              <Switch
                checked={settings.autoOptimize}
                onCheckedChange={(checked) =>
                  onUpdate({ autoOptimize: checked, qualityPreset: checked ? 'balanced' : 'custom' })
                }
                aria-label="Toggle auto optimize"
              />
            </div>

            {/* Target size */}
            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <Label className="text-sm font-semibold sm:text-xs">Target File Size (KB)</Label>
                <InfoTip>The engine will iteratively reduce quality until the output fits this size.</InfoTip>
              </div>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="e.g. 200 (optional)"
                min={1}
                value={settings.targetSizeKB ?? ''}
                onChange={(e) =>
                  onUpdate({
                    targetSizeKB: e.target.value ? Math.max(1, Number(e.target.value)) : null,
                    autoOptimize: e.target.value ? true : settings.autoOptimize,
                  })
                }
                className="h-11 rounded-lg sm:h-9"
                aria-label="Target file size in KB"
              />
            </div>

            {/* Lossless mode */}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 px-3 py-3 sm:py-2.5">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <FileText className="h-4 w-4 text-primary sm:h-3.5 sm:w-3.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <Label className="text-sm font-semibold sm:text-xs">Lossless</Label>
                    <InfoTip>
                      Skip quality reduction and encode without any quality loss. Only applies to WebP
                      and PNG output — JPEG and AVIF are always lossy.
                    </InfoTip>
                  </div>
                  <p className="text-[11px] text-muted-foreground sm:text-[10px]">
                    No quality loss · larger files
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.lossless}
                onCheckedChange={(checked) => onUpdate({ lossless: checked })}
                aria-label="Toggle lossless mode"
              />
            </div>

            {/* Filename pattern */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Label className="text-sm font-semibold sm:text-xs">Output Filename</Label>
                  <InfoTip>
                    Customize how renamed files are named. Tokens like{' '}
                    <code className="rounded bg-foreground/10 px-1 text-[11px]">{'{name}'}</code> are
                    replaced with the file's actual values.
                  </InfoTip>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-9 items-center gap-1 rounded-full border border-border/40 bg-background/40 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-6 sm:px-2 sm:text-[10px]"
                    >
                      <Hash className="h-3 w-3 sm:h-2.5 sm:w-2.5" />
                      Tokens
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="end">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Available tokens
                    </p>
                    <ul className="space-y-1.5 text-xs">
                      {getFilenameTokenDocs().map(({ token, description }) => (
                        <li key={token} className="flex items-start gap-2">
                          <code className="mt-0.5 inline-flex flex-shrink-0 rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary">
                            {token}
                          </code>
                          <span className="text-muted-foreground">{description}</span>
                        </li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                value={settings.filenamePattern}
                onChange={(e) => onUpdate({ filenamePattern: e.target.value })}
                placeholder="ls-image-compressor_{name}.{ext}"
                className="h-11 rounded-lg font-mono text-sm sm:h-9 sm:text-[11px]"
                aria-label="Output filename pattern"
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground sm:mt-1 sm:text-[10px]">
                e.g.{' '}
                <code className="rounded bg-foreground/10 px-1 text-[11px]">
                  {settings.filenamePattern.replace('{name}', 'photo').replace('{ext}', 'webp')}
                </code>
              </p>
            </div>
          </TabsContent>

          {/* ── RESIZE ── */}
          <TabsContent value="resize" className="mt-4 space-y-4">
            {/* Dimension inputs */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-xs font-semibold">Custom Dimensions</Label>
                {(settings.width || settings.height) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-2 text-[10px] text-muted-foreground hover:text-destructive"
                    onClick={onResetResize}
                    aria-label="Clear dimensions"
                  >
                    <X className="mr-0.5 h-2.5 w-2.5" /> Clear
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-0 flex-1 basis-[calc(50%-1rem)]">
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Auto"
                    min={1}
                    value={settings.width ?? ''}
                    onChange={(e) => {
                      const v = e.target.value ? Number(e.target.value) : null;
                      onSetWidth(v, firstFile);
                    }}
                    className="rounded-lg"
                    aria-label="Width in pixels"
                  />
                  <p className="mt-1 text-center text-[9px] text-muted-foreground">Width (px)</p>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onUpdate({ lockAspectRatio: !settings.lockAspectRatio })}
                      className={`mb-4 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        settings.lockAspectRatio
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                      aria-label={
                        settings.lockAspectRatio
                          ? 'Aspect ratio locked. Click to unlock.'
                          : 'Aspect ratio unlocked. Click to lock.'
                      }
                      aria-pressed={settings.lockAspectRatio}
                    >
                      {settings.lockAspectRatio ? (
                        <Link2 className="h-3.5 w-3.5" />
                      ) : (
                        <Unlink2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {settings.lockAspectRatio
                      ? 'Aspect ratio locked — height auto-calculates'
                      : 'Aspect ratio unlocked'}
                  </TooltipContent>
                </Tooltip>

                <div className="min-w-0 flex-1 basis-[calc(50%-1rem)]">
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Auto"
                    min={1}
                    value={settings.height ?? ''}
                    onChange={(e) => {
                      const v = e.target.value ? Number(e.target.value) : null;
                      onSetHeight(v, firstFile);
                    }}
                    className="rounded-lg"
                    aria-label="Height in pixels"
                  />
                  <p className="mt-1 text-center text-[9px] text-muted-foreground">Height (px)</p>
                </div>
              </div>
              {settings.lockAspectRatio && settings.width && settings.height && (
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                  Aspect ratio:{' '}
                  <span className="font-semibold text-foreground">
                    {(settings.width / settings.height).toFixed(2)}:1
                  </span>
                </p>
              )}
            </div>

            {/* Presets */}
            <div>
              <Label className="text-xs font-semibold">Social Media Presets</Label>
              <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {presets.map((p) => {
                  const PresetIcon = p.icon;
                  return (
                  <button
                    key={p.id}
                    onClick={() =>
                      onUpdate({ width: p.w, height: p.h, selectedPreset: p.id })
                    }
                    aria-label={`${p.name} preset: ${p.w} by ${p.h} pixels`}
                    aria-pressed={settings.selectedPreset === p.id}
                    className={`flex flex-col items-center gap-0.5 rounded-lg border p-2 text-center transition-all ${
                      settings.selectedPreset === p.id
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border/40 hover:border-primary/30 hover:bg-primary/5'
                    }`}
                  >
                    <PresetIcon size={18} weight="duotone" aria-hidden />
                    <span className="text-[10px] font-semibold">{p.name}</span>
                    <span className="text-[9px] text-muted-foreground">
                      {p.w}×{p.h}
                    </span>
                  </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ── CONVERT ── */}
          <TabsContent
            value="convert"
            className="mt-4 space-y-2"
            role="radiogroup"
            aria-label="Output format selection"
          >
            {formats.map((f) => {
              const formatMime = `image/${f.value}`;
              const supported = f.value === 'original' || f.value === 'png' || isFormatSupported(formatMime);
              const disabled = !supported;
              const button = (
                <button
                  key={f.value}
                  onClick={() => !disabled && onUpdate({ outputFormat: f.value })}
                  role="radio"
                  aria-checked={settings.outputFormat === f.value}
                  aria-disabled={disabled}
                  aria-label={`Output format: ${f.label}${disabled ? ' (not supported by your browser)' : ''}`}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    settings.outputFormat === f.value
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border/40 hover:border-primary/30 hover:bg-primary/5'
                  } ${disabled ? 'cursor-not-allowed opacity-50 hover:border-border/40 hover:bg-transparent' : ''}`}
                >
                  <div
                    className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      settings.outputFormat === f.value
                        ? 'border-primary'
                        : 'border-muted-foreground/40'
                    }`}
                  >
                    {settings.outputFormat === f.value && (
                      <motion.div
                        layoutId="formatDot"
                        className="h-2 w-2 rounded-full bg-primary"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{f.label}</span>
                      {f.recommended && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                          <Star size={9} weight="fill" />
                          Best
                        </span>
                      )}
                      {disabled && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                          🚫 Unsupported
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {disabled ? 'Not supported by your browser — try Chrome 85+ or Safari 16+.' : f.desc}
                    </p>
                  </div>
                </button>
              );
              return disabled ? (
                <Tooltip key={f.value}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent className="max-w-[220px] text-xs leading-relaxed">
                    {f.label} encoding is not available in this browser. Update to
                    the latest Chrome, Firefox, Edge, or Safari to enable it.
                  </TooltipContent>
                </Tooltip>
              ) : (
                button
              );
            })}
          </TabsContent>

          {/* ── ADVANCED ── */}
          <TabsContent value="advanced" className="mt-4 space-y-3">
            {/* Rotation */}
            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <Label className="text-xs font-semibold">Rotation</Label>
                <InfoTip>Rotates the image by the selected angle. Useful for portrait photos.</InfoTip>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {rotations.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => onUpdate({ rotation: r.value })}
                    aria-pressed={settings.rotation === r.value}
                    className={`rounded-lg border py-1.5 text-[11px] font-semibold transition-all ${
                      settings.rotation === r.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/40 text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <FlipHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <Label className="text-xs font-semibold">Mirror / Flip</Label>
                    <p className="text-[10px] text-muted-foreground">Flip horizontally</p>
                  </div>
                </div>
                <Switch
                  checked={settings.mirror}
                  onCheckedChange={(checked) => onUpdate({ mirror: checked })}
                  aria-label="Mirror image"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <Label className="text-xs font-semibold">Grayscale</Label>
                    <p className="text-[10px] text-muted-foreground">Convert to black & white</p>
                  </div>
                </div>
                <Switch
                  checked={settings.grayscale}
                  onCheckedChange={(checked) => onUpdate({ grayscale: checked })}
                  aria-label="Convert to grayscale"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <Label className="text-xs font-semibold">Strip EXIF Data</Label>
                    <InfoTip>Removes camera info, GPS, and other metadata. Recommended for privacy.</InfoTip>
                  </div>
                </div>
                <Switch
                  checked={settings.stripEXIF}
                  onCheckedChange={(checked) => onUpdate({ stripEXIF: checked })}
                  aria-label="Strip EXIF data"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Sparkle size={14} weight="duotone" className="text-muted-foreground" />
                  <div>
                    <Label className="text-xs font-semibold">Progressive JPEG</Label>
                    <p className="text-[10px] text-muted-foreground">Loads in passes (faster perceived load)</p>
                  </div>
                </div>
                <Switch
                  checked={settings.progressive}
                  onCheckedChange={(checked) => onUpdate({ progressive: checked })}
                  aria-label="Progressive JPEG"
                />
              </div>
            </div>

            {/* Reset all */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetAll}
              className="w-full rounded-xl text-[11px] text-muted-foreground hover:text-foreground"
              aria-label="Reset all settings to defaults"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset all settings
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default SettingsPanel;
