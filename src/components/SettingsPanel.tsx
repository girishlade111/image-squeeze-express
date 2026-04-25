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
    <div className="mx-auto mt-6 max-w-xl">
      <div className="rounded-xl border border-border/40 bg-card/70 backdrop-blur-xl p-4 shadow-sm">
        <Tabs defaultValue="compress">
          <TabsList className="grid w-full grid-cols-3 rounded-lg bg-secondary/60 p-1">
            <TabsTrigger value="compress" className="rounded-md text-[11px] font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground">
              Compress
            </TabsTrigger>
            <TabsTrigger value="resize" className="rounded-md text-[11px] font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground">
              Resize
            </TabsTrigger>
            <TabsTrigger value="convert" className="rounded-md text-[11px] font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground">
              Convert
            </TabsTrigger>
          </TabsList>

          {/* ── COMPRESS ── */}
          <TabsContent value="compress" className="mt-4 space-y-4">
            {/* Quality slider */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">
                  Quality: {settings.quality}%
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
                className="mt-2"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                {hint.emoji} {hint.text}
              </p>
            </div>

            {/* Auto optimize */}
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <div>
                <Label className="text-xs font-medium">Auto Optimize</Label>
                <p className="text-[10px] text-muted-foreground">Locks to 75%</p>
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
              <Label className="text-xs font-medium">Target Size (KB)</Label>
              <Input
                type="number"
                placeholder="e.g. 200"
                value={settings.targetSizeKB ?? ''}
                onChange={(e) =>
                  onUpdate({ targetSizeKB: e.target.value ? Number(e.target.value) : null })
                }
                className="mt-1 rounded-lg"
              />
            </div>
          </TabsContent>

          {/* ── RESIZE ── */}
          <TabsContent value="resize" className="mt-4 space-y-4">
            {/* Dimension inputs */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs font-medium">Width (px)</Label>
                <Input
                  type="number"
                  placeholder="Auto"
                  value={settings.width ?? ''}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="mt-1 rounded-lg"
                />
              </div>

              <button
                onClick={() => onUpdate({ lockAspectRatio: !settings.lockAspectRatio })}
                className={`mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                  settings.lockAspectRatio
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                }`}
                aria-label="Toggle aspect ratio lock"
              >
                {settings.lockAspectRatio ? (
                  <Link2 className="h-3.5 w-3.5" />
                ) : (
                  <Unlink2 className="h-3.5 w-3.5" />
                )}
              </button>

              <div className="flex-1">
                <Label className="text-xs font-medium">Height (px)</Label>
                <Input
                  type="number"
                  placeholder="Auto"
                  value={settings.height ?? ''}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="mt-1 rounded-lg"
                />
              </div>
            </div>

            {/* Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium">Presets</p>
                {settings.selectedPreset && (
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground hover:text-destructive" onClick={onResetResize}>
                    <X className="mr-0.5 h-2.5 w-2.5" /> Clear
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      onUpdate({ width: p.w, height: p.h, selectedPreset: p.id })
                    }
                    aria-label={`${p.name} preset: ${p.w} by ${p.h} pixels`}
                    aria-pressed={settings.selectedPreset === p.id}
                    className={`flex flex-col items-center gap-0.5 rounded-lg border p-2 text-center transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                      settings.selectedPreset === p.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border/40 bg-transparent'
                    }`}
                  >
                    <span className="text-base" aria-hidden="true">{p.emoji}</span>
                    <span className="text-[9px] font-medium">{p.name}</span>
                    <span className="text-[8px] text-muted-foreground">{p.w}×{p.h}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

{/* ── CONVERT ── */}
          <TabsContent value="convert" className="mt-4 space-y-2" role="radiogroup" aria-label="Output format selection">
            {formats.map((f) => (
              <button
                key={f.value}
                onClick={() => onUpdate({ outputFormat: f.value })}
                role="radio"
                aria-checked={settings.outputFormat === f.value}
                aria-label={`Output format: ${f.label}`}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                  settings.outputFormat === f.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border/40'
                }`}
              >
                <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                  settings.outputFormat === f.value ? 'border-primary' : 'border-muted-foreground/40'
                }`}>
                  {settings.outputFormat === f.value && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{f.label}</span>
                    {f.recommended && (
                      <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[9px] font-medium text-accent">
                        Best
                      </span>
                    )}
{f.value === 'webp' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[200px] text-[10px]">
                          WebP ~30% smaller than JPEG
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
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
