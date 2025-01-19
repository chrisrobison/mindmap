# Migration Guide: Converting to Modular Mind Map Structure

## Table of Contents
1. [Project Structure Setup](#project-structure-setup)
2. [File Migration Steps](#file-migration-steps)
3. [HTML Changes](#html-changes)
4. [CSS Migration](#css-migration)
5. [Testing the Migration](#testing-the-migration)
6. [Common Issues](#common-issues)

## Project Structure Setup

### 1. Create New Directory Structure

```bash
mindmap/
├── src/
│   ├── models/
│   │   ├── Node.js
│   │   └── Connection.js
│   ├── utils/
│   │   ├── bindings.js
│   │   ├── dom.js
│   │   ├── svg.js
│   │   └── state.js
│   ├── styles/
│   │   └── mindmap.css
│   ├── MindMap.js
│   └── main.js
├── index.html
└── README.md
```

### 2. Move Existing Files

1. Copy your original HTML file to `index.html`
2. Extract CSS into `src/styles/mindmap.css`
3. Create empty files for each module

## File Migration Steps

### 1. Extract Utility Functions

First, move utility functions to their respective modules:

```javascript
// Original code
const createBindings = (target, onChange) => {
    return new Proxy(target, {
        // ... proxy implementation
    });
};

// Becomes src/utils/bindings.js
export const createBindings = (target, onChange) => {
    return new Proxy(target, {
        // ... same implementation
    });
};
```

### 2. Convert Node Class

From:
```javascript
class Node {
    constructor(id, x, y, title = 'New Node', html = '') {
        this.id = id;
        // ... rest of constructor
    }
    // ... methods
}
```

To `src/models/Node.js`:
```javascript
import { createBindings } from '../utils/bindings';
import { DOMUtils } from '../utils/dom';

export class Node {
    constructor(id, x, y, title = 'New Node', options = {}) {
        this.id = id;
        // ... rest of constructor with DOMUtils
    }
    // ... methods using utility functions
}
```

### 3. Convert Connection Class

From:
```javascript
app.createConnection = function(fromId, toId) {
    // ... connection creation logic
}
```

To `src/models/Connection.js`:
```javascript
import { SVGUtils } from '../utils/svg';

export class Connection {
    constructor(fromNode, toNode, options = {}) {
        // ... connection creation logic using SVGUtils
    }
}
```

### 4. Convert Main App

From:
```javascript
const app = {
    nodes: [],
    connections: [],
    // ... rest of app object
};
```

To `src/MindMap.js`:
```javascript
import { Node } from './models/Node';
import { Connection } from './models/Connection';
import { StateManager } from './utils/state';

export class MindMap {
    constructor(container) {
        this.container = container;
        this.nodes = [];
        this.connections = [];
        // ... rest of initialization
    }
    
    // Convert methods to class methods
    createNode(x, y) {
        // ... same logic but using this instead of app
    }
}
```

## HTML Changes

### 1. Update Script Tags

From:
```html
<script>
    // All the code was here
</script>
```

To:
```html
<script type="module">
    import { MindMap } from './src/main.js';
    
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.querySelector('main');
        const mindMap = new MindMap(container);
        
        // Make available globally if needed
        window.mindMap = mindMap;
    });
</script>
```

### 2. Update CSS Import

From inline styles to external:
```html
<!-- Add to head -->
<link rel="stylesheet" href="src/styles/mindmap.css">
```

## CSS Migration

### 1. Extract Styles

Move all styles to `src/styles/mindmap.css`:

```css
/* Base styles */
.mindmap-node {
    position: absolute;
    /* ... rest of node styles */
}

/* Connection styles */
.connection-animated {
    transition: d 0.3s ease-in-out;
}

/* Properties panel styles */
.properties-panel {
    /* ... panel styles */
}
```

### 2. Update Dynamic Styles

From:
```javascript
element.style.cssText = `
    left: ${this.x}px;
    top: ${this.y}px;
    // ... more styles
`;
```

To:
```javascript
DOMUtils.setStyles(element, {
    left: `${this.x}px`,
    top: `${this.y}px`
    // ... more styles
});
```

## Testing the Migration

### 1. Basic Functionality Test

```javascript
// Create test.js
import { MindMap } from './src/MindMap.js';

function testBasicFunctionality() {
    const mindMap = new MindMap(document.querySelector('main'));
    
    // Test node creation
    const node1 = mindMap.createNode(100, 100);
    const node2 = mindMap.createNode(300, 300);
    
    // Test connection
    const conn = mindMap.createConnection(node1.id, node2.id);
    
    // Test state
    mindMap.saveState();
    mindMap.loadState();
}
```

### 2. Feature Parity Checklist

- [ ] Node creation and deletion
- [ ] Connection creation
- [ ] Dragging functionality
- [ ] Content editing
- [ ] Image paste support
- [ ] State persistence
- [ ] Zoom controls
- [ ] Properties panel

## Common Issues

### 1. Module Loading

Problem:
```
Uncaught SyntaxError: Cannot use import statement outside a module
```

Solution:
```html
<!-- Add type="module" to script tag -->
<script type="module" src="src/main.js"></script>
```

### 2. Path References

Problem:
```
Failed to load module from /src/models/Node.js
```

Solution:
```javascript
// Use correct relative paths
import { Node } from './models/Node.js';
```

### 3. State Migration

Problem: Old state format incompatible with new structure.

Solution:
```javascript
// Add to StateManager
migrateOldState(oldState) {
    if (oldState.version === undefined) {
        // Convert old state format to new
        return {
            version: 1,
            nodes: oldState.nodes.map(n => ({
                ...n,
                options: {
                    width: n.width,
                    height: n.height
                }
            })),
            connections: oldState.connections
        };
    }
    return oldState;
}
```

### 4. Event Listener Migration

Problem: Lost event context after migration.

Solution:
```javascript
// Use arrow functions or bind
setupEventListeners() {
    this.container.addEventListener('click', 
        (e) => this.handleClick(e));
}
```

## Gradual Migration Strategy

1. **Phase 1: Preparation**
   - Create new directory structure
   - Set up module files
   - Extract CSS

2. **Phase 2: Utility Migration**
   - Move utility functions
   - Update references
   - Test utilities independently

3. **Phase 3: Class Migration**
   - Convert Node class
   - Convert Connection handling
   - Update state management

4. **Phase 4: Integration**
   - Create MindMap class
   - Update HTML/CSS references
   - Test full functionality

5. **Phase 5: Cleanup**
   - Remove old code
   - Update documentation
   - Add new features

## Rollback Plan

1. Keep original code in a separate file (`mindmap.original.js`)
2. Maintain old HTML structure with commented-out code
3. Use feature flags for gradual rollout:

```javascript
const USE_MODULAR = false;

if (USE_MODULAR) {
    import('./src/main.js')
        .then(module => {
            window.mindMap = new module.MindMap(container);
        })
        .catch(err => {
            console.error('Failed to load modular version:', err);
            loadOriginalVersion();
        });
} else {
    loadOriginalVersion();
}
```

## Verification Steps

1. **Functionality Testing**
   - Create/delete nodes
   - Create connections
   - Edit content
   - Paste images
   - Save/load state

2. **Performance Testing**
   - Load time comparison
   - Memory usage
   - Large mind map handling

3. **Browser Compatibility**
   - Test in Chrome, Firefox, Safari
   - Check module support
   - Verify CSS compatibility

4. **State Persistence**
   - Verify state saving
   - Check state loading
   - Test state migration
