import { useState, useCallback, useEffect } from 'react';

export interface Settings {
  quality: number;
  autoOptimize: boolean;
  targetSizeKB: number | null;
  width: number | null;
  height: number | null;
  lockAspectRatio: boolean;
  outputFormat: 'jpeg' | 'png' | 'webp' | 'original';
  selectedPreset: string | null;
}

const STORAGE_KEY = 'imagesqueeze-settings';

const defaults: Settings = {
  quality: 75,
  autoOptimize: true,
  targetSizeKB: null,
  width: null,
  height: null,
  lockAspectRatio: true,
  outputFormat: 'webp',
  selectedPreset: null,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
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
    setSettingsState((prev) => ({ ...prev, width: null, height: null, selectedPreset: null }));
  }, []);

  return { settings, update, resetResize };
}
