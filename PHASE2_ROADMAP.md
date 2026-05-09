# Phase 2: Workflow Builder - Implementation Roadmap

**Date**: April 26, 2026  
**Duration**: Week 3-4 (2 weeks)  
**Previous Phase Status**: ✅ Phase 1 COMPLETE  
**Current Phase**: 🚀 Phase 2 IN PROGRESS  

---

## Phase 2 Overview

**Objective**: Build a fully functional DAG (Directed Acyclic Graph) visual editor enabling users to:
- Create workflows by dragging transformation nodes onto a canvas
- Connect nodes to form data pipelines
- Configure node parameters
- Validate for cycles and isolation
- Save/load workflows via API

**Key Technology**: React Flow (Node-based editor library with 50KB bundle)

**Success Criteria**:
- ✅ Create 5-node DAG without errors
- ✅ Cycle detection prevents invalid connections
- ✅ Save workflow persists to backend
- ✅ Load workflow restores all node positions and configs
- ✅ No TypeScript errors
- ✅ Responsive UI on desktop

---

## Dependencies to Install

### Phase 2 New Dependencies

```bash
npm install reactflow
npm install react-hook-form zod @hookform/resolvers
npm install @radix-ui/context-menu  # For right-click menus
```

**Size Impact**:
- `reactflow`: ~50KB (minified)
- `react-hook-form`: ~9KB
- `zod`: ~15KB
- `@radix-ui/context-menu`: ~8KB

**Total Addition**: ~82KB (acceptable for feature value)

### Why These Libraries?

| Library | Purpose | Why |
|---------|---------|-----|
| **reactflow** | DAG visualization & interaction | Purpose-built for node-editors; same stack as n8n, Langflow |
| **react-hook-form** | Form handling in NodeConfigPanel | Minimal re-renders, integrates with Zod validation |
| **zod** | Schema validation | TypeScript-first, infers types automatically |
| **@radix-ui/context-menu** | Right-click context menus | Accessible, unstyled (we style with MUI) |

---

## Implementation Tasks (16 Subtasks)

### Task 1: Install React Flow Library ⏳

**Subtask 1.1** - Install package
```bash
npm install reactflow
npm install react-hook-form zod @hookform/resolvers
npm install @radix-ui/context-menu
npm install uuid       # For generating unique IDs
```

**Subtask 1.2** - Update package.json
- React Flow added to dependencies
- Type definitions automatically included
- No additional `@types/` needed

**Subtask 1.3** - Verify no conflicts
```bash
npm audit
tsc -b  # Should pass with no errors
```

**Estimated Time**: 10 minutes

---

### Task 2: Create DAGEditor Wrapper Component ⏳

**File**: `src/components/DAGEditor/DAGEditor.tsx`

**Purpose**: Wrap React Flow for Preflow-specific functionality

**Key Props**:
```typescript
interface DAGEditorProps {
  workflow: Workflow;
  nodeDefinitions: NodeDefinition[];
  onSave: (workflow: Workflow) => void;
  isLoading?: boolean;
  error?: Error;
}
```

**Responsibilities**:
- Initialize React Flow with workflow nodes/edges
- Handle node add/remove/update events
- Manage canvas state (pan, zoom, selection)
- Connect to NodePalette for drag-and-drop
- Show validation errors inline

**Template Structure**:
```tsx
export const DAGEditor: React.FC<DAGEditorProps> = ({
  workflow,
  nodeDefinitions,
  onSave,
  isLoading,
  error
}) => {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);
  
  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
    >
      {/* Controls */}
      {/* Background */}
      {/* Sidebar */}
    </ReactFlow>
  );
};
```

**Estimated Time**: 30 minutes

---

### Task 3: Create CustomNode Component ⏳

**File**: `src/components/DAGEditor/CustomNode.tsx`

**Purpose**: Custom rendering for workflow transformation nodes

**Features**:
- Display node icon (from NodeDefinition)
- Show node name and status
- Highlight when selected
- Handles (connection points) on all sides
- Click to select in right sidebar
- Right-click for context menu

