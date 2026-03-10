# Interactive Event Seating Map

This is a small **React + TypeScript** project that renders an interactive seating map for **Metropolis Arena**. The venue is scalable to handle more than **15,000 seats**, and the UI allows users to explore sections, select seats, and see a running total for their selection.

Seats can be selected either by **mouse click or keyboard navigation**, and the app limits the user to selecting **up to 8 seats** at a time. The current selection is saved in `localStorage`, so refreshing the page does not lose the chosen seats. The interface also supports **dark mode** and works on both desktop and mobile screens.

---

## Architecture & Design Notes

The seating map is rendered using **SVG** instead of Canvas. SVG works well here because every seat is a real DOM element, which makes it easier to support accessibility features like keyboard focus and ARIA labels.

To keep performance reasonable with **15k+ seats**, the rendering is intentionally lightweight. Each seat is just a small `<circle>` element, and sections are wrapped in `React.memo` so React doesn’t unnecessarily re-render large parts of the SVG tree. For seat selection lookups, a `Set<string>` is used instead of an array to keep checks fast even when the map gets large.

Zooming is implemented by updating the **SVG `viewBox`**, which keeps everything sharp regardless of the zoom level. Panning is handled with simple mouse or touch dragging.

For state management, the app uses a single `useReducer` context (`SelectionContext`). It tracks the currently selected seats and enforces the **maximum of 8 seats**. The selection is saved to `localStorage` and restored when the app loads. A small guard is used to prevent the save effect from overwriting stored data before hydration finishes.

Seat details are shown through a tooltip that is controlled via a **ref-based portal**. The tooltip updates directly in the DOM instead of triggering React state updates, which helps avoid unnecessary re-renders of the entire SVG seat map while the user moves the mouse.

---

## Running the Application

Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
pnpm build && pnpm preview
```

## Tech Stack

| Library | Purpose |
|---------|---------|
| React 19 | UI framework |
| TypeScript (strict) | Type safety |
| Tailwind CSS 3 | Utility-first styling |
| Vite 7 | Dev server & bundler |
| ESLint | Linting |
