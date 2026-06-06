import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Columns2,
  SlidersHorizontal,
  Repeat,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatFileSize, getCompressionRatio } from '@/utils/imageProcessor';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import type { UploadedFile } from '@/hooks/useImageUpload';

type ViewMode = 'side-by-side' | 'slider' | 'toggle';

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const ZOOM_STEP = 0.25;

interface ComparisonViewProps {
  file: UploadedFile;
}

export function ComparisonView({ file }: ComparisonViewProps) {
  const [mode, setMode] = useState<ViewMode>('slider');
  const [sliderPos, setSliderPos] = useState(50);
  const [showBefore, setShowBefore] = useState(true);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<{
    kind: 'pan' | 'slider' | 'none';
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
    moved: boolean;
  } | null>(null);

  const newSize = file.result?.sizeBytes ?? 0;
  const ratio = getCompressionRatio(file.originalSize, newSize);

  const handleModeChange = useCallback((newMode: ViewMode) => {
    setMode(newMode);
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const computeSliderPos = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return 50;
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  const onAreaPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const isZoomed = scale > 1;
      interactionRef.current = {
        kind: isZoomed ? 'pan' : mode === 'slider' ? 'slider' : 'none',
        startX: e.clientX,
        startY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
        moved: false,
      };
      try {
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
      } catch {
        /* element may not support capture */
      }
      if (!isZoomed && mode === 'slider') {
        setSliderPos(computeSliderPos(e.clientX));
      }
    },
    [mode, pan, scale, computeSliderPos]
  );

  const onAreaPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction) return;
      const dx = e.clientX - interaction.startX;
      const dy = e.clientY - interaction.startY;
      if (!interaction.moved && Math.hypot(dx, dy) > 3) {
        interaction.moved = true;
      }
      if (interaction.kind === 'pan') {
        setPan({
          x: interaction.startPanX + dx,
          y: interaction.startPanY + dy,
        });
      } else if (interaction.kind === 'slider' && mode === 'slider') {
        setSliderPos(computeSliderPos(e.clientX));
      }
    },
    [mode, computeSliderPos]
  );

  const onAreaPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const interaction = interactionRef.current;
      if (
        interaction &&
        interaction.kind === 'pan' &&
        !interaction.moved &&
        mode === 'slider'
      ) {
        setSliderPos(computeSliderPos(e.clientX));
      }
      interactionRef.current = null;
      try {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    },
    [mode, computeSliderPos]
  );

  const applyWheel = useCallback(
    (deltaY: number, clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const direction = deltaY < 0 ? 1 : -1;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + direction * ZOOM_STEP));
      if (newScale === scale) return;
      const cx = clientX - rect.left - rect.width / 2;
      const cy = clientY - rect.top - rect.height / 2;
      const r = newScale / scale;
      setPan({
        x: cx - (cx - pan.x) * r,
        y: cy - (cy - pan.y) * r,
      });
      setScale(newScale);
    },
    [scale, pan]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mode === 'side-by-side') return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      applyWheel(e.deltaY, e.clientX, e.clientY);
    };
    container.addEventListener('wheel', handler, { passive: false });
    return () => container.removeEventListener('wheel', handler);
  }, [applyWheel, mode]);

  const zoomIn = useCallback(() => setScale((s) => Math.min(MAX_SCALE, s + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(MIN_SCALE, s - ZOOM_STEP)), []);
  const resetZoom = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      switch (e.key) {
        case '1':
          e.preventDefault();
          handleModeChange('side-by-side');
          break;
        case '2':
          e.preventDefault();
          handleModeChange('slider');
          break;
        case '3':
          e.preventDefault();
          handleModeChange('toggle');
          break;
        case 'ArrowLeft':
          if (mode === 'slider') {
            e.preventDefault();
            setSliderPos((p) => Math.max(0, p - (e.shiftKey ? 10 : 2)));
          } else if (mode === 'toggle') {
            e.preventDefault();
            setShowBefore((b) => !b);
          }
          break;
        case 'ArrowRight':
          if (mode === 'slider') {
            e.preventDefault();
            setSliderPos((p) => Math.min(100, p + (e.shiftKey ? 10 : 2)));
          } else if (mode === 'toggle') {
            e.preventDefault();
            setShowBefore((b) => !b);
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case ' ':
          if (mode === 'toggle') {
            e.preventDefault();
            setShowBefore((b) => !b);
          }
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, handleModeChange, zoomIn, zoomOut, resetZoom]);

  const download = useCallback(() => {
    if (file.processedFile) {
      saveAs(file.processedFile, file.processedFile.name);
      toast.success(`Downloaded ${file.processedFile.name}`);
    }
  }, [file]);

  if (!file.result) return null;

  const canZoom = mode !== 'side-by-side';
  const isAtDefaultView = scale === 1 && pan.x === 0 && pan.y === 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex rounded-full border border-border/40 bg-secondary/30 p-0.5"
          role="tablist"
          aria-label="View mode"
        >
          <ModeButton
            active={mode === 'side-by-side'}
            onClick={() => handleModeChange('side-by-side')}
            icon={<Columns2 className="h-3.5 w-3.5" />}
            label="Side"
            shortcut="1"
          />
          <ModeButton
            active={mode === 'slider'}
            onClick={() => handleModeChange('slider')}
            icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
            label="Slider"
            shortcut="2"
          />
          <ModeButton
            active={mode === 'toggle'}
            onClick={() => handleModeChange('toggle')}
            icon={<Repeat className="h-3.5 w-3.5" />}
            label="Toggle"
            shortcut="3"
          />
        </div>

        <div className="flex items-center gap-0.5">
          {canZoom && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={zoomOut}
                disabled={scale <= MIN_SCALE}
                aria-label="Zoom out"
                title="Zoom out (-)"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="min-w-[3.5ch] text-center text-[10px] tabular-nums text-muted-foreground">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={zoomIn}
                disabled={scale >= MAX_SCALE}
                aria-label="Zoom in"
                title="Zoom in (+)"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={resetZoom}
                disabled={isAtDefaultView}
                aria-label="Reset zoom"
                title="Reset zoom (0)"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
              <div className="mx-1 h-4 w-px bg-border/40" />
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={download}
            aria-label="Download compressed"
            title="Download compressed"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-secondary/20">
        <AnimatePresence mode="wait">
          {mode === 'side-by-side' && (
            <motion.div
              key="side-by-side"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SideBySideView file={file} />
            </motion.div>
          )}
          {mode === 'slider' && (
            <motion.div
              key="slider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SliderView
                file={file}
                sliderPos={sliderPos}
                scale={scale}
                pan={pan}
                containerRef={containerRef}
                onAreaPointerDown={onAreaPointerDown}
                onAreaPointerMove={onAreaPointerMove}
                onAreaPointerUp={onAreaPointerUp}
              />
            </motion.div>
          )}
          {mode === 'toggle' && (
            <motion.div
              key="toggle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ToggleView
                file={file}
                showBefore={showBefore}
                scale={scale}
                pan={pan}
                containerRef={containerRef}
                onAreaPointerDown={onAreaPointerDown}
                onAreaPointerMove={onAreaPointerMove}
                onAreaPointerUp={onAreaPointerUp}
                onToggle={() => setShowBefore((b) => !b)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border/40 bg-secondary/20 p-2">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Before</p>
          <p className="mt-0.5 text-sm font-bold text-foreground">{formatFileSize(file.originalSize)}</p>
          {file.originalWidth > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {file.originalWidth}×{file.originalHeight}
            </p>
          )}
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-2">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">After</p>
          <p className="mt-0.5 text-sm font-bold text-emerald-300">
            {formatFileSize(newSize)}
            <span className="ml-1 text-[10px] font-normal text-emerald-400/80">· {ratio}</span>
          </p>
          {file.result && (
            <p className="text-[10px] text-muted-foreground">
              {file.result.width}×{file.result.height}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, icon, label, shortcut }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
        active
          ? 'bg-foreground/10 text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
      aria-pressed={active}
      role="tab"
      aria-selected={active}
      title={`${label} (${shortcut})`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <kbd className="hidden rounded border border-border/40 bg-background/50 px-1 text-[9px] font-mono text-muted-foreground sm:inline">
        {shortcut}
      </kbd>
    </button>
  );
}

function SideBySideView({ file }: { file: UploadedFile }) {
  return (
    <div className="grid grid-cols-2 gap-px bg-border/40">
      <div className="flex flex-col gap-1 bg-background/95 p-2">
        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Before</p>
        <div className="flex min-h-[40vh] items-center justify-center">
          <img
            src={file.preview}
            alt={`Original ${file.name}`}
            className="max-h-[55vh] max-w-full rounded object-contain"
            draggable={false}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1 bg-background/95 p-2">
        <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">After</p>
        <div className="flex min-h-[40vh] items-center justify-center">
          <img
            src={file.processedPreview}
            alt={`Compressed ${file.name}`}
            className="max-h-[55vh] max-w-full rounded object-contain"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

interface SliderViewProps {
  file: UploadedFile;
  sliderPos: number;
  scale: number;
  pan: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement>;
  onAreaPointerDown: (e: React.PointerEvent) => void;
  onAreaPointerMove: (e: React.PointerEvent) => void;
  onAreaPointerUp: (e: React.PointerEvent) => void;
}

function SliderView({
  file,
  sliderPos,
  scale,
  pan,
  containerRef,
  onAreaPointerDown,
  onAreaPointerMove,
  onAreaPointerUp,
}: SliderViewProps) {
  const cursor = scale > 1 ? 'grab' : 'ew-resize';
  return (
    <div
      ref={containerRef}
      className="relative h-[60vh] min-h-[300px] touch-none select-none overflow-hidden"
      style={{
        cursor,
        backgroundImage: 'repeating-conic-gradient(#262626 0% 25%, #404040 0% 50%)',
        backgroundSize: '16px 16px',
      }}
      onPointerDown={onAreaPointerDown}
      onPointerMove={onAreaPointerMove}
      onPointerUp={onAreaPointerUp}
      onPointerCancel={onAreaPointerUp}
    >
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: 'center',
          willChange: 'transform',
        }}
      >
        <img
          src={file.processedPreview}
          alt={`Compressed ${file.name}`}
          className="max-h-full max-w-full object-contain"
          draggable={false}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: 'center',
          willChange: 'transform, clip-path',
        }}
      >
        <img
          src={file.preview}
          alt={`Original ${file.name}`}
          className="max-h-full max-w-full object-contain"
          draggable={false}
        />
      </div>
      <div
        className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 bg-white/80"
        style={{
          left: `${sliderPos}%`,
          boxShadow: '0 0 8px rgba(0,0,0,0.5), 0 0 2px rgba(0,0,0,0.8)',
        }}
        aria-hidden
      />
      <div
        className="absolute top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-black/30"
        style={{ left: `${sliderPos}%` }}
        role="slider"
        aria-label="Before/After slider position"
        aria-valuenow={Math.round(sliderPos)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-orientation="vertical"
      >
        <div className="flex gap-0.5">
          <div className="h-4 w-0.5 rounded-full bg-gray-700" />
          <div className="h-4 w-0.5 rounded-full bg-gray-700" />
        </div>
      </div>
      <div className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        Before
      </div>
      <div className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-emerald-500/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        After
      </div>
    </div>
  );
}

interface ToggleViewProps {
  file: UploadedFile;
  showBefore: boolean;
  scale: number;
  pan: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement>;
  onAreaPointerDown: (e: React.PointerEvent) => void;
  onAreaPointerMove: (e: React.PointerEvent) => void;
  onAreaPointerUp: (e: React.PointerEvent) => void;
  onToggle: () => void;
}

function ToggleView({
  file,
  showBefore,
  scale,
  pan,
  containerRef,
  onAreaPointerDown,
  onAreaPointerMove,
  onAreaPointerUp,
  onToggle,
}: ToggleViewProps) {
  const cursor = scale > 1 ? 'grab' : 'pointer';
  return (
    <div
      ref={containerRef}
      className="relative h-[60vh] min-h-[300px] touch-none select-none overflow-hidden"
      style={{
        cursor,
        backgroundImage: 'repeating-conic-gradient(#262626 0% 25%, #404040 0% 50%)',
        backgroundSize: '16px 16px',
      }}
      onPointerDown={onAreaPointerDown}
      onPointerMove={onAreaPointerMove}
      onPointerUp={onAreaPointerUp}
      onPointerCancel={onAreaPointerUp}
    >
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: 'center',
          willChange: 'transform',
        }}
      >
        <img
          src={showBefore ? file.preview : file.processedPreview}
          alt={showBefore ? `Original ${file.name}` : `Compressed ${file.name}`}
          className="max-h-full max-w-full object-contain"
          draggable={false}
        />
      </div>
      <div
        className={cn(
          'pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-colors',
          showBefore ? 'bg-black/60' : 'bg-emerald-500/80'
        )}
      >
        {showBefore ? 'Before' : 'After'}
      </div>
      {scale <= 1 && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
          Click to toggle · ←/→
        </div>
      )}
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-0 cursor-pointer bg-transparent"
        aria-label={showBefore ? 'Switch to compressed version' : 'Switch to original'}
        tabIndex={-1}
      />
    </div>
  );
}
