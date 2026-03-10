import { memo, useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Venue, Seat, Section } from '../types/venue';
import { PRICE_TIERS } from '../types/venue';
import { useSelection } from '../hooks/useSelection';

const STATUS_COLORS: Record<string, string> = {
    available: '#4ade80',
    reserved: '#fbbf24',
    sold: '#94a3b8',
    held: '#f87171',
};

const STATUS_COLORS_DARK: Record<string, string> = {
    available: '#34d399',
    reserved: '#f59e0b',
    sold: '#64748b',
    held: '#ef4444',
};

const SELECTED_COLOR = '#6366f1';
const SELECTED_COLOR_DARK = '#818cf8';
const SELECTED_STROKE = '#4f46e5';
const SELECTED_STROKE_DARK = '#a5b4fc';

const STAGE_PAD_X = 300;
const STAGE_PAD_Y = 200;


interface SeatCircleProps {
    seat: Seat;
    isSelected: boolean;
    sectionLabel: string;
    rowIndex: number;
    isDark: boolean;
    onSeatClick: (seat: Seat, sectionLabel: string, rowIndex: number) => void;
    onSeatHover: (seat: Seat, sectionLabel: string, rowIndex: number, element: SVGCircleElement) => void;
    onSeatBlur: () => void;
}

const SeatCircle = memo(function SeatCircle({
    seat,
    isSelected,
    sectionLabel,
    rowIndex,
    isDark,
    onSeatClick,
    onSeatHover,
    onSeatBlur,
}: SeatCircleProps) {
    const isInteractive = seat.status === 'available' || isSelected;
    const colors = isDark ? STATUS_COLORS_DARK : STATUS_COLORS;
    const fill = isSelected
        ? (isDark ? SELECTED_COLOR_DARK : SELECTED_COLOR)
        : (colors[seat.status] ?? colors.available);
    const stroke = isSelected ? (isDark ? SELECTED_STROKE_DARK : SELECTED_STROKE) : 'transparent';
    const price = PRICE_TIERS[seat.priceTier] ?? 0;

    const handleClick = useCallback(() => {
        if (isInteractive) onSeatClick(seat, sectionLabel, rowIndex);
    }, [seat, sectionLabel, rowIndex, isInteractive, onSeatClick]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (isInteractive) {
                    e.preventDefault();
                    onSeatClick(seat, sectionLabel, rowIndex);
                }
                return;
            }

            // Arrow key navigation
            let nextCol = seat.col;
            let nextRow = rowIndex;

            switch (e.key) {
                case 'ArrowLeft':
                    nextCol -= 1;
                    break;
                case 'ArrowRight':
                    nextCol += 1;
                    break;
                case 'ArrowUp':
                    nextRow -= 1;
                    break;
                case 'ArrowDown':
                    nextRow += 1;
                    break;
                default:
                    return;
            }

            e.preventDefault();

            const sectionId = sectionLabel.split(' ').pop();
            const colStr = nextCol.toString().padStart(2, '0');
            const nextSeatId = `${sectionId}-${nextRow}-${colStr}`;
            const nextSeatEl = document.querySelector(`[data-seat-id="${nextSeatId}"]`) as SVGCircleElement | null;
            if (nextSeatEl) {
                nextSeatEl.focus();
            }
        },
        [seat, sectionLabel, rowIndex, isInteractive, onSeatClick]
    );

    const handleFocus = useCallback(
        (e: React.FocusEvent<SVGCircleElement>) => {
            onSeatHover(seat, sectionLabel, rowIndex, e.currentTarget);
        },
        [seat, sectionLabel, rowIndex, onSeatHover]
    );

    const handleMouseEnter = useCallback(
        (e: React.MouseEvent<SVGCircleElement>) => {
            onSeatHover(seat, sectionLabel, rowIndex, e.currentTarget);
        },
        [seat, sectionLabel, rowIndex, onSeatHover]
    );

    return (
        <circle
            cx={seat.x}
            cy={seat.y}
            r={5}
            fill={fill}
            stroke={stroke}
            strokeWidth={isSelected ? 1.5 : 0}
            className={`seat-circle ${isInteractive ? 'seat-interactive' : 'seat-disabled'}`}
            role="button"
            tabIndex={isInteractive ? 0 : -1}
            aria-label={`${sectionLabel}, Row ${rowIndex}, Seat ${seat.col}, $${price}, ${isSelected ? 'selected' : seat.status}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onSeatBlur}
            onBlur={onSeatBlur}
            data-seat-id={seat.id}
        />
    );
});

/* ───── SectionGroup ───── */

interface SectionGroupProps {
    section: Section;
    selectedSeatIds: Set<string>;
    isDark: boolean;
    onSeatClick: (seat: Seat, sectionLabel: string, rowIndex: number) => void;
    onSeatHover: (seat: Seat, sectionLabel: string, rowIndex: number, element: SVGCircleElement) => void;
    onSeatBlur: () => void;
}

const SectionGroup = memo(function SectionGroup({
    section,
    selectedSeatIds,
    isDark,
    onSeatClick,
    onSeatHover,
    onSeatBlur,
}: SectionGroupProps) {
    const isLeft = section.id === 'A' || section.id === 'C' || section.id === 'E' || section.id === 'G';
    const isTop = section.id === 'A' || section.id === 'B' || section.id === 'E' || section.id === 'F';

    const dx = isLeft ? -150 : 150;
    const dy = isTop ? -50 : 50;

    return (
        <g
            transform={`translate(${section.transform.x + dx}, ${section.transform.y + dy})`}
            aria-label={section.label}
        >
            <text
                x={section.rows[0]?.seats[0]?.x ?? 0}
                y={(section.rows[0]?.seats[0]?.y ?? 0) - 10}
                className="section-label"
                fontSize="10"
                fill={isDark ? '#8b8fac' : '#6b7194'}
                fontWeight="600"
            >
                {section.label}
            </text>
            {section.rows.map(row =>
                row.seats.map(seat => (
                    <SeatCircle
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeatIds.has(seat.id)}
                        sectionLabel={section.label}
                        rowIndex={row.index}
                        isDark={isDark}
                        onSeatClick={onSeatClick}
                        onSeatHover={onSeatHover}
                        onSeatBlur={onSeatBlur}
                    />
                ))
            )}
        </g>
    );
});

interface TooltipData {
    sectionLabel: string;
    rowIndex: number;
    col: number;
    price: number;
    status: string;
    isSelected: boolean;
}

function formatTooltipHTML(d: TooltipData): string {
    const statusLabel = d.isSelected
        ? 'Selected'
        : d.status.charAt(0).toUpperCase() + d.status.slice(1);

    const badgeColors: Record<string, string> = {
        available: 'background:rgba(74,222,128,0.2);color:#4ade80',
        selected: 'background:rgba(99,102,241,0.2);color:#818cf8',
        reserved: 'background:rgba(251,191,36,0.2);color:#fbbf24',
        sold: 'background:rgba(148,163,184,0.2);color:#94a3b8',
        held: 'background:rgba(248,113,113,0.2);color:#f87171',
    };
    const badgeStyle = badgeColors[d.isSelected ? 'selected' : d.status] ?? '';

    return `
        <div style="font-weight:600;font-size:13px;margin-bottom:4px;color:#818cf8">${d.sectionLabel}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:12px">
            <span>Row ${d.rowIndex}, Seat ${d.col}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:12px;margin-top:2px">
            <span style="font-weight:700;font-size:14px">$${d.price}</span>
            <span style="${badgeStyle};font-size:11px;font-weight:600;padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px">${statusLabel}</span>
        </div>
    `;
}

interface SeatingMapProps {
    venue: Venue;
    isDark?: boolean;
}

export function SeatingMap({ venue }: SeatingMapProps) {
    const { selectedSeatIds, toggleSeat } = useSelection();
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Detect dark mode from DOM
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const mapW = venue.map.width + STAGE_PAD_X;
    const mapH = venue.map.height + STAGE_PAD_Y;
    const dataCenterX = venue.map.width / 2;
    const dataCenterY = venue.map.height / 2;

    const [scale, setScale] = useState(1);
    const [viewCenter, setViewCenter] = useState({ x: dataCenterX, y: dataCenterY });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0, cx: 0, cy: 0 });

    const viewBox = useMemo(() => {
        const vw = mapW / scale;
        const vh = mapH / scale;
        const vx = viewCenter.x - vw / 2;
        const vy = viewCenter.y - vh / 2;
        return `${vx} ${vy} ${vw} ${vh}`;
    }, [scale, viewCenter, mapW, mapH]);

    const handleSeatClick = useCallback(
        (seat: Seat, sectionLabel: string, rowIndex: number) => {
            toggleSeat(seat, sectionLabel, rowIndex);
        },
        [toggleSeat]
    );

    const handleSeatHover = useCallback(
        (seat: Seat, sectionLabel: string, rowIndex: number, element: SVGCircleElement) => {
            const tip = tooltipRef.current;
            if (!tip) return;
            const rect = element.getBoundingClientRect();
            tip.style.left = `${rect.left + rect.width / 2}px`;
            tip.style.top = `${rect.top - 10}px`;
            tip.style.display = 'block';
            tip.innerHTML = formatTooltipHTML({
                sectionLabel,
                rowIndex,
                col: seat.col,
                price: PRICE_TIERS[seat.priceTier] ?? 0,
                status: seat.status,
                isSelected: selectedSeatIds.has(seat.id),
            });
        },
        [selectedSeatIds]
    );

    const handleSeatBlur = useCallback(() => {
        const tip = tooltipRef.current;
        if (tip) tip.style.display = 'none';
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            setScale(prev => Math.min(Math.max(prev * factor, 0.3), 5));
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (e.button !== 0) return;
            const target = e.target as HTMLElement;
            if (target.classList.contains('seat-circle')) return;
            setIsPanning(true);
            panStart.current = { x: e.clientX, y: e.clientY, cx: viewCenter.x, cy: viewCenter.y };
        },
        [viewCenter]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!isPanning) return;
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const vw = mapW / scale;
            const vh = mapH / scale;
            const dx = ((e.clientX - panStart.current.x) / rect.width) * vw;
            const dy = ((e.clientY - panStart.current.y) / rect.height) * vh;

            setViewCenter({
                x: panStart.current.cx - dx,
                y: panStart.current.cy - dy,
            });
        },
        [isPanning, scale, mapW, mapH]
    );

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    const lastTouchDistance = useRef<number | null>(null);
    const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            if (e.touches.length === 1) {
                const target = e.target as HTMLElement;
                if (target.classList.contains('seat-circle')) return;
                setIsPanning(true);
                panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, cx: viewCenter.x, cy: viewCenter.y };
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDistance.current = Math.hypot(dx, dy);
                lastTouchCenter.current = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
                };
            }
        },
        [viewCenter]
    );

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (e.touches.length === 1 && isPanning) {
                const container = containerRef.current;
                if (!container) return;
                const rect = container.getBoundingClientRect();
                const vw = mapW / scale;
                const vh = mapH / scale;
                const dx = ((e.touches[0].clientX - panStart.current.x) / rect.width) * vw;
                const dy = ((e.touches[0].clientY - panStart.current.y) / rect.height) * vh;
                setViewCenter({
                    x: panStart.current.cx - dx,
                    y: panStart.current.cy - dy,
                });
            } else if (e.touches.length === 2 && lastTouchDistance.current !== null) {
                e.preventDefault();
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.hypot(dx, dy);
                const ratio = distance / lastTouchDistance.current;
                setScale(prev => Math.min(Math.max(prev * ratio, 0.3), 5));
                lastTouchDistance.current = distance;
            }
        },
        [isPanning, scale, mapW, mapH]
    );

    const handleTouchEnd = useCallback(() => {
        setIsPanning(false);
        lastTouchDistance.current = null;
        lastTouchCenter.current = null;
    }, []);

    const handleResetZoom = useCallback(() => {
        setScale(1);
        setViewCenter({ x: dataCenterX, y: dataCenterY });
    }, [dataCenterX, dataCenterY]);

    const stageTextColor = isDark ? '#818cf8' : '#6366f1';
    const stageBorder = isDark ? 'rgba(129,140,248,0.5)' : 'rgba(99,102,241,0.5)';

    return (
        <div className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-[#0f1117] min-w-0">
            <div className="absolute bottom-5 left-5 flex flex-col gap-1 z-[5]">
                {[
                    { label: 'Zoom in', text: '+', action: () => setScale(prev => Math.min(prev * 1.2, 5)) },
                    { label: 'Zoom out', text: '−', action: () => setScale(prev => Math.max(prev * 0.8, 0.3)) },
                    { label: 'Reset zoom', text: '⟲', action: handleResetZoom },
                ].map(btn => (
                    <button
                        key={btn.label}
                        className="flex items-center justify-center w-9 h-9 border border-slate-200 dark:border-[#2d3050] rounded-lg bg-white dark:bg-[#1a1d2e] text-slate-900 dark:text-slate-100 text-lg cursor-pointer shadow-sm transition-all duration-150 leading-none hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-400 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2"
                        onClick={btn.action}
                        aria-label={btn.label}
                        title={btn.label}
                    >
                        {btn.text}
                    </button>
                ))}
            </div>

            <div className="absolute bottom-5 right-5 z-[5] text-xs font-semibold text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-[#1a1d2e]/80 backdrop-blur-sm px-2 py-1 rounded-md border border-slate-200 dark:border-[#2d3050]">
                {Math.round(scale * 100)}%
            </div>

            <div
                ref={containerRef}
                className={`w-full h-full overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <svg
                    viewBox={viewBox}
                    className="w-full h-full"
                    role="img"
                    aria-label={`Seating map for ${venue.name}`}
                    style={{ shapeRendering: 'geometricPrecision' }}
                >
                    {venue.sections.map(section => (
                        <SectionGroup
                            key={section.id}
                            section={section}
                            selectedSeatIds={selectedSeatIds}
                            isDark={isDark}
                            onSeatClick={handleSeatClick}
                            onSeatHover={handleSeatHover}
                            onSeatBlur={handleSeatBlur}
                        />
                    ))}

                    <rect
                        x={dataCenterX - 140}
                        y={dataCenterY - 52}
                        width={280}
                        height={104}
                        rx={20}
                        fill={isDark ? '#0f1117' : '#f8fafc'}
                    />
                    <rect
                        x={dataCenterX - 80}
                        y={dataCenterY - 40}
                        width={240}
                        height={80}
                        rx={16}
                        fill={isDark ? '#1a1d2e' : '#eef2ff'}
                        stroke={stageBorder}
                        strokeWidth={2}
                    />
                    <text
                        x={dataCenterX + 40}
                        y={dataCenterY + 6}
                        textAnchor="middle"
                        fontSize="18"
                        fontWeight="700"
                        fill={stageTextColor}
                        letterSpacing="3"
                    >
                        STAGE
                    </text>
                </svg>
            </div>

            {createPortal(
                <div
                    ref={tooltipRef}
                    className="fixed -translate-x-1/2 -translate-y-full px-[14px] py-[10px] bg-slate-900/95 dark:bg-[#252840]/97 text-white rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.25)] pointer-events-none z-[100] min-w-[160px] backdrop-blur-sm"
                    role="tooltip"
                    style={{ display: 'none' }}
                />,
                document.body
            )}
        </div>
    );
}
