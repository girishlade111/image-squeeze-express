import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link2, Unlink2, Info, X } from 'lucide-react';
import { Settings } from '@/hooks/useSettings';

interface SettingsPanelProps {
  settings: Settings;
  onUpdate: (partial: Partial<Settings>) => void;
  onResetResize: () => void;
}

/* ─── Presets ─── */
const presets = [
  { id: 'ig-post', emoji: '📸', name: 'Instagram Post', w: 1080, h: 1080 },
  { id: 'ig-story', emoji: '📱', name: 'Instagram Story', w: 1080, h: 1920 },
  { id: 'li-post', emoji: '💼', name: 'LinkedIn Post', w: 1200, h: 627 },
  { id: 'li-banner', emoji: '💼', name: 'LinkedIn Banner', w: 1584, h: 396 },
  { id: 'wa-dp', emoji: '💬', name: 'WhatsApp DP', w: 500, h: 500 },
  { id: 'tw-post', emoji: '🐦', name: 'Twitter/X Post', w: 1200, h: 675 },
  { id: 'fb-cover', emoji: '📘', name: 'Facebook Cover', w: 820, h: 312 },
  { id: 'yt-thumb', emoji: '📺', name: 'YouTube Thumb', w: 1280, h: 720 },
  { id: 'fullhd', emoji: '🖥️', name: 'Full HD', w: 1920, h: 1080 },
];

/* ─── Format cards ─── */
const formats: { value: Settings['outputFormat']; label: string; desc: string; recommended?: boolean }[] = [
  { value: 'jpeg', label: 'JPEG', desc: 'Best for photos' },
  { value: 'png', label: 'PNG', desc: 'Best for transparency' },
  { value: 'webp', label: 'WebP ⭐', desc: '30% smaller than JPEG', recommended: true },
  { value: 'original', label: 'Keep Original', desc: 'No conversion' },
];

function qualityHint(q: number) {
  if (q >= 80) return { emoji: '🟢', text: 'High Quality — minimal size reduction' };
  if (q >= 50) return { emoji: '🟡', text: 'Balanced — great for web & social' };
  return { emoji: '🔴', text: 'Aggressive — maximum compression' };
}

const SettingsPanel = ({ settings, onUpdate, onResetResize }: SettingsPanelProps) => {
  const hint = qualityHint(settings.quality);

  const handleWidthChange = (val: string) => {
    const w = val ? Number(val) : null;
    if (settings.lockAspectRatio && w && settings.height && settings.width) {
      const ratio = settings.height / settings.width;
      onUpdate({ width: w, height: Math.round(w * ratio), selectedPreset: null });
    } else {
      onUpdate({ width: w, selectedPreset: null });
    }
  };

  const handleHeightChange = (val: string) => {
    const h = val ? Number(val) : null;
    if (settings.lockAspectRatio && h && settings.width && settings.height) {
      const ratio = settings.width / settings.height;
      onUpdate({ height: h, width: Math.round(h * ratio), selectedPreset: null });
    } else {
      onUpdate({ height: h, selectedPreset: null });
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 sm:p-6">
        <Tabs defaultValue="compress">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-secondary/80 p-1">
            <TabsTrigger value="compress" className="rounded-lg text-xs font-semibold sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Compress
            </TabsTrigger>
            <TabsTrigger value="resize" className="rounded-lg text-xs font-semibold sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Resize
            </TabsTrigger>
            <TabsTrigger value="convert" className="rounded-lg text-xs font-semibold sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Convert
            </TabsTrigger>
          </TabsList>

          {/* ── COMPRESS ── */}
          <TabsContent value="compress" className="mt-6 space-y-6">
            {/* Quality slider */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Compression Quality: {settings.quality}%
                </Label>
              </div>
              <Slider
                value={[settings.quality]}
                onValueChange={([v]) => {
                  if (!settings.autoOptimize) onUpdate({ quality: v });
                }}
                min={10}
                max={100}
                step={1}
                disabled={settings.autoOptimize}
                className="mt-3"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {hint.emoji} {hint.text}
              </p>
            </div>

            {/* Auto optimize */}
            <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
              <div>
                <Label className="text-sm font-medium">Auto Optimize for Web</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Locks quality to 75% for best web performance</p>
              </div>
              <Switch
                checked={settings.autoOptimize}
                onCheckedChange={(checked) => {
                  onUpdate({ autoOptimize: checked, quality: checked ? 75 : settings.quality });
                }}
              />
            </div>

            {/* Target size */}
            <div>
              <Label className="text-sm font-medium">Target Size (KB)</Label>
              <Input
                type="number"
                placeholder="e.g. 200"
                value={settings.targetSizeKB ?? ''}
                onChange={(e) =>
                  onUpdate({ targetSizeKB: e.target.value ? Number(e.target.value) : null })
                }
                className="mt-1.5 rounded-xl"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Leave blank to use quality slider
              </p>
            </div>
          </TabsContent>

          {/* ── RESIZE ── */}
          <TabsContent value="resize" className="mt-6 space-y-6">
            {/* Dimension inputs */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-sm font-medium">Width (px)</Label>
                <Input
                  type="number"
                  placeholder="Auto"
                  value={settings.width ?? ''}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="mt-1.5 rounded-xl"
                />
              </div>

              <button
                onClick={() => onUpdate({ lockAspectRatio: !settings.lockAspectRatio })}
                className={`mb-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                  settings.lockAspectRatio
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                }`}
                aria-label="Toggle aspect ratio lock"
              >
                {settings.lockAspectRatio ? (
                  <Link2 className="h-4 w-4" />
                ) : (
                  <Unlink2 className="h-4 w-4" />
                )}
              </button>

              <div className="flex-1">
                <Label className="text-sm font-medium">Height (px)</Label>
                <Input
                  type="number"
                  placeholder="Auto"
                  value={settings.height ?? ''}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="mt-1.5 rounded-xl"
                />
              </div>
            </div>

            {/* Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">Social Media Presets</p>
                {settings.selectedPreset && (
                  <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs text-muted-foreground" onClick={onResetResize}>
                    <X className="mr-1 h-3 w-3" /> Clear
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-1">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      onUpdate({ width: p.w, height: p.h, selectedPreset: p.id })
                    }
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all hover:bg-primary/5 ${
                      settings.selectedPreset === p.id
                        ? 'border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--violet)/0.2)]'
                        : 'border-border/50 bg-transparent'
                    }`}
                  >
                    <span className="text-lg">{p.emoji}</span>
                    <span className="text-[11px] font-medium leading-tight">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground">{p.w}×{p.h}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── CONVERT ── */}
          <TabsContent value="convert" className="mt-6 space-y-3">
            {formats.map((f) => (
              <button
                key={f.value}
                onClick={() => onUpdate({ outputFormat: f.value })}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all hover:bg-primary/5 ${
                  settings.outputFormat === f.value
                    ? 'border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--violet)/0.15)]'
                    : 'border-border/50'
                }`}
              >
                {/* Radio dot */}
                <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  settings.outputFormat === f.value ? 'border-primary' : 'border-muted-foreground/40'
                }`}>
                  {settings.outputFormat === f.value && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{f.label}</span>
                    {f.recommended && (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">
                        Recommended
                      </span>
                    )}
                    {f.value === 'webp' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[240px] text-xs">
                          WebP images are ~30% smaller than JPEG at the same quality. They improve website load speed and Core Web Vitals scores.
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </button>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPanel;
