# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Manufacturing Execution System (MES) frontend built with Angular 21. The application manages production workflows including quality control, traceability, maintenance, master data, and production operations.

## Development Commands

### Start Development Server
```bash
ng serve
# or
npm start
```
Access at `http://localhost:4200/`

### Build
```bash
ng build                    # Production build
ng build --configuration development  # Development build
ng build --watch --configuration development  # Watch mode
```
Build artifacts stored in `dist/` directory.

### Testing
```bash
ng test                     # Run all tests with Vitest
```

### Code Generation
```bash
ng generate component component-name
ng generate service service-name
ng generate --help         # See all available schematics
```

## Architecture

### Module Organization

The application follows a **feature-based architecture** with lazy-loaded modules:

```
src/app/
├── core/                   # Core functionality (singleton services, guards, interceptors)
│   ├── auth/              # Authentication service, guard, interceptor
│   └── layout/            # Shell layouts (MainLayout, AuthLayout)
├── features/              # Feature modules (lazy-loaded)
│   ├── auth/              # Login and authentication flows
│   ├── dashboard/         # Main dashboard
│   ├── master-data/       # Master data management (machines, materials, locations, etc.)
│   ├── production/        # Production execution, orders, dispatch, WIP
│   ├── quality/           # Quality inspections, defects, severities
│   ├── maintenance/       # Maintenance management (work orders, preventive, assets)
│   ├── traceability/      # Lot tracking, genealogy, movements
│   └── reports/           # Reporting module
└── environmets/           # Environment configuration
```

### Routing Structure

- **Top-level routes**: Defined in `app.routes.ts`
- **Feature routes**: Each feature has its own `.routes.ts` file (e.g., `quality.routes.ts`)
- **Lazy loading**: All features use `loadChildren` or `loadComponent` for code splitting
- **Shell components**: Each major feature has a `-shell` component that acts as a layout wrapper for sub-routes

Example feature routing pattern:
```typescript
// In app.routes.ts
{
  path: 'quality',
  loadChildren: () => import('./features/quality/quality.routes').then(m => m.QUALITY_ROUTES)
}

// In quality.routes.ts
export const QUALITY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./quality-shell/quality-shell').then(m => m.QualityShellComponent),
    children: [...]
  }
];
```

### State Management

**Service-based state pattern** (no NgRx):
- Each feature module has a `*-store.service.ts` for local state management
- Examples: `quality-store.service.ts`, `maintenance-store.service.ts`, `traceability-store.service.ts`
- Stores maintain in-memory collections and provide helper methods
- Services are `providedIn: 'root'` for singleton behavior

### Authentication

- **Service**: `core/auth/auth.service.ts`
- **Guard**: `core/auth/auth-guard.ts` (currently commented out in routes)
- **Interceptor**: `core/auth/auth-interceptor.ts` (configured in `app.config.ts`)
- **Token storage**: Uses `localStorage` for JWT tokens
- **Auth flow**: Login → Store token → Add token to HTTP requests via interceptor

### API Integration

- Base API URL configured in `src/environmets/environments.ts`
- Default: `http://localhost:3000`
- HTTP client configured in `app.config.ts` with interceptors
- Follow the pattern in `auth.service.ts` for new API services

## Technology Stack

- **Framework**: Angular 21 (standalone components)
- **UI Styling**: Tailwind CSS + PrimeIcons
- **Charts**: Chart.js with ng2-charts
- **Testing**: Vitest
- **Package Manager**: npm 11.7.0
- **TypeScript**: 5.9.2 with strict mode enabled

## Code Standards

### TypeScript Configuration
- **Strict mode** is enabled (`strict: true`)
- Additional strictness: `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Target: ES2022

### Formatting
- **Prettier** is configured with:
  - Print width: 100
  - Single quotes: true
  - Angular parser for HTML files

### Component Naming
- Use standalone components (Angular 21 default)
- Prefix: `app` (configured in `angular.json`)
- Follow Angular naming conventions: `feature-name.component.ts`

## Feature-Specific Notes

### Quality Module
- Manages defect families, severities, defects, and inspections
- Score calculation logic in `quality-store.service.ts`
- Inspection results: PASS, FAIL, HOLD (based on severity points)

### Master Data Module
Manages core entities:
- Machines, Materials, Locations, Processes
- Products, Operators, Shifts
- UOMs (Units of Measurement)
- Downtime Reasons, Suppliers

### Production Module
Key sub-modules:
- Execution, Orders, Dispatch
- Production Board
- Times tracking
- WIP (Work in Progress)

### Traceability Module
Features:
- Lot and serial tracking
- Genealogy and audit trails
- Warehouse mapping
- Movements and quarantine
- Label management

### Maintenance Module
Components:
- Work orders and preventive maintenance
- Asset management
- Maintenance calendar
- Downtime tracking
- Intervention history
- Inventory management

## Environment Configuration

Currently using a single environment file at `src/environmets/environments.ts`. Update the `apiUrl` for different backend endpoints.

## Bundle Budgets

Production build budgets (in `angular.json`):
- Initial: Max 1MB (warning at 500kB)
- Component styles: Max 8kB (warning at 4kB)

## Key Files

- `src/app/app.config.ts` - Application-level configuration and providers
- `src/app/app.routes.ts` - Top-level routing configuration
- `angular.json` - Angular CLI configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript compiler options