**Template Structure**:
```tsx
export const CustomNode = (props) => {
  const { data, selected, isConnectable } = props;
  
  return (
    <div className={`node ${selected ? 'selected' : ''}`}>
      <div className="node-header">
        {data.icon && <img src={data.icon} alt={data.label} />}
        <span>{data.label}</span>
      </div>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};
```

**Styling**: CSS Module with MUI integration

**Estimated Time**: 40 minutes

---

### Task 4: Create CustomEdge Component ⏳

**File**: `src/components/DAGEditor/CustomEdge.tsx`

**Purpose**: Render connections between nodes

**Features**:
- Smooth cubic bezier curves
- Animate on hover
- Color indicate data flow
- Delete on context menu
- Show edge label (optional: input/output mapping)

**Template Structure**:
```tsx
export const CustomEdge = (props) => {
  return (
    <BaseEdge {...props} path={edgePath} style={style} />
  );
};
```

**Estimated Time**: 20 minutes

---

### Task 5: Add Pan/Zoom/Fit Controls ⏳

**File**: `src/components/DAGEditor/DAGControls.tsx`

**Purpose**: Toolbar for canvas manipulation

**Features**:
- Zoom in/out buttons
- Fit to view (auto-zoom to show all nodes)
- Reset pan/zoom
- Fullscreen toggle
- Keyboard shortcuts (Ctrl+Plus/Minus, Home)

**Components**:
```tsx
<Controls>
  <ControlButton onClick={onZoomIn} title="Zoom In">+</ControlButton>
  <ControlButton onClick={onZoomOut} title="Zoom Out">−</ControlButton>
  <ControlButton onClick={onFitView} title="Fit View">⊡</ControlButton>
  <ControlButton onClick={onReset} title="Reset">↻</ControlButton>
</Controls>

<Background color="#aaa" gap={16} />

<MiniMap />
```

**Estimated Time**: 25 minutes

---

### Task 6: Create NodePalette Component ⏳

**File**: `src/components/DAGEditor/NodePalette.tsx`

**Purpose**: Sidebar showing available transformation nodes

**Features**:
- List of all available NodeDefinitions
- Search/filter by name or category
- Drag nodes onto canvas to add
- Show tooltip with config requirements

**Template Structure**:
```tsx
export const NodePalette: React.FC<NodePaletteProps> = ({ nodeDefinitions }) => {
  const [search, setSearch] = useState('');
  
  const filteredNodes = nodeDefinitions.filter(nd =>
    nd.name.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <Drawer>
      <TextField 
        placeholder="Search nodes..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filteredNodes.map(nodeDef => (
        <NodePaletteItem 
          key={nodeDef.id} 
          nodeDef={nodeDef}
          onDragStart={(e) => {
            e.dataTransfer.setData('nodeDefinitionId', nodeDef.id);
          }}
        />
      ))}
    </Drawer>
  );
};
```

**Estimated Time**: 35 minutes

---

### Task 7: Implement Node Drag-and-Drop ⏳

**File**: `src/components/DAGEditor/DAGEditor.tsx` (addition)

**Purpose**: Allow users to drag nodes from palette onto canvas

**Implementation**:
```tsx
const onDragOver = useCallback((event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}, []);

const onDrop = useCallback((event) => {
  event.preventDefault();
  
  const nodeDefinitionId = event.dataTransfer.getData('nodeDefinitionId');
  const position = screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });
  
  const newNode = {
    id: generateId(),
    nodeDefinitionId,
    x: position.x,
    y: position.y,
    data: { label: `Node ${nodes.length + 1}` },
  };
  
  setNodes([...nodes, newNode]);
}, [nodes, screenToFlowPosition, setNodes]);

return (
  <ReactFlow
    onDragOver={onDragOver}
    onDrop={onDrop}
    // ...
  />
);
```

**Testing**:
1. Open DAGEditor
2. Drag node from NodePalette onto canvas
3. Node appears at drop location
4. Node is selectable and draggable

**Estimated Time**: 30 minutes

---

### Task 8: Implement Edge Creation (Click to Connect) ⏳

