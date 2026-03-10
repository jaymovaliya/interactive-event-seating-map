import { useContext } from 'react';
import { SelectionContext } from '../context/selectionContextDef';
import type { SelectionContextValue } from '../context/selectionContextDef';

export type { SelectionContextValue };

export function useSelection(): SelectionContextValue {
    const ctx = useContext(SelectionContext);
    if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
    return ctx;
}
