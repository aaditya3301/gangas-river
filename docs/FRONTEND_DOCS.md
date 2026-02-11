# AquaGuardians Frontend Documentation

**Version:** 1.0.0  
**Framework:** Next.js 16 + React 19  
**UI Library:** shadcn/ui + Tailwind CSS  
**Created:** February 11, 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Pages & Routes](#pages--routes)
4. [Components](#components)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Running the App](#running-the-app)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js 16 App Router                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Landing   │  │   Citizen   │  │       Officials         │ │
│  │    Page     │  │   Portal    │  │        Portal           │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                      │               │
│  ┌──────┴────────────────┴──────────────────────┴─────────────┐ │
│  │                    Shared Components                        │ │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │ │
│  │  │ Button │ │  Card  │ │ Alert  │ │ Badge  │ │ Dialog │   │ │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌───────────────────────────┴───────────────────────────────┐ │
│  │                    State & Data Layer                      │ │
│  │  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐  │ │
│  │  │   Zustand    │  │  React Query  │  │   Axios API    │  │ │
│  │  │   Stores     │  │    Cache      │  │    Client      │  │ │
│  │  └──────────────┘  └───────────────┘  └────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
                 ┌─────────────────────────────┐
                 │   FastAPI Backend Server    │
                 │    http://localhost:8000    │
                 └─────────────────────────────┘
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16.1.6 (App Router) |
| React | React 19.2.3 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui |
| State Management | Zustand |
| Data Fetching | @tanstack/react-query |
| HTTP Client | Axios |
| Icons | Lucide React |
| Notifications | Sonner |

---

## Project Structure

```
frontend/
├── app/
│   ├── globals.css           # Global styles + Tailwind
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Landing page (portal selection)
│   │
│   ├── citizen/              # Citizens Portal
│   │   ├── layout.tsx        # Citizen layout with navigation
│   │   ├── page.tsx          # Citizen home dashboard
│   │   ├── safety/
│   │   │   └── page.tsx      # "Am I Safe?" GPS checker
│   │   ├── report/
│   │   │   └── page.tsx      # Community issue reporter
│   │   ├── farming/
│   │   │   └── page.tsx      # Smart farming advisory
│   │   └── alerts/
│   │       └── page.tsx      # Flood alerts viewer
│   │
│   └── official/             # Officials Portal (Command Center)
│       ├── layout.tsx        # Dark sidebar layout
│       ├── page.tsx          # Command center dashboard
│       ├── zones/
│       │   └── page.tsx      # Zone classification management
│       ├── evacuation/
│       │   └── page.tsx      # Shelter & route management
│       ├── alerts/
│       │   └── page.tsx      # Emergency alert broadcast
│       └── reports/
│           └── page.tsx      # Community reports verification
│
│   └── researcher/           # Researchers Portal (Data Lab)
│       ├── layout.tsx        # Emerald sidebar layout
│       ├── page.tsx          # Research dashboard
│       ├── data/
│       │   └── page.tsx      # Data sandbox / downloads
│       ├── api/
│       │   └── page.tsx      # API documentation
│       ├── models/
│       │   └── page.tsx      # Model lab / predictions
│       └── insights/
│           └── page.tsx      # Research insights
│
├── components/
│   ├── MapView.tsx           # Mapbox map component
│   ├── PageHeader.tsx        # Shared page header
│   ├── LoadingSkeletons.tsx  # Loading state components
│   └── ui/                   # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── skeleton.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── select.tsx
│       ├── textarea.tsx
│       └── sonner.tsx
│
├── lib/
│   ├── api.ts                # Axios client + API functions
│   ├── store.ts              # Zustand stores
│   ├── providers.tsx         # React Query provider
│   └── utils.ts              # Utility functions (cn)
│
├── public/                   # Static assets
├── .env.local               # Environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Pages & Routes

### Landing Page (`/`)

The main entry point with portal selection cards.

**Features:**
- Hero section with project branding
- Three portal cards (Citizens, Officials, Researchers)
- Feature statistics showcase
- Responsive design

### Citizens Portal (`/citizen/*`)

Mobile-first portal for general public, farmers, and riverside residents.

| Route | Component | Description |
|-------|-----------|-------------|
| `/citizen` | `page.tsx` | Home dashboard with feature cards |
| `/citizen/safety` | `safety/page.tsx` | GPS-based flood risk checker |
| `/citizen/report` | `report/page.tsx` | AI-verified community reporter |
| `/citizen/farming` | `farming/page.tsx` | Smart farming advisory (placeholder) |
| `/citizen/alerts` | `alerts/page.tsx` | Real-time flood alerts |

### Officials Portal (`/official/*`)

Command center portal for district officials, emergency responders, and administrators.

| Route | Component | Description |
|-------|-----------|-------------|
| `/official` | `page.tsx` | Command center dashboard with stats |
| `/official/zones` | `zones/page.tsx` | Zone classification tool |
| `/official/evacuation` | `evacuation/page.tsx` | Shelter & route management |
| `/official/alerts` | `alerts/page.tsx` | Emergency alert broadcast |
| `/official/reports` | `reports/page.tsx` | Community reports verification |

**Key Features:**

1. **Dashboard** - Overview with risk zones, active alerts, recent reports
2. **Zone Management** - Classify areas using GPS or manual coordinates
3. **Evacuation** - View shelters, calculate safe routes, manage capacity
4. **Alerts** - Broadcast emergency notifications via SMS/Push/Email/Sirens
5. **Reports** - Review citizen submissions with AI verification scores

### Researchers Portal (`/researcher/*`)

Data-focused portal for researchers, scientists, and data analysts.

| Route | Component | Description |
|-------|-----------|-------------|
| `/researcher` | `page.tsx` | Research dashboard with quick links |
| `/researcher/data` | `data/page.tsx` | Data sandbox for downloading datasets |
| `/researcher/api` | `api/page.tsx` | Interactive API documentation |
| `/researcher/models` | `models/page.tsx` | Model lab for testing predictions |
| `/researcher/insights` | `insights/page.tsx` | Research insights and visualizations |

**Key Features:**

1. **Dashboard** - Overview of datasets, API usage, quick start guide
2. **Data Sandbox** - Download LiDAR, DEM, GeoJSON, CSV datasets (1.7GB+)
3. **API Docs** - Interactive endpoint documentation with code examples
4. **Model Lab** - Test 3 ML models (LSTM, XGBoost, Hybrid CNN-LSTM)
5. **Insights** - Flood pattern analysis, trends, zone distributions

---

## Components

### shadcn/ui Components

Pre-built, accessible UI components from shadcn/ui:

| Component | Usage |
|-----------|-------|
| `Button` | Actions, form submissions |
| `Card` | Content containers, feature cards |
| `Input` | Text fields |
| `Textarea` | Multi-line text input |
| `Select` | Dropdown selections |
| `Alert` | Status messages, warnings |
| `Badge` | Labels, status indicators |
| `Skeleton` | Loading placeholders |
| `Dialog` | Modal dialogs |
| `Sonner` | Toast notifications |

### Custom Components

#### Citizen Layout (`app/citizen/layout.tsx`)

Provides consistent navigation for the citizens portal:

```tsx
// Features:
// - Sticky header with logo
// - Desktop navigation (horizontal)
// - Mobile navigation (hamburger menu)
// - Bottom navigation bar (mobile)
// - Responsive breakpoints
```

#### Officials Layout (`app/official/layout.tsx`)

Dark-themed sidebar navigation for the command center:

```tsx
// Features:
// - Dark sidebar (slate-900 background)
// - 5 navigation items: Dashboard, Zones, Evacuation, Alerts, Reports
// - User profile section with avatar
// - Collapsible mobile menu
// - Active state highlighting
// - System status indicator (green = operational)
```

#### Researchers Layout (`app/researcher/layout.tsx`)

Emerald-themed sidebar for the data research lab:

```tsx
// Features:
// - Emerald gradient sidebar (emerald-900 to emerald-950)
// - 5 navigation items: Dashboard, Data Sandbox, API Docs, Model Lab, Insights
// - Resources section with quick links
// - Back to home button
// - Collapsible mobile menu
// - Dataset version indicator
```

#### MapView Component (`components/MapView.tsx`)

Interactive Mapbox-powered map for flood visualization:

```tsx
// Features:
// - Mapbox GL JS integration with react-map-gl
// - Flood zone overlays (A/B/C zones with color coding)
// - Custom markers (user, shelter, alert, report types)
// - Popup on marker click
// - Navigation controls and geolocate button
// - Configurable zoom, height, and interactivity
// - Legend for flood zones
```

#### PageHeader Component (`components/PageHeader.tsx`)

Reusable page header with icon and actions:

```tsx
// Props:
// - title: string (required)
// - description?: string
// - icon?: LucideIcon
// - iconColor?: string
// - iconBgColor?: string
// - actions?: ReactNode
```

#### LoadingSkeletons Component (`components/LoadingSkeletons.tsx`)

Loading state skeletons for various layouts:

```tsx
// Types:
// - 'stats': 4-column stat cards
// - 'card': Content cards with header
// - 'list': List items with avatars
// - 'table': Table rows
// - 'map': Map placeholder with header
```

---

## State Management

### Zustand Stores (`lib/store.ts`)

#### Auth Store

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Persisted to localStorage
export const useAuthStore = create<AuthState>()(persist(...));
```

#### Location Store

```typescript
interface LocationState {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => void;
}

// GPS location management
export const useLocationStore = create<LocationState>(...);
```

**Usage:**

```tsx
// In a component
const { latitude, longitude, requestLocation } = useLocationStore();

// Request GPS location
<Button onClick={requestLocation}>Locate Me</Button>

// Access coordinates
if (latitude && longitude) {
  console.log(`Location: ${latitude}, ${longitude}`);
}
```

---

## API Integration

### API Client (`lib/api.ts`)

Centralized Axios client with interceptors:

```typescript
// Base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Functions

#### Auth API

```typescript
authAPI.register({ email, password, full_name?, phone? })
authAPI.login({ email, password })
authAPI.me()
authAPI.logout()
```

#### Safety API

```typescript
safetyAPI.check({ latitude, longitude, altitude? })
// Returns: { is_safe, risk_level, zone_type, elevation, message, recommendations }
```

#### Reports API

```typescript
reportsAPI.submit({ latitude, longitude, category, description, photo_url? })
reportsAPI.getAll({ category?, status?, limit? })
reportsAPI.getMyReports()
reportsAPI.getStats()
```

#### Predictions API

```typescript
predictAPI.flood({ latitude, longitude, rainfall_mm? })
predictAPI.heatmap(zone?)
predictAPI.simulate({ zone, water_level_rise })
```

#### Evacuation API

```typescript
evacuationAPI.getShelters({ latitude?, longitude?, radius_km? })
evacuationAPI.getRoute({ start_lat, start_lng, end_lat?, end_lng?, preference? })
```

### React Query Usage

```tsx
import { useMutation } from '@tanstack/react-query';
import { safetyAPI } from '@/lib/api';

// In component
const safetyCheck = useMutation({
  mutationFn: safetyAPI.check,
  onSuccess: (data) => {
    toast.success('Safety check complete!');
    setResult(data);
  },
  onError: (error) => {
    toast.error('Failed: ' + error.message);
  },
});

// Trigger
safetyCheck.mutate({ latitude: 25.4358, longitude: 81.8463 });
```

---

## Running the App

### Prerequisites

- Node.js 18+
- Backend server running on port 8000

### Development

```bash
cd frontend
npm install
npm run dev
```

Opens at http://localhost:3000

### Environment Variables

Create `.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Mapbox (optional)
# NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
```

### Build for Production

```bash
npm run build
npm start
```

---

## Page Implementations

### Am I Safe? (`/citizen/safety`)

**Flow:**
1. User taps "Locate Me" button
2. Browser requests GPS permission
3. Coordinates captured and displayed
4. User taps "Check Safety"
5. API call to `/api/safety/check`
6. Results displayed with risk level, zone, recommendations

**Risk Level Colors:**
- 🟢 Low: Green
- 🟡 Medium: Yellow
- 🟠 High: Orange
- 🔴 Critical: Red

### Community Reporter (`/citizen/report`)

**Flow:**
1. User enables location
2. Selects issue category (Flood, Pollution, Infrastructure, Erosion, Other)
3. Writes description (min 20 chars)
4. Optionally adds photo URL
5. Submits report
6. AI verification runs on backend
7. Results show verification score and notes

**AI Verification Checks:**
- GPS altitude vs LiDAR elevation
- Category plausibility
- Location within Ganga corridor

---

## Styling

### Tailwind Configuration

Using Tailwind CSS 4 with CSS variables for theming.

**Color Scheme:**
- Primary: Blue (`blue-600`)
- Success: Green (`green-500`)
- Warning: Yellow/Orange (`yellow-500`, `orange-500`)
- Danger: Red (`red-500`)
- Background: Gradient blue-50 to white

### Responsive Design

- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px)
- Bottom navigation on mobile
- Horizontal nav on desktop

---

## Next Steps

1. **Officials Portal** - 3D terrain viewer, zone management, emergency calls
2. **Mapbox Integration** - Interactive maps for all portals
3. **Real-time Updates** - WebSocket for live alerts
4. **PWA Support** - Offline-first capabilities
5. **Authentication UI** - Login/register pages

---

**Built for Riverathon 1.0** | AquaGuardians Team