**File**: `src/components/DAGEditor/DAGEditor.tsx` (addition)

**Purpose**: Allow users to click nodes to draw connections

**Implementation**:
```tsx
const onConnect = useCallback((connection: Connection) => {
  // Validate connection doesn't create cycle
  if (wouldCreateCycle(nodes, edges, connection)) {
    toast.error('Cannot create cycle');
    return;
  }
  
  const newEdge = {
    ...connection,
    id: `edge-${connection.source}-${connection.target}`,
  };
  
  setEdges([...edges, newEdge]);
}, [nodes, edges]);

return (
  <ReactFlow
    onConnect={onConnect}
    // ...
  />
);
```

**Testing**:
1. Open DAGEditor with 2+ nodes
2. Hover over node handle
3. Click and drag to another node
4. Edge created (or error if cycle detected)

**Estimated Time**: 25 minutes

---

### Task 9: Add Context Menus (Delete, Duplicate) ⏳

**File**: `src/components/DAGEditor/NodeContextMenu.tsx`

**Purpose**: Right-click options for node manipulation

**Features**:
- Delete node
- Duplicate node
- Edit properties
- View documentation

**Implementation** (using @radix-ui/context-menu):
```tsx
<ContextMenu>
  <ContextMenuTrigger>
    <CustomNode data={data} />
  </ContextMenuTrigger>
  
  <ContextMenuContent>
    <ContextMenuItem onClick={onDelete}>
      Delete Node
    </ContextMenuItem>
    <ContextMenuItem onClick={onDuplicate}>
      Duplicate Node
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem onClick={onEdit}>
      Edit Properties
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

**Estimated Time**: 30 minutes

---

### Task 10: Create NodeConfigPanel Component ⏳

**File**: `src/components/DAGEditor/NodeConfigPanel.tsx`

**Purpose**: Right sidebar for configuring selected node

**Features**:
- Display selected node details
- Form generation from NodeDefinition.configSchema
- Save config changes
- Show validation errors

**Template Structure**:
```tsx
export const NodeConfigPanel: React.FC = () => {
  const selectedNodeId = useUIStore((state) => state.selectedNodeId);
  const node = nodes.find((n) => n.id === selectedNodeId);
  
  if (!node) return <Empty message="Select a node to configure" />;
  
  const nodeDef = nodeDefinitions.find((nd) => nd.id === node.data.nodeDefinitionId);
  
  return (
    <Box className="panel">
      <Typography variant="h6">{nodeDef?.name}</Typography>
      <NodeConfigForm 
        node={node} 
        schema={nodeDef?.configSchema}
        onSave={handleSaveConfig}
      />
    </Box>
  );
};
```

**Estimated Time**: 35 minutes

---

### Task 11: Implement Dynamic Form Generation ⏳

**File**: `src/components/DAGEditor/NodeConfigForm.tsx`

**Purpose**: Generate form fields from JSON schema (configSchema)

**Features**:
- Support text, number, select, multiselect fields
- Zod validation
- Real-time error messages
- Save/cancel buttons

**Example configSchema** (from backend):
```json
{
  "nodeDefinitionId": "remove_nulls",
  "configSchema": {
    "type": "object",
    "properties": {
      "strategy": { "type": "string", "enum": ["drop", "fill", "interpolate"] },
      "fillValue": { "type": "number", "default": 0 }
    },
    "required": ["strategy"]
  }
}
```

**Implementation** (using react-hook-form + Zod):
```tsx
const schema = z.object({
  strategy: z.enum(['drop', 'fill', 'interpolate']),
  fillValue: z.number().optional(),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  defaultValues: node.config,
});

return (
  <form onSubmit={handleSubmit(onSave)}>
    <Controller 
      name="strategy"
      control={control}
      render={({ field }) => (
        <TextField 
          {...field} 
          select 
          error={!!errors.strategy}
          helperText={errors.strategy?.message}
        >
          <MenuItem value="drop">Drop</MenuItem>
          <MenuItem value="fill">Fill</MenuItem>
          <MenuItem value="interpolate">Interpolate</MenuItem>
        </TextField>
      )}
    />
    {/* More fields */}
  </form>
);
```

**Estimated Time**: 45 minutes

---

### Task 12: Implement DAG Validation (Cycle Detection) ⏳

**File**: `src/utils/dagValidation.ts`

**Purpose**: Prevent invalid DAG structures

**Functions**:
```typescript
export function detectCycle(nodes: Node[], edges: Edge[]): boolean {
  // Depth-first search to detect cycle
  // Returns true if cycle found
}

