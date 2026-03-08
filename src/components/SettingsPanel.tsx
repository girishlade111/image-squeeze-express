import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ProcessingSettings, estimateCompressedSize } from '@/lib/image-processing';

interface SettingsPanelProps {
  settings: ProcessingSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProcessingSettings>>;
  totalOriginalSize: number;
}

const presets = [
  { label: 'Instagram Post', w: 1080, h: 1080 },
  { label: 'Instagram Story', w: 1080, h: 1920 },
  { label: 'LinkedIn Banner', w: 1584, h: 396 },
  { label: 'LinkedIn Post', w: 1200, h: 627 },
  { label: 'WhatsApp DP', w: 500, h: 500 },
  { label: 'Twitter/X Post', w: 1200, h: 675 },
  { label: 'Facebook Cover', w: 820, h: 312 },
  { label: 'YouTube Thumbnail', w: 1280, h: 720 },
  { label: 'Full HD', w: 1920, h: 1080 },
];

const formats = [
  { value: 'image/jpeg', label: 'JPEG', desc: 'Best for photos' },
  { value: 'image/png', label: 'PNG', desc: 'Best for transparency' },
  { value: 'image/webp', label: 'WebP ⭐', desc: 'Recommended — 30% smaller' },
  { value: 'keep', label: 'Keep Original', desc: '' },
];

const SettingsPanel = ({ settings, setSettings, totalOriginalSize }: SettingsPanelProps) => {
  const estimated = estimateCompressedSize(totalOriginalSize, settings.quality);

  const update = (partial: Partial<ProcessingSettings>) =>
    setSettings((prev) => ({ ...prev, ...partial }));

  const applyPreset = (w: number, h: number) => {
    update({ width: w, height: h });
  };

  return (
    <div className="container mx-auto mt-8 max-w-2xl px-4">
      <div className="glass-card rounded-2xl p-6">
        <Tabs defaultValue="compress">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-secondary">
            <TabsTrigger value="compress" className="rounded-lg text-xs sm:text-sm">Compress</TabsTrigger>
            <TabsTrigger value="resize" className="rounded-lg text-xs sm:text-sm">Resize</TabsTrigger>
            <TabsTrigger value="convert" className="rounded-lg text-xs sm:text-sm">Convert</TabsTrigger>
          </TabsList>

          {/* COMPRESS */}
          <TabsContent value="compress" className="mt-6 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Quality: {settings.quality}%</Label>
                <span className="text-xs text-muted-foreground">
                  Est. ≈ {(estimated / 1024).toFixed(0)} KB
                </span>
              </div>
              <Slider
                value={[settings.quality]}
                onValueChange={([v]) => update({ quality: v })}
                min={10}
                max={100}
                step={1}
                className="mt-3"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={settings.quality === 75}
                onCheckedChange={(checked) => {
                  if (checked) update({ quality: 75 });
                }}
              />
              <Label className="text-sm">Auto optimize for web (75%)</Label>
            </div>

            <div>
              <Label className="text-sm">Target size (KB) — optional</Label>
              <Input
                type="number"
                placeholder="e.g. 200"
                value={settings.targetSizeKB || ''}
                onChange={(e) =>
                  update({ targetSizeKB: e.target.value ? Number(e.target.value) : undefined })
                }
                className="mt-1.5 rounded-xl"
              />
            </div>
          </TabsContent>

          {/* RESIZE */}
          <TabsContent value="resize" className="mt-6 space-y-5">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-sm">Width (px)</Label>
                <Input
                  type="number"
                  placeholder="Auto"
                  value={settings.width || ''}
                  onChange={(e) => update({ width: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mb-0.5 rounded-full"
                onClick={() => update({ lockAspectRatio: !settings.lockAspectRatio })}
              >
                {settings.lockAspectRatio ? (
                  <Lock className="h-4 w-4 text-violet" />
                ) : (
                  <Unlock className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <div className="flex-1">
                <Label className="text-sm">Height (px)</Label>
                <Input
                  type="number"
                  placeholder="Auto"
                  value={settings.height || ''}
                  onChange={(e) => update({ height: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1.5 rounded-xl"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Presets</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <Button
                    key={p.label}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={() => applyPreset(p.w, p.h)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Leave blank to keep original dimensions.
            </p>
          </TabsContent>

          {/* CONVERT */}
          <TabsContent value="convert" className="mt-6 space-y-4">
            <RadioGroup
              value={settings.outputFormat}
              onValueChange={(v) => update({ outputFormat: v as ProcessingSettings['outputFormat'] })}
              className="space-y-3"
            >
              {formats.map((f) => (
                <div key={f.value} className="flex items-center gap-3">
                  <RadioGroupItem value={f.value} id={f.value} />
                  <Label htmlFor={f.value} className="flex items-center gap-2 text-sm">
                    {f.label}
                    {f.desc && (
                      <span className="text-xs text-muted-foreground">— {f.desc}</span>
                    )}
                  </Label>
                  {f.value === 'image/webp' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        WebP images are 30% smaller than JPEG with same quality. Best for websites.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPanel;
