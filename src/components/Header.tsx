interface HeaderProps {
    venueName: string;
    isDark: boolean;
    toggleTheme: () => void;
}

export function Header({ venueName, isDark, toggleTheme }: HeaderProps) {
    return (
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-[#1a1d2e] border-b border-slate-200 dark:border-[#2d3050] z-10">
            <div className="flex items-center gap-3">
                <div className="text-[28px] leading-none">🎪</div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{venueName}</h1>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Interactive Seating Map</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Legend />
                <button
                    className="flex items-center justify-center w-10 h-10 border border-slate-200 dark:border-[#2d3050] rounded-lg bg-slate-50 dark:bg-[#252840] cursor-pointer text-lg transition-all duration-150 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-400 focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2"
                    onClick={toggleTheme}
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {isDark ? '☀️' : '🌙'}
                </button>
            </div>
        </header>
    );
}

function Legend() {
    const items = [
        { label: 'Available', color: 'bg-seat-available' },
        { label: 'Selected', color: 'bg-seat-selected' },
        { label: 'Reserved', color: 'bg-seat-reserved' },
        { label: 'Sold', color: 'bg-seat-sold' },
        { label: 'Held', color: 'bg-seat-held' },
    ];

    return (
        <div className="flex gap-3 items-center max-md:hidden" role="list" aria-label="Seat status legend">
            {items.map(item => (
                <div key={item.label} className="flex items-center gap-[5px]" role="listitem">
                    <span className={`w-[10px] h-[10px] rounded-full ${item.color}`} />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                </div>
            ))}
        </div>
    );
}
