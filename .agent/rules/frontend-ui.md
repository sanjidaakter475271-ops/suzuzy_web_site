---
description: Guidelines for building frontend UI components, pages, and handling state in Next.js (apps/portal).
globs: apps/portal/src/app/**/*,apps/portal/src/components/**/*
alwaysApply: false
---

# FRONTEND & UI GUIDELINES — Royal Suzuky (apps/portal)

The `apps/portal` is a Next.js (App Router) application. Follow these rules to keep the UI performant, maintainable, and visually consistent.

## 1. Server vs Client Components

**Default to Server Components (RSC):**
- All pages (`page.tsx`) and layouts (`layout.tsx`) should ideally be Server Components.
- Do NOT use `"use client"` at the top of a page unless absolutely necessary.
- Fetch data directly in Server Components using async/await.

**When to use Client Components (`"use client"`):**
- When relying on React state (`useState`, `useReducer`), lifecycle hooks (`useEffect`), or context.
- When handling user interactions (e.g., `onClick`, `onChange`).
- When using browser-only APIs.
- Extract client-side logic into small, dedicated components (e.g., `<SubmitButton>`, `<InteractiveChart>`) and import them into Server Components.

## 2. UI Components & Styling

**Tailwind CSS:**
- Use Tailwind for all styling.
- Avoid writing custom CSS in `.css` files unless overriding a complex third-party library.

**Shadcn UI & Reusable Components:**
- Favor using existing components in `src/components/ui` (buttons, inputs, dialogs, cards).
- Use `cn()` utility (clsx + tailwind-merge) for dynamic classNames to prevent conflicts.

**Icons:**
- Use `lucide-react` for standard icons.

## 3. Forms and Validation

**Standard Stack:**
- React Hook Form + Zod resolvers.
- Always define a Zod schema for the form data in a separate file (e.g., `schema.ts`) or outside the component.
- Display validation errors clearly next to the corresponding input fields.
- Disable submit buttons during pending states (`isSubmitting`).

## 4. Data Fetching and Mutations (Client-side)

- When fetching or mutating data from a Client Component to an API Route, always handle loading and error states.
- Use `try/catch` blocks and display errors using a toast notification system (`sonner` or `react-hot-toast`).
- On successful mutations, use `router.refresh()` to invalidate the client-side router cache and reflect updated data from Server Components.

## 5. Design Aesthetics

Follow the core design rules (as specified in your environment settings):
- **Distinctive & Premium:** Avoid generic "AI slop" aesthetics. Make it look professional.
- **Typography:** Use consistent font mappings defined in Tailwind config.
- **Color Palette:** Stick to the primary/secondary themes defined in your `tailwind.config.mjs` or CSS variables.
- **Spacing:** Be generous with negative space. Keep layouts breathable.
