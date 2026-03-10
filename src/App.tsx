import { useVenueData } from './hooks/useVenueData';
import { useTheme } from './hooks/useTheme';
import { SelectionProvider } from './context/SelectionContext';
import { Header } from './components/Header';
import { SeatingMap } from './components/SeatingMap';
import { SelectionSummary } from './components/SelectionSummary';

export default function App() {
  const { venue, loading, error } = useVenueData();
  const { isDark, toggleTheme } = useTheme();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-slate-50 dark:bg-[#0f1117]">
        <div className="loading-spinner" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading seating map…</p>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{error ?? 'Failed to load venue data'}</p>
        <button
          className="mt-2 px-6 py-[10px] border-none rounded-lg bg-indigo-500 text-white text-sm font-semibold cursor-pointer font-sans"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <SelectionProvider sections={venue.sections}>
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100">
        <Header venueName={venue.name} isDark={isDark} toggleTheme={toggleTheme} />
        <main className="flex flex-1 overflow-hidden max-md:flex-col">
          <SeatingMap venue={venue} />
          <SelectionSummary />
        </main>
      </div>
    </SelectionProvider>
  );
}
