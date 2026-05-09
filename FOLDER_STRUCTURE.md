# Preflow UI - Folder Structure & Architecture Guide

## Overview

**Preflow UI** is a modern React + TypeScript frontend application built with **Vite** that provides a visual interface for creating, managing, and executing data transformation workflows (DAGs). The UI communicates with the **preflow-engine** backend service to orchestrate ML preprocessing pipelines.

### Why Preflow UI?

- **Visual Workflow Builder**: Drag-and-drop interface to construct directed acyclic graphs (DAGs) of transformation nodes
- **Dataset Management**: Upload, view, and manage datasets used in workflows
- **Job Monitoring**: Track execution status, logs, and results of running jobs
- **Real-time Updates**: WebSocket support for live job status updates
- **Type-Safe Development**: Full TypeScript coverage with strict type checking
- **Modern Stack**: React 19, TypeScript, Vite with HMR for fast development

---

## Root Level Files

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, project metadata |
| `tsconfig.json` | Root TypeScript configuration |
| `tsconfig.app.json` | Application-specific TypeScript settings |
| `tsconfig.node.json` | Build tool TypeScript settings |
| `vite.config.ts` | Vite bundler configuration (dev server, build settings) |
| `eslint.config.js` | ESLint rules for code quality |
| `postcss.config.js` | PostCSS plugins (currently minimal) |
| `.gitignore` | Files to exclude from git |
| `.env.example` | Template for environment variables |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Basic project setup guide |
| `PHASE1_README.md` | Phase 1 implementation roadmap |
| `index.html` | HTML entry point for Vite |

---

## Folder Structure

```
preflow-ui/
├── src/                          # Source code
│   ├── App.tsx                   # Main app component & routing
│   ├── App.css                   # Global app styles
│   ├── main.tsx                  # React bootstrap
│   ├── index.css                 # Global CSS (no Tailwind)
│   ├── config.ts                 # Environment & app configuration
│   │
│   ├── assets/                   # Static images, fonts, etc.
│   │
│   ├── components/               # Reusable React components
│   │   ├── common/               # Common layout & UI components
│   │   │   ├── Header.tsx        # Top navigation header
│   │   │   ├── Sidebar.tsx       # Left navigation sidebar
│   │   │   └── Layout.tsx        # Wrapper for page layouts
│   │   ├── DAGEditor/            # Workflow DAG visual editor
│   │   ├── DatasetUpload/        # Dataset upload interface
│   │   ├── JobMonitor/           # Job execution monitoring
│   │   └── NodePalette/          # Transformation node selector
│   │
│   ├── pages/                    # Page components (routes)
│   │   ├── Home.tsx              # Dashboard / landing page
│   │   ├── Workflows.tsx         # Workflow management page
│   │   ├── Datasets.tsx          # Dataset management page
│   │   ├── Jobs.tsx              # Job history & monitoring page
│   │   └── NotFound.tsx          # 404 error page
│   │
│   ├── services/                 # API communication & external services
│   │   ├── api/                  # REST API clients
│   │   │   ├── axios.ts          # Configured Axios instance
│   │   │   ├── workflowApi.ts    # Workflow CRUD operations
│   │   │   ├── datasetApi.ts     # Dataset upload/retrieval
│   │   │   ├── jobApi.ts         # Job status & control
│   │   │   ├── nodeDefinitionApi.ts  # Available transformations
│   │   │   └── index.ts          # API exports
│   │   └── realtime/             # WebSocket/real-time updates
│   │
│   ├── stores/                   # State management (Zustand)
│   │   └── uiStore.ts            # Local UI state (modal visibility, selection)
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── (Custom hooks for API calls, effects, etc.)
│   │
│   ├── queries/                  # TanStack React Query hooks
│   │   ├── workflowQueries.ts    # useWorkflows, useWorkflow, etc.
│   │   ├── datasetQueries.ts     # useDatasets, useDataset, etc.
│   │   └── jobQueries.ts         # useJobs, useJob, etc.
│   │
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # All TS interfaces & types (Workflow, Job, Dataset, etc.)
│   │
│   ├── utils/                    # Utility functions
│   │   └── (Format, validate, transform data, etc.)
│   │
│   └── styles/                   # Global stylesheets
│       └── globals.css           # Application-wide CSS custom properties
│
├── tests/                        # Unit & integration tests
│   ├── components/               # Component tests
│   ├── hooks/                    # Hook tests
│   └── utils/                    # Utility tests
│
├── public/                       # Static assets served as-is
│
└── node_modules/                 # Installed dependencies (generated)
```

---

## Key Directories Explained

### 📁 `src/components/`

**Purpose**: Reusable React components following separation of concerns.

#### `common/`
- **Header.tsx**: Navigation bar with branding and user menu
- **Sidebar.tsx**: Collapsible sidebar with navigation links to Workflows, Datasets, and Jobs pages
- **Layout.tsx**: Page wrapper component that combines Header and Sidebar

#### `DAGEditor/`
- Visual editor for drawing workflows
- Handles node placement, edge creation, and node interactions
- Displays available transformation nodes and configurations

