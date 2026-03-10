export type SeatStatus = 'available' | 'reserved' | 'sold' | 'held';

export interface Seat {
    id: string;
    col: number;
    x: number;
    y: number;
    priceTier: number;
    status: SeatStatus;
}

export interface Row {
    index: number;
    scale: number;
    seats: Seat[];
}

export interface SectionTransform {
    x: number;
    y: number;
}

export interface Section {
    id: string;
    label: string;
    transform: SectionTransform;
    rows: Row[];
}

export interface VenueMap {
    width: number;
    height: number;
}

export interface Venue {
    venueId: string;
    name: string;
    map: VenueMap;
    sections: Section[];
}

export const PRICE_TIERS: Record<number, number> = {
    1: 150,
    2: 100,
    3: 75,
    4: 50,
};

export const MAX_SELECTION = 8;
