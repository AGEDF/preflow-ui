# Preflow UI - Phase 1: Foundation

## Overview

This is the frontend UI for Preflow, a DAG-based ML preprocessing orchestration engine. This phase establishes the foundational structure, routing, theming, and provider setup.

## Phase 1 Deliverables ✅

### 1. Project Initialization ✅
- Created `preflow-ui/` folder alongside `preflow-engine/` and `preflow-worker/`
- Initialized with Vite + React 18 + TypeScript
- Configured Tailwind CSS for utility-first styling
- Installed core dependencies

### 2. Folder Structure ✅
Following the architecture in `preflow_UI.md` Part 2:
```
src/
├── components/          # React components
│   ├── common/          # Header, Sidebar, Layout
│   ├── DAGEditor/       # (Phase 2)
│   ├── NodePalette/     # (Phase 2)
│   ├── JobMonitor/      # (Phase 3-4)
│   └── DatasetUpload/   # (Phase 3)
├── pages/               # Route pages (5 pages)
├── services/api/        # API client layer
├── hooks/               # Custom React hooks
├── queries/             # TanStack Query definitions
├── stores/              # Zustand stores (client state)
├── types/               # TypeScript interfaces
├── utils/               # Utility functions
└── styles/              # Global CSS + Tailwind
```

### 3. Routing Skeleton ✅
5 main routes implemented:
- `/` - Home page (welcome/dashboard)
- `/workflows` - Workflow management (Phase 2 will build editor)
- `/datasets` - Dataset upload/management (Phase 3)
- `/jobs` - Job execution monitoring (Phase 3-4)
- `/*` - 404 Not Found

Layout structure:
- Header with navigation and theme toggle
- Sidebar navigation (collapsible)
- Main content area with page-specific content

### 4. Provider Setup ✅
- **TanStack Query**: Server state management (auto-caching, refetching, deduplication)
- **Zustand**: Client state management (UI selections, sidebar state, dark mode)
- **Material-UI**: Theme provider with light/dark mode support
- **React Router**: Client-side routing with nested layouts

### 5. API Layer ✅
Implemented API client modules:
- `services/api/axios.ts` - Axios instance with interceptors
- `services/api/workflowApi.ts` - Workflow CRUD operations
- `services/api/jobApi.ts` - Job execution endpoints
- `services/api/datasetApi.ts` - Dataset upload/management
- `services/api/nodeDefinitionApi.ts` - Available transformations

All API functions align with backend contracts from `CLAUDE.md`.

### 6. Query Definitions ✅
TanStack Query hooks for:
- `workflowQueries.ts` - Get workflows
- `jobQueries.ts` - Get job status
- `nodeDefinitionQueries.ts` - Get available transformations

### 7. State Management ✅
Zustand store (`stores/uiStore.ts`):
- `selectedNodeId` - Currently selected node
- `selectedWorkflowId` - Currently selected workflow
- `sidebarOpen` - Sidebar visibility toggle
- `darkMode` - Theme preference

### 8. TypeScript Types ✅
Type definitions for core entities:
- `Workflow`, `Node`, `Edge`
- `Dataset`, `Job`, `JobExecution`
- `NodeDefinition` (available transformations)
- API response wrappers

### 9. Styling ✅
- Tailwind CSS configured (`tailwind.config.js`, `postcss.config.js`)
- Global styles (`src/styles/globals.css`)
- Responsive design utilities
- CSS Scrollbar customization

### 10. Configuration ✅
- `src/config.ts` - API URLs, timeouts, constants
- `.env.example` - Environment variables documentation
- TypeScript strict mode enabled

## Files Created/Modified

### New Files
- `src/App.tsx` - Main app with routing and providers
- `src/config.ts` - Configuration
- `src/types/index.ts` - TypeScript types
- `src/services/api/axios.ts` - Axios client
- `src/services/api/workflowApi.ts` - Workflow API
- `src/services/api/jobApi.ts` - Job API
- `src/services/api/datasetApi.ts` - Dataset API
- `src/services/api/nodeDefinitionApi.ts` - Node definition API
- `src/queries/workflowQueries.ts` - Workflow queries
- `src/queries/jobQueries.ts` - Job queries
- `src/queries/nodeDefinitionQueries.ts` - Node definition queries
- `src/stores/uiStore.ts` - UI state management
- `src/components/common/Header.tsx` - Top navigation
- `src/components/common/Sidebar.tsx` - Left sidebar
- `src/components/common/Layout.tsx` - Layout wrapper
- `src/pages/Home.tsx` - Home page
- `src/pages/Workflows.tsx` - Workflows page
- `src/pages/Datasets.tsx` - Datasets page
- `src/pages/Jobs.tsx` - Jobs page
- `src/pages/NotFound.tsx` - 404 page
- `src/styles/globals.css` - Global styles
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration
- `.env.example` - Environment variables template

### Modified Files
- `package.json` - Added dependencies

## Installed Dependencies

**Runtime**:
- `@tanstack/react-query@^5.x` - Server state management
- `zustand@^4.x` - Client state management
- `@mui/material@^6.x` - Component library
- `@mui/icons-material@^6.x` - Icon library
- `@emotion/react@^11.x` - CSS-in-JS (MUI requirement)
- `@emotion/styled@^11.x` - Styled components
- `react-router-dom@^6.x` - Client routing
- `axios@^1.x` - HTTP client
- `tailwindcss@^3.x` - Utility CSS

