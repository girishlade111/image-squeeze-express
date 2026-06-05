import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Sparkles, Zap, BadgeCheck, Rocket, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { PdfQualityPreset } from '@/utils/pdfProcessor';

interface PdfSettingsPanelProps {
  preset: PdfQualityPreset;
  onPresetChange: (preset: PdfQualityPreset) => void;
  quality: number;
  onQualityChange: (quality: number) => void;
}

const presets: {
  id: PdfQualityPreset;
  emoji: string;
  name: string;
  desc: string;
  quality: number;
  icon: typeof Sparkles;
}[] = [
  {
    id: 'low',
    emoji: '🚀',
    name: 'Strong',
    desc: 'Smallest file — emails & sharing',
    quality: 0.4,
    icon: Rocket,
  },
  {
    id: 'medium',
    emoji: '⚡',
    name: 'Balanced',
    desc: 'Recommended for most uses',
    quality: 0.6,
    icon: Zap,
  },
  {
    id: 'high',
    emoji: '✨',
    name: 'Light',
    desc: 'Best quality — bigger file',
    quality: 0.82,
    icon: BadgeCheck,
  },
];

function qualityLabel(q: number): { emoji: string; text: string } {
  if (q >= 0.8) return { emoji: '🟢', text: 'High quality' };
  if (q >= 0.55) return { emoji: '🟡', text: 'Balanced' };
  return { emoji: '🔴', text: 'Strong compression' };
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

const PdfSettingsPanel = ({
  preset,
  onPresetChange,
  quality,
  onQualityChange,
}: PdfSettingsPanelProps) => {
  const hint = qualityLabel(quality);

  return (
    <motion.div
      className="mx-auto mt-6 max-w-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-4 shadow-lg space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-semibold">Compression Level</Label>
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
                  }}
                  aria-pressed={isActive}
                  aria-label={`${p.name} compression preset`}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-center transition-all ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border/40 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  <span className="text-[11px] font-semibold">{p.name}</span>
                  <span className="text-[9px] text-muted-foreground leading-tight">
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
              <Label className="text-xs font-semibold">JPEG Quality</Label>
              <InfoTip>
                Lower = smaller file, more visible compression artefacts. 0.6 is a
                good default for documents.
              </InfoTip>
            </div>
            <span className="text-xs font-bold tabular-nums text-primary">
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
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              {hint.emoji} {hint.text}
            </span>
            <span className="tabular-nums">
              Pages will be re-rendered as JPEG @ {Math.round(quality * 100)}%
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-secondary/50 px-3 py-2.5 text-[11px] text-muted-foreground">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
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
