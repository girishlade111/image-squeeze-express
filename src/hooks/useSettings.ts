import { useState, useCallback, useEffect } from 'react';

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'original';
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
}

const STORAGE_KEY = 'imagesqueeze-settings';

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
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch {
    // Fall back to defaults on error
    return { ...defaults };
  }
  return { ...defaults };
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
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
      max: { quality: 100, qualityPreset: 'max' },
      high: { quality: 90, qualityPreset: 'high' },
      balanced: { quality: 75, qualityPreset: 'balanced' },
      compact: { quality: 50, qualityPreset: 'compact' },
      custom: { qualityPreset: 'custom' },
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

  return { 
    settings, 
    update, 
    resetResize, 
    applyQualityPreset, 
    rotateImage, 
    flipImage,
    resetAll,
  };
}