**Dev**:
- `@vitejs/plugin-react@^6.x` - React plugin for Vite
- `typescript@^5.x` - TypeScript compiler
- `tailwindcss@^3.x` - Tailwind CSS
- `postcss@^8.x` - CSS processing
- `autoprefixer@^10.x` - Browser prefixes

## Backend Integration Notes

### API Endpoints Expected
These align with `CLAUDE.md` backend contracts:

**Workflows**:
- `POST /workflows` - Create workflow
- `GET /workflows` - List workflows
- `GET /workflows/{id}` - Get workflow
- `PUT /workflows/{id}` - Update workflow
- `POST /workflows/{id}/nodes` - Add node
- `POST /workflows/{id}/edges` - Add edge

**Jobs**:
- `POST /workflows/{id}/execute` - Start job
- `GET /jobs/{id}` - Get job status
- `GET /workflows/{id}/jobs` - List jobs for workflow

**Datasets**:
- `POST /datasets/upload` - Upload dataset (FormData)
- `GET /datasets` - List datasets
- `GET /datasets/{id}` - Get dataset details
- `GET /datasets/{id}/preview` - Preview data

**Node Definitions**:
- `GET /node-definitions` - List available transformations

### Error Handling
Axios interceptors configured for:
- 401 Unauthorized → Clear JWT, redirect to login
- Request/response transformation
- Automatic JWT injection from localStorage

## Current Status

✅ **Phase 1 COMPLETE** - Foundation ready for Phase 2

### What Works
- App structure with routing (5 pages)
- Navigation between pages
- Header and sidebar components
- Dark/light mode toggle
- Responsive layout
- TypeScript strict mode
- API layer with all endpoints defined
- TanStack Query configured
- Zustand state management
- Tailwind CSS styling

### Known Issues

**⚠️ Node.js Version Requirement**:
The project requires Node.js 20.19+ or 22.12+ to run. Current system has Node.js 20.15.1, which causes:
- Vite version mismatch (uses Rolldown which requires newer Node)
- Native binding errors

**Solution**: Upgrade Node.js to LTS or current stable version

**Running the Dev Server**:
```bash
cd e:\Preflow\preflow-ui
# Upgrade Node.js first (if needed)
npm install
npm run dev
# Should start on http://localhost:5173
```

## Next Phase (Phase 2): Workflow Builder

Once Node.js is updated, Phase 2 will implement:

1. **React Flow Integration**
   - DAGEditor component (visual canvas)
   - CustomNode & CustomEdge components
   - Node dragging and connection

2. **Node Palette**
   - Drag-drop node library
   - Available transformations from node-definitions

3. **DAG Validation**
   - Cycle detection
   - No isolated nodes validation
   - Topological sorting

4. **Workflow CRUD**
   - Create workflows
   - Save/load workflows
   - Delete workflows

5. **Node Operations**
   - Add/remove nodes from canvas
   - Configure node parameters
   - Connect nodes with edges

**Prerequisites for Phase 2**:
- [ ] Node.js 20.19+ or 22.12+ installed
- [ ] `npm run dev` runs without errors
- [ ] Home page loads at `http://localhost:5173`
- [ ] Navigation works (click Workflows, Jobs, Datasets)
- [ ] Dark mode toggle works

## Environment Setup

### Development
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update values if backend is on different host/port:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_WS_URL=ws://localhost:8080/ws
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173`

### Production Build
```bash
npm run build          # Generate minified bundle
npm run preview        # Preview production build
```

## Code Standards

- ✅ **TypeScript Strict Mode** - All files use strict typing
- ✅ **Tailwind + MUI** - Utility CSS for layout, MUI for complex components
- ✅ **React Hooks** - No class components
- ✅ **TanStack Query** - All server state through queries
- ✅ **Zustand** - Lightweight client state only
- ✅ **API Abstraction** - All backend calls via services/api
- ✅ **Responsive Design** - Mobile-first Tailwind utilities

## Troubleshooting

### Issue: "vite requires Node.js version 20.19+ or >=22.12+"
**Solution**: Upgrade Node.js
```bash
# Check Node version
node --version

# Download from https://nodejs.org (LTS recommended)
# Or use nvm/nvm-windows for version management
```

### Issue: Module not found errors
**Solution**: Reinstall dependencies
```bash
cd e:\Preflow\preflow-ui
rm -r node_modules package-lock.json  # PowerShell: Remove-Item cmd
npm install
```

### Issue: Port 5173 already in use
**Solution**: Change Vite port in `vite.config.ts`
```typescript
export default defineConfig({
  server: {
    port: 3000,  // Change to available port
  },
});
```

### Issue: API calls return 404
**Solution**: Verify backend is running and API_BASE_URL is correct
```bash
# Check backend status
curl http://localhost:8080/health

# Update .env.local if on different host
VITE_API_BASE_URL=http://your-backend-host:8080/api
```

## Resources

- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **React Flow**: https://reactflow.dev
- **TanStack Query**: https://tanstack.com/query
- **Zustand**: https://github.com/pmndrs/zustand
- **Material-UI**: https://mui.com
- **Tailwind CSS**: https://tailwindcss.com

---

**Phase 1 Completed**: April 26, 2026  
**Status**: ✅ Ready for Phase 2  
**Next Milestone**: Workflow Builder with React Flow
