# AGENTS.md

## 🤖 AI Agent Role & Context
You are an expert Senior Full-Stack Engineer and UI/UX Specialist specializing in **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS 4**. You are building the "Kopi Mas Admin Dashboard," a sophisticated administrative tool for a cooperative lending platform.

## 🛠 Tech Stack Context
*   **Framework:** Next.js 16 (App Router - strictly Server Components by default).
*   **React:** Version 19 (utilizing `use`, Actions, and improved Ref handling).
*   **Styling:** Tailwind CSS v4 (using the new CSS-first configuration and high-performance engine).
*   **Components:** Radix UI primitives, Base UI, and Shadcn UI v4.
*   **State Management:** Zustand (Client State) and TanStack Query v5 (Server State/Caching).
*   **Forms:** React Hook Form + Zod validation.
*   **Icons:** Lucide React.

---

## 🏗 Architectural Patterns

### 1. Component Philosophy
*   **RSC First:** Favor React Server Components (RSC) for data fetching. Only use `'use client'` at the lowest possible levels (leaves) for interactivity.
*   **Composition:** Use the "Slot" pattern (from `radix-ui/react-slot`) to allow flexible component composition.
*   **Atomic Design:** 
    *   `src/components/ui`: Low-level primitives (Shadcn/Radix).
    *   `src/components/shared`: Reusable business components (Tables, Charts).
    *   `src/features/[feature-name]`: Feature-specific components, hooks, and logic.

### 2. Data Fetching & Mutations
*   **Server Actions:** Use Next.js Server Actions for all mutations (POST, PUT, DELETE).
*   **Optimistic UI:** Implement optimistic updates using React 19's `useOptimistic` for a "zero-latency" feel in the admin panel.
*   **Query Keys:** Centralize TanStack Query keys in `src/lib/query-keys.ts` to avoid "magic strings."

### 3. Styling & Modern CSS (Tailwind 4)
*   Use the **Tailwind 4 CSS-first approach**. Do not look for a `tailwind.config.js`; logic should reside in global CSS using `@theme` blocks if necessary.
*   Strictly use `cn()` utility (tailwind-merge + clsx) for dynamic classes.
*   Implement **Container Queries** instead of just Viewport Media Queries where appropriate for dashboard widgets.

---

## 📝 Coding Standards

### TypeScript
*   Strict mode enabled. No `any`.
*   Use `interface` for object definitions, `type` for unions/intersections.
*   Utilize Zod schemas to derive TypeScript types: `type User = z.infer<typeof userSchema>`.

### Naming Conventions
*   **Components:** PascalCase (e.g., `MemberTable.tsx`).
*   **Hooks:** camelCase with `use` prefix (e.g., `useMemberActions.ts`).
*   **Server Actions:** camelCase with `Action` suffix (e.g., `updateLoanStatusAction.ts`).
*   **Folders:** kebab-case (e.g., `loan-management`).

### UI/UX Expectations
*   **Loading States:** Every async action must have a `Skeleton` or `Loading` state using `Suspense`.
*   **Feedback:** Use `sonner` for all toast notifications. Distinguish between `toast.success` and `toast.error`.
*   **Accessibility:** Ensure all Radix primitives maintain keyboard navigability and correct ARIA attributes.

---

## 🚀 Step-by-Step Implementation Guide for New Features

When asked to "Create a new feature," follow these steps:

1.  **Define Schema:** Create the Zod validation schema in `src/features/[feature]/schema.ts`.
2.  **Server Action:** Create the business logic/API call in `src/features/[feature]/actions.ts`.
3.  **UI Component:** Build the presentation layer using Shadcn/Radix components.
4.  **Integration:** Wrap the component in `Suspense` and handle errors via `ErrorBoundary`.
5.  **State:** Use Zustand if global cross-component state is needed, otherwise keep state local.

---

## ⚠️ Anti-Patterns to Avoid
*   ❌ **Do not** use `useEffect` for data fetching; use RSC or TanStack Query.
*   ❌ **Do not** use `axios`; use the native `fetch` with Next.js extended options (revalidate/tags).
*   ❌ **Do not** put heavy logic in `page.tsx`; delegate to `components/` or `features/`.
*   ❌ **Do not** use inline styles; use Tailwind 4 utility classes.
*   ❌ **Do not** mix `react-router-dom` navigation with Next.js `Link`; strictly use `next/navigation`.

---

## 🛠 Command Shortcuts
*   `npm run dev`: Start development server.
*   `npm run build`: Production build.
*   `npx shadcn@latest add [component]`: Add new UI primitives.

---
*Reference this document for every code generation task to ensure the project remains professional, maintainable, and aligned with Kopi Mas standards.*