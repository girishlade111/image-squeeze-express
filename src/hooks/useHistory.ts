import { useCallback, useEffect, useState } from 'react';
import {
  addHistoryEntry,
  clearHistory,
  deleteHistoryEntry,
  downloadHistoryEntry,
  loadHistory,
  type HistoryEntry,
  type HistoryTool,
} from '@/utils/historyStorage';

const HISTORY_UPDATED_EVENT = 'ls-image-compressor-history-updated';

const useHistory = (tool: HistoryTool | 'all' = 'all') => {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => loadHistory());

  useEffect(() => {
    const refresh = () => setEntries(loadHistory());
    window.addEventListener('storage', refresh);
    window.addEventListener(HISTORY_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(HISTORY_UPDATED_EVENT, refresh);
    };
  }, []);

  const visible = tool === 'all' ? entries : entries.filter((e) => e.tool === tool);

  const addEntry = useCallback((entry: HistoryEntry) => {
    const next = addHistoryEntry(entry);
    setEntries(next);
  }, []);

  const removeEntry = useCallback((id: string) => {
    const next = deleteHistoryEntry(id);
    setEntries(next);
  }, []);

  const clear = useCallback(() => {
    clearHistory();
    setEntries([]);
  }, []);

  const download = useCallback((entry: HistoryEntry) => {
    downloadHistoryEntry(entry);
  }, []);

  return {
    entries: visible,
    totalCount: entries.length,
    addEntry,
    removeEntry,
    clear,
    download,
  };
};

export default useHistory;
