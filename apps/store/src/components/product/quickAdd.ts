import { createContext, useContext } from 'react';
import type { CatalogIndexEntry } from '@areqa/shared';

export const QuickAddContext = createContext<(entry: CatalogIndexEntry) => void>(() => {});

export const useQuickAdd = () => useContext(QuickAddContext);
