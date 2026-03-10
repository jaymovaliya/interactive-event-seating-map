import { useReducer, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { Seat, Section } from '../types/venue';
import { MAX_SELECTION, PRICE_TIERS } from '../types/venue';
import { SelectionContext } from './selectionContextDef';

interface SelectionState {
    selectedSeatIds: Set<string>;
    selectedSeats: Seat[];
    seatSectionMap: Map<string, string>;
    seatRowMap: Map<string, number>;
}

type SelectionAction =
    | { type: 'TOGGLE_SEAT'; seat: Seat; sectionLabel: string; rowIndex: number }
    | { type: 'REMOVE_SEAT'; seatId: string }
    | { type: 'CLEAR' }
    | { type: 'HYDRATE'; seatIds: string[]; seats: Seat[]; sectionLabels: string[]; rowIndices: number[] };

const STORAGE_KEY = 'seating-selection';

function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
    switch (action.type) {
        case 'TOGGLE_SEAT': {
            if (state.selectedSeatIds.has(action.seat.id)) {
                const newIds = new Set(state.selectedSeatIds);
                newIds.delete(action.seat.id);
                const newSeats = state.selectedSeats.filter(s => s.id !== action.seat.id);
                const newSectionMap = new Map(state.seatSectionMap);
                const newRowMap = new Map(state.seatRowMap);
                newSectionMap.delete(action.seat.id);
                newRowMap.delete(action.seat.id);
                return { selectedSeatIds: newIds, selectedSeats: newSeats, seatSectionMap: newSectionMap, seatRowMap: newRowMap };
            }
            if (state.selectedSeatIds.size >= MAX_SELECTION) return state;
            if (action.seat.status !== 'available') return state;
            const newIds = new Set(state.selectedSeatIds);
            newIds.add(action.seat.id);
            const newSectionMap = new Map(state.seatSectionMap);
            const newRowMap = new Map(state.seatRowMap);
            newSectionMap.set(action.seat.id, action.sectionLabel);
            newRowMap.set(action.seat.id, action.rowIndex);
            return {
                selectedSeatIds: newIds,
                selectedSeats: [...state.selectedSeats, action.seat],
                seatSectionMap: newSectionMap,
                seatRowMap: newRowMap,
            };
        }
        case 'REMOVE_SEAT': {
            if (!state.selectedSeatIds.has(action.seatId)) return state;
            const newIds = new Set(state.selectedSeatIds);
            newIds.delete(action.seatId);
            const newSectionMap = new Map(state.seatSectionMap);
            const newRowMap = new Map(state.seatRowMap);
            newSectionMap.delete(action.seatId);
            newRowMap.delete(action.seatId);
            return {
                selectedSeatIds: newIds,
                selectedSeats: state.selectedSeats.filter(s => s.id !== action.seatId),
                seatSectionMap: newSectionMap,
                seatRowMap: newRowMap,
            };
        }
        case 'CLEAR':
            return { selectedSeatIds: new Set(), selectedSeats: [], seatSectionMap: new Map(), seatRowMap: new Map() };
        case 'HYDRATE': {
            const sectionMap = new Map<string, string>();
            const rowMap = new Map<string, number>();
            action.seatIds.forEach((id, i) => {
                sectionMap.set(id, action.sectionLabels[i]);
                rowMap.set(id, action.rowIndices[i]);
            });
            return {
                selectedSeatIds: new Set(action.seatIds),
                selectedSeats: action.seats,
                seatSectionMap: sectionMap,
                seatRowMap: rowMap,
            };
        }
        default:
            return state;
    }
}

export function SelectionProvider({ children, sections }: { children: ReactNode; sections: Section[] }) {
    const [state, dispatch] = useReducer(selectionReducer, {
        selectedSeatIds: new Set<string>(),
        selectedSeats: [],
        seatSectionMap: new Map(),
        seatRowMap: new Map(),
    });

    const hydrated = useRef(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                hydrated.current = true;
                return;
            }
            const parsed = JSON.parse(stored) as { ids: string[]; sectionLabels: string[]; rowIndices: number[] };
            if (!Array.isArray(parsed.ids) || parsed.ids.length === 0) {
                hydrated.current = true;
                return;
            }

            // Look up full seat objects
            const seatMap = new Map<string, Seat>();
            for (const section of sections) {
                for (const row of section.rows) {
                    for (const seat of row.seats) {
                        seatMap.set(seat.id, seat);
                    }
                }
            }

            const validIds: string[] = [];
            const validSeats: Seat[] = [];
            const validSectionLabels: string[] = [];
            const validRowIndices: number[] = [];
            for (let i = 0; i < parsed.ids.length; i++) {
                const seat = seatMap.get(parsed.ids[i]);
                if (seat && seat.status === 'available') {
                    validIds.push(parsed.ids[i]);
                    validSeats.push(seat);
                    validSectionLabels.push(parsed.sectionLabels?.[i] ?? '');
                    validRowIndices.push(parsed.rowIndices?.[i] ?? 0);
                }
            }

            if (validIds.length > 0) {
                dispatch({
                    type: 'HYDRATE',
                    seatIds: validIds,
                    seats: validSeats,
                    sectionLabels: validSectionLabels,
                    rowIndices: validRowIndices,
                });
            }
        } catch {
            // ignore
        }
        hydrated.current = true;
    }, [sections]);

    // Persist to localStorage on every change (skip until hydrated)
    useEffect(() => {
        if (!hydrated.current) return;
        const ids = Array.from(state.selectedSeatIds);
        const sectionLabels = ids.map(id => state.seatSectionMap.get(id) ?? '');
        const rowIndices = ids.map(id => state.seatRowMap.get(id) ?? 0);
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ ids, sectionLabels, rowIndices })
        );
    }, [state.selectedSeatIds, state.seatSectionMap, state.seatRowMap]);

    const toggleSeat = useCallback((seat: Seat, sectionLabel: string, rowIndex: number) => {
        dispatch({ type: 'TOGGLE_SEAT', seat, sectionLabel, rowIndex });
    }, []);

    const removeSeat = useCallback((seatId: string) => {
        dispatch({ type: 'REMOVE_SEAT', seatId });
    }, []);

    const clearSelection = useCallback(() => {
        dispatch({ type: 'CLEAR' });
    }, []);

    const isSelected = useCallback(
        (seatId: string) => state.selectedSeatIds.has(seatId),
        [state.selectedSeatIds]
    );

    const subtotal = state.selectedSeats.reduce(
        (sum, seat) => sum + (PRICE_TIERS[seat.priceTier] ?? 0),
        0
    );

    return (
        <SelectionContext.Provider
            value={{
                selectedSeatIds: state.selectedSeatIds,
                selectedSeats: state.selectedSeats,
                seatSectionMap: state.seatSectionMap,
                seatRowMap: state.seatRowMap,
                toggleSeat,
                removeSeat,
                clearSelection,
                isSelected,
                subtotal,
            }}
        >
            {children}
        </SelectionContext.Provider>
    );
}