#### `DatasetUpload/`
- File upload interface with drag-and-drop support
- Dataset metadata form (name, description, format)
- Upload progress tracking

#### `JobMonitor/`
- Real-time job status display
- Shows execution progress, node-by-node status
- Log viewer for debugging failed jobs

#### `NodePalette/`
- Searchable list of available transformation nodes
- Node definitions fetched from backend
- Drag-to-canvas to add nodes to workflow

---

### 📁 `src/pages/`

**Purpose**: Route-level page components for different sections of the application.

| Page | Route | Purpose |
|------|-------|---------|
| **Home.tsx** | `/` | Dashboard with quick stats and recent workflows |
| **Workflows.tsx** | `/workflows` | List, create, edit, and delete workflows |
| **Datasets.tsx** | `/datasets` | Upload, view, and manage datasets |
| **Jobs.tsx** | `/jobs` | View job history, status, and execution details |
| **NotFound.tsx** | `*` | 404 error page for invalid routes |

---

### 📁 `src/services/api/`

**Purpose**: Encapsulate all backend communication logic (REST API calls).

#### `axios.ts`
- Configured Axios instance with base URL, headers, timeout
- Request/response interceptors for auth, error handling
- Centralized HTTP client configuration

#### `workflowApi.ts`
- `getWorkflows()` - Fetch all workflows
- `getWorkflow(id)` - Fetch single workflow
- `createWorkflow(data)` - Create new workflow
- `updateWorkflow(id, data)` - Update workflow DAG
- `deleteWorkflow(id)` - Delete workflow

#### `datasetApi.ts`
- `getDatasets()` - List all datasets
- `getDataset(id)` - Fetch dataset metadata
- `uploadDataset(file, metadata)` - Upload dataset file
- `deleteDataset(id)` - Delete dataset

#### `jobApi.ts`
- `getJobs()` - List all jobs
- `getJob(id)` - Fetch job details & status
- `createJob(workflowId, datasetId)` - Submit workflow execution
- `cancelJob(id)` - Stop running job
- `getJobLogs(id)` - Fetch job execution logs

#### `nodeDefinitionApi.ts`
- `getNodeDefinitions()` - Fetch all available transformation node types
- Used by DAGEditor and NodePalette components

#### `index.ts`
- Re-exports all API functions for cleaner imports

---

### 📁 `src/stores/`

**Purpose**: State management using **Zustand** for client-side UI state (not synced to backend).

#### `uiStore.ts`
Manages UI state like:
- `selectedNodeId` - Currently selected node in DAG editor
- `selectedWorkflowId` - Currently viewed workflow
- `sidebarOpen` - Toggle collapsible sidebar
- `darkMode` - Light/dark theme preference
- `setters` - Action methods to update state

**Key Point**: This store is **local only** and doesn't sync data to backend. Use React Query for server state.

---

### 📁 `src/queries/`

**Purpose**: **TanStack React Query** hooks for server state management with caching, refetching, and synchronization.

#### `workflowQueries.ts`
- `useWorkflows()` - Query hook for fetching workflows list
- `useWorkflow(id)` - Query hook for single workflow
- `useCreateWorkflow()` - Mutation hook for creating workflow
- `useUpdateWorkflow(id)` - Mutation hook for updating workflow
- `useDeleteWorkflow(id)` - Mutation hook for deleting workflow

#### `datasetQueries.ts`
- Similar pattern for dataset operations (CRUD)
- `useUploadDataset()` - Mutation for file uploads with progress tracking

#### `jobQueries.ts`
- `useJobs()` - List all jobs with polling/WebSocket support
- `useJob(id)` - Poll for job status updates
- `useCreateJob()` - Submit job execution
- `useJobLogs(id)` - Fetch job execution logs

**Benefits**:
- Automatic caching of API responses
- Request deduplication
- Automatic refetching on window focus
- Built-in error handling
- Server state stays in sync

---

### 📁 `src/types/`

**Purpose**: Centralized TypeScript type definitions for all domain objects.

#### `index.ts`
Contains interfaces for:
- `Workflow`, `Node`, `Edge` - DAG structure
- `Dataset` - Dataset metadata
- `Job`, `JobExecution` - Job status & monitoring
- `NodeDefinition` - Transformation node type
- `UIState` - UI store state

**Best Practice**: Define all types here for consistency and easy refactoring.

---

### 📁 `src/styles/`

**Purpose**: Global stylesheets and CSS variables.

#### `globals.css`
- CSS custom properties (variables) for colors, spacing, fonts
- Base element styling (body, html defaults)
- Utility classes for common layout patterns
- **No Tailwind CSS** - using standard CSS instead

---

### 📁 `src/`

**Root source files**:

| File | Purpose |
|------|---------|
| `App.tsx` | Root component with routing, providers, theme setup |
| `main.tsx` | React bootstrap - mounts App to DOM |
| `config.ts` | Environment variables & configuration constants |
| `index.css` | Global CSS imports |
| `App.css` | App-specific styles |

#### `App.tsx` Structure:
```typescript
- BrowserRouter (React Router setup)
- QueryClientProvider (React Query)
- ThemeProvider (MUI theme with dark mode)
- Routes (Home, Workflows, Datasets, Jobs, NotFound)
- Layout (header, sidebar, outlet)
```

