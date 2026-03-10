import { useState, useEffect } from 'react';
import type { Venue } from '../types/venue';

interface UseVenueDataReturn {
    venue: Venue | null;
    loading: boolean;
    error: string | null;
}

export function useVenueData(): UseVenueDataReturn {
    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch('/venue.json');
                if (!res.ok) throw new Error(`Failed to load venue data: ${res.status}`);
                const data: Venue = await res.json();
                if (!cancelled) {
                    setVenue(data);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Unknown error');
                    setLoading(false);
                }
            }
        }

        load();
        return () => { cancelled = true; };
    }, []);

    return { venue, loading, error };
}
