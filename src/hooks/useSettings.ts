import { useState, useCallback, useEffect } from 'react';

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'original';
export type QualityPreset = 'max' | 'high' | 'balanced' | 'compact' | 'custom';
export type Rotation = 0 | 90 | 180 | 270;

export interface Settings {
  // Basic compression
  quality: number;
  autoOptimize: boolean;
  targetSizeKB: number | null;

  // Resize
  width: number | null;
  height: number | null;
  lockAspectRatio: boolean;
  selectedPreset: string | null;

  // Format
  outputFormat: ImageFormat;

  // Advanced options
  stripEXIF: boolean;
  grayscale: boolean;
  rotation: Rotation;
  mirror: boolean;
  qualityPreset: QualityPreset;

  // Output options
  preserveMetadata: boolean;
  progressive: boolean;
  embedColorProfile: boolean;

  // Power features
  lossless: boolean;
  filenamePattern: string;
}

const STORAGE_KEY = 'ls-image-compressor-settings';
const STORAGE_KEY_OLD = 'imagesqueeze-settings';

const migrateSettingsKey = () => {
  try {
    const old = localStorage.getItem(STORAGE_KEY_OLD);
    if (old !== null && localStorage.getItem(STORAGE_KEY) === null) {
      localStorage.setItem(STORAGE_KEY, old);
      localStorage.removeItem(STORAGE_KEY_OLD);
    }
  } catch {
    /* storage disabled — non-fatal */
  }
};

migrateSettingsKey();

const defaults: Settings = {
  // Basic compression
  quality: 75,
  autoOptimize: true,
  targetSizeKB: null,

  // Resize
  width: null,
  height: null,
  lockAspectRatio: true,
  selectedPreset: null,

  // Format
  outputFormat: 'webp',

  // Advanced options
  stripEXIF: true,
  grayscale: false,
  rotation: 0,
  mirror: false,
  qualityPreset: 'balanced',

  // Output options
  preserveMetadata: false,
  progressive: true,
  embedColorProfile: false,

  // Power features
  lossless: false,
  filenamePattern: 'imagesqueeze_{name}.{ext}',
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch {
    return { ...defaults };
  }
  return { ...defaults };
}

/**
 * Computes the missing dimension when the aspect ratio is locked.
 * Returns the new width/height pair, or the current values if both are set or lock is off.
 */
export function computeAspectDimensions(
  origW: number,
  origH: number,
  targetW: number | null,
  targetH: number | null,
  lock: boolean
): { width: number | null; height: number | null } {
  if (!origW || !origH) return { width: targetW, height: targetH };
  if (!lock) return { width: targetW, height: targetH };

  const aspect = origW / origH;
  if (targetW && targetW > 0 && !targetH) {
    return { width: targetW, height: Math.max(1, Math.round(targetW / aspect)) };
  }
  if (targetH && targetH > 0 && !targetW) {
    return { width: Math.max(1, Math.round(targetH * aspect)), height: targetH };
  }
  return { width: targetW, height: targetH };
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage may be full or disabled — non-fatal */
    }
  }, [settings]);

  const update = useCallback((partial: Partial<Settings>) => {
    setSettingsState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetResize = useCallback(() => {
    setSettingsState((prev) => ({
      ...prev,
      width: null,
      height: null,
      selectedPreset: null,
      rotation: 0,
      mirror: false,
    }));
  }, []);

  const applyQualityPreset = useCallback((preset: QualityPreset) => {
    const presets: Record<QualityPreset, Partial<Settings>> = {
      max: { quality: 100, autoOptimize: false, qualityPreset: 'max' },
      high: { quality: 90, autoOptimize: false, qualityPreset: 'high' },
      balanced: { quality: 75, autoOptimize: true, qualityPreset: 'balanced' },
      compact: { quality: 50, autoOptimize: false, qualityPreset: 'compact' },
      custom: { autoOptimize: false, qualityPreset: 'custom' },
    };
    setSettingsState((prev) => ({ ...prev, ...presets[preset] }));
  }, []);

  const rotateImage = useCallback((degrees: Rotation) => {
    setSettingsState((prev) => ({ ...prev, rotation: degrees }));
  }, []);

  const flipImage = useCallback(() => {
    setSettingsState((prev) => ({ ...prev, mirror: !prev.mirror }));
  }, []);

  const resetAll = useCallback(() => {
    setSettingsState(defaults);
  }, []);

  /**
   * Updates width/height preserving the aspect ratio based on the source image dims.
   * Use this when the user types in a width/height input.
   */
  const setWidth = useCallback(
    (value: number | null, sourceDims?: { width: number; height: number } | null) => {
      setSettingsState((prev) => {
        const computed = sourceDims
          ? computeAspectDimensions(
              sourceDims.width,
              sourceDims.height,
              value,
              prev.height,
              prev.lockAspectRatio
            )
          : { width: value, height: prev.height };
        return { ...prev, ...computed, selectedPreset: null };
      });
    },
    []
  );

  const setHeight = useCallback(
    (value: number | null, sourceDims?: { width: number; height: number } | null) => {
      setSettingsState((prev) => {
        const computed = sourceDims
          ? computeAspectDimensions(
              sourceDims.width,
              sourceDims.height,
              prev.width,
              value,
              prev.lockAspectRatio
            )
          : { width: prev.width, height: value };
        return { ...prev, ...computed, selectedPreset: null };
      });
    },
    []
  );

  return {
    settings,
    update,
    resetResize,
    applyQualityPreset,
    rotateImage,
    flipImage,
    resetAll,
    setWidth,
    setHeight,
  };
}