---

## Data Flow Architecture

### Component to API (Write Flow)

```
Component (DAGEditor)
    ↓
useCreateWorkflow() hook (React Query mutation)
    ↓
workflowApi.createWorkflow() (axios call)
    ↓
Backend (preflow-engine)
    ↓
Response → React Query cache → Component re-renders
```

### API to Component (Read Flow)

```
Component (Workflows page)
    ↓
useWorkflows() hook (React Query)
    ↓
workflowApi.getWorkflows() (axios GET)
    ↓
Backend (preflow-engine)
    ↓
Response → Cache → Component renders
    ↓
useUIStore() for UI state (selected workflow)
```

### Real-time Updates (if WebSocket enabled)

```
Backend sends job status update
    ↓
WebSocket connection (realtime/service)
    ↓
Update React Query cache
    ↓
Components subscribed to useJob() re-render
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19 | UI library |
| **Language** | TypeScript | Type safety |
| **Build Tool** | Vite 8 | Fast development & bundling |
| **Routing** | React Router 7 | Client-side navigation |
| **State (UI)** | Zustand 5 | Simple state management |
| **State (Server)** | React Query 5 | Server state sync & caching |
| **HTTP Client** | Axios 1.15 | REST API calls |
| **UI Components** | MUI 9 | Pre-built Material Design components |
| **Styling** | CSS + MUI | No CSS framework (removed Tailwind) |
| **Testing** | Jest + React Testing Library | Unit & integration tests |
| **Linting** | ESLint + TypeScript ESLint | Code quality |

---

## Key Architectural Decisions

### 1. **Separation of Concerns**
- API logic isolated in `services/api/`
- UI state separate from server state (Zustand vs React Query)
- Components focus on rendering only

### 2. **Type Safety**
- All types defined in `types/index.ts`
- No `any` types - strict TypeScript configuration
- Full type coverage for API responses

### 3. **Scalable API Layer**
- Each resource (workflow, dataset, job) has its own API file
- Easy to add new endpoints without refactoring
- Centralized Axios configuration for consistency

### 4. **Caching & Synchronization**
- React Query handles all server state
- Automatic cache invalidation on mutations
- Polling fallback if WebSocket unavailable

### 5. **Component Reusability**
- `common/` components can be used across pages
- Custom hooks in `hooks/` for shared logic
- Query hooks in `queries/` for API data fetching

---

## Environment Variables

Create `.env.local` to override defaults:

```env
# Backend API
VITE_API_BASE_URL=http://localhost:8080/api

# Worker service
VITE_WORKER_BASE_URL=http://localhost:8001

# WebSocket for real-time updates
VITE_WS_URL=ws://localhost:8080/ws

# Job polling fallback
VITE_JOB_POLL_ENABLED=true
```

---

## Development Workflow

### Start Development Server
```bash
cd preflow-ui
npm run dev
# Vite dev server at http://localhost:5173
```

### Build for Production
```bash
npm run build
# Output: dist/
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

---

## How the UI Communicates with Backend

### Request Flow
1. **User Action**: Clicks "Create Workflow" button
2. **Component Handler**: Calls `createWorkflow(data)` from query hook
3. **Mutation**: React Query sends POST to `/api/workflows`
4. **Axios**: Adds headers, timeout, base URL
5. **Backend**: preflow-engine processes request
6. **Response**: JSON returned to component
7. **Cache Update**: React Query updates and broadcasts to subscribed components
8. **UI Update**: Components re-render with new data

### Job Execution Flow
1. **User Action**: Submits job (workflow + dataset)
2. **API Call**: `createJob(workflowId, datasetId)` → Backend
3. **Job Created**: Status = `QUEUED`
4. **Polling/WebSocket**: Frontend polls or subscribes to updates
5. **Status Updates**: `PENDING` → `RUNNING` → `COMPLETED/FAILED`
6. **UI Updates**: JobMonitor component reflects status changes
7. **Logs**: User can view execution logs in real-time

---

## Common Tasks

### Adding a New Page
1. Create file in `src/pages/NewPage.tsx`
2. Add route in `App.tsx`
3. Add navigation link in `Sidebar.tsx`

### Adding a New API Endpoint
1. Create function in `src/services/api/` (e.g., `workflowApi.ts`)
2. Create query hook in `src/queries/` (e.g., `workflowQueries.ts`)
3. Use hook in component with `useQuery()` or `useMutation()`

### Adding UI State
1. Add property to `UIStore` in `src/stores/uiStore.ts`
2. Use hook in component: `const { property } = useUIStore()`

### Adding Type Definitions
1. Define interface in `src/types/index.ts`
2. Import and use in components/services

---

## Debugging Tips

- **React Query DevTools**: See all cached data and query states
- **Network Tab**: Inspect API requests and responses
- **Zustand Devtools**: Monitor UI state changes
- **Vite HMR**: Fast refresh on file changes (live reload)

---

## Next Steps

Refer to **PHASE1_README.md** for the 12-week development roadmap and upcoming features.
