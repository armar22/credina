# Credina Product Portfolio

A collection of Dribbble-style design shots showcasing our fintech product suite for micro-lending operations.

---

## Mobile Applications

### Credina Officer App
**Role:** Field Officer Mobile Application  
**Platform:** Flutter (iOS & Android)  
**Purpose:** Enable field officers to manage members, process loan applications, conduct verifications, and track collections on-the-go.

![Credina Officer - Dashboard](./docs/images/credina-officer-dashboard.png)

#### Key Screens

| Screen | Description |
|--------|-------------|
| **Dashboard** | Overview stats, quick actions, recent applications |
| **Member List** | Searchable member directory with status badges |
| **Member Detail** | Full profile, loan history, verification status |
| **Loan Application** | Multi-step form with product selection |
| **Loan Detail** | Complete loan info with timeline & credit assessment |
| **Collections** | Installment tracking with payment recording |
| **Verifications** | Field verification checklist with GPS capture |
| **Profile** | Officer info, settings, logout |

---

### Credina Officer App - Design System

**Color Palette:**
- Primary: Royal Blue `#3B82F6`
- Success: Emerald `#10B981`
- Warning: Amber `#F59E0B`
- Error: Red `#EF4444`
- Background: Off-white `#F8FAFC`
- Surface: White `#FFFFFF`

**Typography:**
- Font: Plus Jakarta Sans
- Headlines: Bold (800), tight letter-spacing
- Body: Regular/Medium (500-600)
- Captions: Light grey `#6B7280`

**Components:**
- 24px border radius on cards
- Soft shadows (2% opacity)
- Tinted icon containers
- Floating action buttons

---

## Web Applications

### Credina Admin Dashboard
**Role:** Administrative Web Application  
**Platform:** Next.js 16 (App Router)  
**Purpose:** Central hub for administrators to manage users, branches, products, applications, and view analytics.

![Credina Admin - Dashboard](./docs/images/credina-admin-dashboard.png)

#### Key Screens

| Screen | Description |
|--------|-------------|
| **Dashboard** | KPI cards, charts, recent activity |
| **Members** | Search, filter, CRUD operations |
| **Applications** | Kanban-style pipeline management |
| **Loans** | Active loans with amortization |
| **Collections** | Payment tracking & overdue management |
| **Verifications** | Field verification approvals |
| **Products** | Loan product configuration |
| **Branches** | Regional office management |
| **Users** | Admin user management |
| **Reports** | Analytics & exportable reports |
| **Settings** | System configuration |

---

### Credina Admin - Design System

**Tech Stack:**
- Next.js 16 (App Router)
- React 19 with Server Components
- Tailwind CSS v4
- Radix UI + Shadcn UI
- Zustand (State)
- TanStack Query (Data)
- Recharts (Analytics)

**Theme:**
- Light/Dark mode support
- Royal Blue primary (#3B82F6)
- OKLCH color system
- Premium fintech aesthetic
- Container queries for widgets

**Components:**
- Sidebar navigation
- Data tables with sorting/filtering
- Modal dialogs
- Toast notifications (Sonner)
- Form components with validation

---

## Brand Guidelines

### Logo Usage

```
Primary Logo: Credina (Wordmark)
Icon: Wallet with checkmark motif
Tagline: "Micro Loan & Financing"
```

### Application Names

| Product | Description |
|---------|-------------|
| **Credina** | Parent brand |
| **Credina Officer** | Mobile app for field officers |
| **Credina Admin** | Web dashboard for administrators |
| **Credina API** | Backend services |

---

## Placeholder Image References

When updating this document with actual screenshots, place images in:

```
applications/
├── credina-admin/
│   └── public/
│       └── images/
│           ├── credina-admin-dashboard.png
│           ├── credina-admin-members.png
│           └── credina-admin-settings.png
└── kopi-mas-officer/
    └── assets/
        └── images/
            ├── credina-officer-dashboard.png
            ├── credina-officer-members.png
            └── credina-officer-loans.png
```

### Recommended Screenshot Specs

- **Mobile:** 375x812px (iPhone X frame) or 1080x1920px
- **Web:** 1440x900px desktop view
- **Format:** PNG with transparent corners where applicable
- **Annotations:** Use subtle red circles/arrows for key elements

---

*Last updated: March 2026*
