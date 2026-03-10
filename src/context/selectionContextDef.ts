import { createContext } from 'react';
import type { Seat } from '../types/venue';

export interface SelectionContextValue {
    selectedSeatIds: Set<string>;
    selectedSeats: Seat[];
    seatSectionMap: Map<string, string>;
    seatRowMap: Map<string, number>;
    toggleSeat: (seat: Seat, sectionLabel: string, rowIndex: number) => void;
    removeSeat: (seatId: string) => void;
    clearSelection: () => void;
    isSelected: (seatId: string) => boolean;
    subtotal: number;
}

export const SelectionContext = createContext<SelectionContextValue | null>(null);
