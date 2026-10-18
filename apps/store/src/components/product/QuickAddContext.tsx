import { useCallback, useState, type ReactNode } from 'react';
import type { CatalogIndexEntry } from '@areqa/shared';
import { QuickAddContext } from './quickAdd';
import { QuickAddSheet } from './QuickAddSheet';

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<CatalogIndexEntry | null>(null);
  const open = useCallback((e: CatalogIndexEntry) => setEntry(e), []);
  return (
    <QuickAddContext.Provider value={open}>
      {children}
      <QuickAddSheet entry={entry} onClose={() => setEntry(null)} />
    </QuickAddContext.Provider>
  );
}
