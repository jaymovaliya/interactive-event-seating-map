import { useSelection } from '../hooks/useSelection';
import { PRICE_TIERS, MAX_SELECTION } from '../types/venue';

export function SelectionSummary() {
    const { selectedSeats, selectedSeatIds, seatSectionMap, seatRowMap, removeSeat, clearSelection, subtotal } =
        useSelection();

    return (
        <aside
            className="w-[360px] max-md:w-full max-md:max-h-[40vh] max-md:border-t max-md:border-l-0 bg-white dark:bg-[#1a1d2e] border-l border-slate-200 dark:border-[#2d3050] flex flex-col overflow-y-auto flex-shrink-0"
            aria-label="Selected seats summary"
        >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-[#232645]">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Your Selection</h2>
                <span className="text-[13px] font-semibold text-indigo-500 bg-indigo-500/10 px-[10px] py-[3px] rounded-full">
                    {selectedSeatIds.size} / {MAX_SELECTION}
                </span>
            </div>

            {selectedSeats.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 text-center">
                    <div className="text-5xl mb-4 opacity-80">🎫</div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Click on available seats to select them</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 opacity-70">You can select up to {MAX_SELECTION} seats</p>
                </div>
            ) : (
                <>
                    <ul className="list-none flex-1 overflow-y-auto py-2">
                        {selectedSeats.map((seat, idx) => {
                            const sectionLabel = seatSectionMap.get(seat.id) ?? '';
                            const rowIndex = seatRowMap.get(seat.id) ?? 0;
                            const price = PRICE_TIERS[seat.priceTier] ?? 0;
                            return (
                                <li
                                    key={seat.id}
                                    className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[#232645] transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-[#252840] animate-slide-in"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-7 h-7 flex items-center justify-center bg-indigo-500/10 text-indigo-500 text-[11px] font-bold rounded-full">
                                            #{idx + 1}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{sectionLabel}</span>
                                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                Row {rowIndex}, Seat {seat.col}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-[10px]">
                                        <span className="text-sm font-bold text-indigo-500">${price}</span>
                                        <button
                                            className="flex items-center justify-center w-6 h-6 border-none bg-transparent text-slate-400 cursor-pointer rounded text-xs transition-all duration-150 hover:bg-red-500/15 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2"
                                            onClick={() => removeSeat(seat.id)}
                                            aria-label={`Remove seat ${seat.id}`}
                                            title="Remove"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="px-5 py-4 border-t border-slate-200 dark:border-[#2d3050] flex flex-col gap-[10px]">
                        <div className="flex justify-between items-center font-semibold text-sm text-slate-900 dark:text-slate-100">
                            <span>Subtotal</span>
                            <span className="text-[22px] font-extrabold text-indigo-500">${subtotal}</span>
                        </div>
                        <button
                            className="py-[10px] border border-slate-200 dark:border-[#2d3050] rounded-lg bg-transparent text-slate-500 dark:text-slate-400 text-[13px] font-semibold cursor-pointer transition-all duration-150 hover:border-red-500 hover:text-red-500 hover:bg-red-500/[0.08] focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2 font-sans"
                            onClick={clearSelection}
                            aria-label="Clear all selected seats"
                        >
                            Clear All
                        </button>
                        <button
                            className="py-3 border-none rounded-lg bg-indigo-500 text-white text-sm font-bold cursor-pointer transition-all duration-150 tracking-[0.3px] hover:bg-indigo-600 hover:shadow-[0_4px_12px_rgba(99,102,241,0.35)] focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2 font-sans"
                            aria-label="Proceed to checkout"
                        >
                            Checkout →
                        </button>
                    </div>
                </>
            )}
        </aside>
    );
}