export function validateDAG(nodes: Node[], edges: Edge[]): ValidationResult {
  return {
    hasCycle: detectCycle(nodes, edges),
    hasIsolatedNodes: nodes.some(n => 
      !edges.some(e => e.source === n.id || e.target === n.id)
    ),
    isValid: !hasCycle && edgesConnectExistingNodes,
  };
}
```

**Integration**:
- Call on every edge creation/deletion
- Prevent invalid connections in onConnect callback
- Show validation errors in UI

**Testing**:
1. Try to create cycle (A→B→A) → Error shown
2. Try to connect non-existent nodes → Error
3. Create valid chain (A→B→C) → Success

**Estimated Time**: 30 minutes

---

### Task 13: Implement Save/Load Workflows ⏳

**File**: `src/components/DAGEditor/DAGEditor.tsx` (save integration)
**File**: `src/hooks/useWorkflow.ts` (mutations)

**Purpose**: Persist workflow to backend

**Save Implementation**:
```tsx
const saveWorkflowMutation = useMutation({
  mutationFn: (updatedWorkflow: Workflow) =>
    api.updateWorkflow(workflowId, updatedWorkflow),
  onSuccess: () => {
    toast.success('Workflow saved');
  },
  onError: (error) => {
    toast.error('Failed to save workflow');
  },
});

const handleSaveWorkflow = () => {
  const workflowData = {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    nodes: nodes.map(n => ({
      id: n.id,
      nodeDefinitionId: n.data.nodeDefinitionId,
      x: n.position.x,
      y: n.position.y,
      config: n.data.config,
      label: n.data.label,
    })),
    edges: edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  };
  
  saveWorkflowMutation.mutate(workflowData);
};
```

**Load Implementation**:
```tsx
useEffect(() => {
  if (workflow) {
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
  }
}, [workflow, setNodes, setEdges]);
```

**Testing**:
1. Create 5-node DAG
2. Click Save Workflow button
3. Refresh page
4. Workflow still shows all nodes and edges

**Estimated Time**: 30 minutes

---

### Task 14: Create WorkflowBuilder Page ⏳

**File**: `src/pages/WorkflowBuilder.tsx`

**Purpose**: Main page wrapping DAGEditor + NodePalette + NodeConfigPanel

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│                        Header                           │
├─────────────────────────────────────────────────────────┤
│         │                                       │        │
│         │        DAG Editor Canvas             │        │
│ Node    │       (React Flow)                   │ Node   │
│Palette  │                                      │Config  │
│         │                                      │ Panel  │
│         │                                      │        │
├─────────────────────────────────────────────────────────┤
│ Save | Cancel | Execute (Phase 3) | Test |   Status: ✓ 
└─────────────────────────────────────────────────────────┘
```

**Components**:
```tsx
<Box className="flex h-screen">
  {/* Left: NodePalette */}
  <NodePalette nodeDefinitions={nodeDefinitions} />
  
  {/* Center: DAGEditor */}
  <Box className="flex-1">
    <DAGEditor 
      workflow={workflow}
      nodeDefinitions={nodeDefinitions}
      onSave={handleSave}
    />
  </Box>
  
  {/* Right: NodeConfigPanel */}
  <NodeConfigPanel />
</Box>
```

**Estimated Time**: 25 minutes

---

### Task 15: Integration Testing ⏳

**Testing Checklist**:

- [ ] Create new workflow
- [ ] Drag 5 different nodes onto canvas
- [ ] Connect nodes in chain (A→B→C→D→E)
- [ ] Try to create cycle (E→A) → Error shown
- [ ] Delete middle node (C) → Edges auto-removed
- [ ] Pan/zoom canvas → Works smoothly
- [ ] Right-click node → Context menu appears
- [ ] Click node → Config panel updates
- [ ] Edit node config → Changes appear
- [ ] Save workflow → Backend called
- [ ] Refresh page → Workflow reloads with all nodes/edges
- [ ] 5-node DAG renders without lag
- [ ] No TypeScript errors
- [ ] No console errors

**Estimated Time**: 60 minutes

---

### Task 16: Documentation & Cleanup ⏳

**Documentation Files**:
- `PHASE2_README.md` - Phase 2 summary
- Comments in DAGEditor code
- Type documentation for custom node types

**Cleanup**:
- Verify no unused imports
- Run ESLint: `npm run lint`
- Run TypeScript check: `tsc -b`
- Clean up console logs

**Estimated Time**: 20 minutes

---

## Total Implementation Time

| Task | Est. Time |
|------|-----------|
| 1. Install React Flow | 10 min |
| 2. DAGEditor Wrapper | 30 min |
| 3. CustomNode | 40 min |
| 4. CustomEdge | 20 min |
| 5. Pan/Zoom Controls | 25 min |
| 6. NodePalette | 35 min |
| 7. Drag-and-Drop | 30 min |
| 8. Edge Creation | 25 min |
| 9. Context Menus | 30 min |
| 10. NodeConfigPanel | 35 min |
| 11. Dynamic Forms | 45 min |
| 12. DAG Validation | 30 min |
| 13. Save/Load | 30 min |
| 14. WorkflowBuilder Page | 25 min |
| 15. Integration Testing | 60 min |
| 16. Documentation | 20 min |
| **TOTAL** | **515 min (~8.5 hrs)** |

**Timeline**: 2 weeks available, ~1 week of work, leaves buffer for iteration/polish

---

## Phase 2 Success Criteria

### ✅ Functional Requirements
- [ ] Create 5-node DAG (mix of different transformations)
- [ ] Save workflow to backend
- [ ] Load workflow and restore all positions/configs
- [ ] Cycle detection prevents invalid graphs
- [ ] Drag nodes from palette to canvas
- [ ] Connect nodes with edges
- [ ] Delete nodes/edges with context menu
- [ ] Configure node parameters
- [ ] Pan and zoom canvas smoothly

### ✅ Code Quality
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] No console errors or warnings
- [ ] Code is well-organized in components
- [ ] Types defined for all new interfaces

### ✅ User Experience
- [ ] Responsive on desktop
- [ ] Keyboard shortcuts work (Ctrl+S to save)
- [ ] Error messages clear and actionable
- [ ] Smooth animations (pan, zoom)
- [ ] No lag when adding nodes

### ✅ Testing
- [ ] Can create complex workflows
- [ ] Backend save/load verified
- [ ] Cycle detection tested extensively
- [ ] Edge cases handled (empty workflow, single node, etc.)

---

## Blockers & Risks

| Risk | Mitigation |
|------|-----------|
| React Flow learning curve | Read examples on reactflow.dev, start simple |
| Cycle detection complexity | Use well-tested algorithm (DFS), write tests |
| Performance with many nodes | Test with 50+ node workflow early |
| Form generation from schema | Start with simple schema, iterate |
| WebSocket integration delayed | Use polling in Phase 3, WebSocket in Phase 4 |

---

## Resources

### Documentation
- [React Flow Docs](https://reactflow.dev/)
- [React Flow Examples](https://reactflow.dev/docs/guides/)
- [Zod Documentation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)

### Reference Implementations
- **n8n**: https://github.com/n8n-io/n8n (workflow builder reference)
- **Langflow**: Open-source LLM workflow editor
- **Retool**: Visual app builder using React Flow

---

## Next phase

Once Phase 2 is complete:
- Phase 3: Dataset Upload & Execution (Week 5-6)
- Implement DatasetUpload component
- Connect ExecuteButton to workflow + dataset
- Add job polling for status updates

---

**Generated**: April 26, 2026  
**Status**: 🚀 Ready to Start Phase 2  
**Estimated Completion**: May 10, 2026
