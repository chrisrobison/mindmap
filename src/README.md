# Mind Map Models Documentation

## Table of Contents
- [Node Model](#node-model)
- [Connection Model](#connection-model)
- [MindMap Class](#mindmap-class)
- [Integration Examples](#integration-examples)

## Node Model

The Node class represents individual nodes in the mind map.

### Constructor

```javascript
import { Node } from './models/Node';

const node = new Node(id, x, y, title, options);
```

Parameters:
- `id` (number): Unique identifier for the node
- `x` (number): Initial X position
- `y` (number): Initial Y position
- `title` (string): Node title
- `options` (object):
  - `width` (number, default: 150): Node width
  - `height` (number, default: 100): Node height
  - `html` (string): Inner HTML content
  - `cssClass` (string): Additional CSS classes

### Properties

```javascript
// Base properties
node.id          // Unique identifier
node.x           // X position
node.y           // Y position
node.width       // Width in pixels
node.height      // Height in pixels
node.title       // Node title
node.html        // Content HTML
node.cssClass    // Additional CSS classes
node.images      // Array of image data URLs

// Style properties
node.styles = {
    backgroundColor: '#ffffff',
    color: '#000000',
    fontFamily: 'Lexend',
    fontSize: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#cccccc',
    borderRadius: '5px',
    boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
};

// Event callbacks
node.onDelete    // Called when node is deleted
node.onUpdate    // Called when node properties change
```

### Methods

```javascript
// Rendering
node.render()              // Creates/updates DOM element
node.updateStyles()        // Updates node styling

// Content Management
node.setupContentEditing() // Initializes content editing
node.setupImagePaste()     // Sets up image paste handling
node.addImage(dataUrl)     // Adds an image to the node

// Event Handling
node.handlePropertyChange(prop, value)  // Handles property updates
node.setupDragging()       // Initializes drag behavior
node.setupResizing()       // Initializes resize behavior
```

### Events

```javascript
// Triggered when node is selected
node.element.addEventListener('click', (e) => {
    // Handle node selection
});

// Triggered when content changes
node.element.querySelector('.node-content')
    .addEventListener('input', (e) => {
        // Handle content update
    });
```

## Connection Model

The Connection class represents connections between nodes.

### Constructor

```javascript
import { Connection } from './models/Connection';

const connection = new Connection(fromNode, toNode, options);
```

Parameters:
- `fromNode` (Node): Source node
- `toNode` (Node): Target node
- `options` (object):
  - `title` (string): Connection label
  - `strokeColor` (string): Line color
  - `strokeWidth` (number): Line width
  - `strokeStyle` (string): Line style (solid/dashed/dotted)
  - `curvature` (number): Curve intensity (0-1)
  - `animated` (boolean): Enable animations
  - `arrowHead` (boolean): Show direction arrow

### Properties

```javascript
connection.id         // Unique identifier
connection.fromNode   // Source node
connection.toNode     // Target node
connection.title      // Connection label

// Style properties
connection.styles = {
    strokeColor: '#666666',
    strokeWidth: 2,
    strokeStyle: 'solid',
    curvature: 0.5,
    animated: true,
    arrowHead: false
};

// Event callbacks
connection.onUpdate   // Called when connection changes
```

### Methods

```javascript
// SVG Path Generation
connection.generatePath()           // Creates SVG path data
connection.calculateControlPoints() // Calculates curve points
connection.getNodeCenter(node)      // Gets node center point

// Rendering
connection.render(svg)             // Creates/updates SVG elements
connection.updatePath()            // Updates path position
connection.updateStyles()          // Updates path styling
connection.setupArrowMarker(svg)   // Creates arrow marker
```

## MindMap Class

The MindMap class manages the overall mind map functionality.

### Constructor

```javascript
import { MindMap } from './MindMap';

const mindMap = new MindMap(container);
```

Parameters:
- `container` (HTMLElement): Container element for the mind map

### Properties

```javascript
mindMap.nodes         // Array of Node instances
mindMap.connections   // Array of Connection instances
mindMap.selectedNode  // Currently selected node
mindMap.nextId        // Next available node ID
mindMap.zoomLevel     // Current zoom level (%)
```

### Methods

```javascript
// Node Management
mindMap.createNode(x, y)           // Creates new node
mindMap.deleteNode(id)             // Deletes node and connections
mindMap.findNodeAtPosition(x, y)   // Finds node at coordinates

// Connection Management
mindMap.createConnection(fromId, toId, options)  // Creates connection
mindMap.updateConnections()        // Updates all connections

// View Management
mindMap.zoom(direction)            // Handles zoom in/out
mindMap.updatePropertiesPanel()    // Updates properties UI
mindMap.hidePropertiesPanel()      // Hides properties UI

// State Management
mindMap.saveState()                // Saves current state
mindMap.loadState()                // Loads saved state

// Event Management
mindMap.setupEventListeners()      // Sets up event handlers
```

## Integration Examples

### Creating a Basic Mind Map

```javascript
// Initialize the mind map
const container = document.querySelector('#mindmap');
const mindMap = new MindMap(container);

// Create initial node
const rootNode = mindMap.createNode(400, 300);
rootNode.title = 'Central Idea';

// Add child nodes
document.addEventListener('click', (e) => {
    if (e.target === container) {
        const childNode = mindMap.createNode(e.clientX, e.clientY);
        childNode.title = 'New Idea';
        
        if (mindMap.selectedNode) {
            mindMap.createConnection(
                mindMap.selectedNode.id, 
                childNode.id
            );
        }
    }
});
```

### Customizing Node Appearance

```javascript
// Create a custom node
const node = mindMap.createNode(200, 200);

// Customize appearance
node.styles.backgroundColor = '#f0f0f0';
node.styles.borderColor = '#333';
node.styles.borderWidth = '2px';
node.styles.borderRadius = '10px';

// Add content
const content = node.element.querySelector('.node-content');
content.innerHTML = `
    <h3>Important Topic</h3>
    <p>Key points about this topic...</p>
`;
```

### Creating Styled Connections

```javascript
// Create nodes
const nodeA = mindMap.createNode(100, 100);
const nodeB = mindMap.createNode(300, 300);

// Create styled connection
const connection = mindMap.createConnection(nodeA.id, nodeB.id, {
    strokeColor: '#2196F3',
    strokeWidth: 3,
    strokeStyle: 'dashed',
    curvature: 0.3,
    animated: true,
    arrowHead: true
});
```

### Handling Events

```javascript
// Handle node selection
mindMap.nodes.forEach(node => {
    node.element.addEventListener('click', () => {
        mindMap.selectedNode = node;
        mindMap.updatePropertiesPanel();
    });
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' && mindMap.selectedNode) {
        mindMap.deleteNode(mindMap.selectedNode.id);
    }
});
```

### Managing State

```javascript
// Save current state
window.addEventListener('beforeunload', () => {
    mindMap.saveState();
});

// Load saved state
window.addEventListener('load', () => {
    mindMap.loadState();
});
```

## Best Practices

1. **Node Creation**
   - Set meaningful titles for nodes
   - Position nodes with adequate spacing
   - Keep content concise and focused

2. **Connections**
   - Use appropriate curvature for clarity
   - Add arrows for hierarchical relationships
   - Keep connection styles consistent

3. **State Management**
   - Save state after significant changes
   - Validate loaded state before using
   - Implement undo/redo functionality

4. **Performance**
   - Limit number of visible nodes
   - Use connection batching
   - Implement node culling for large maps

## Tips and Tricks

1. **Smart Node Positioning**
   ```javascript
   function calculateOptimalPosition(parentNode) {
       const angle = Math.random() * Math.PI * 2;
       const distance = 200;
       return {
           x: parentNode.x + Math.cos(angle) * distance,
           y: parentNode.y + Math.sin(angle) * distance
       };
   }
   ```

2. **Custom Node Templates**
   ```javascript
   function createTemplateNode(type) {
       const node = mindMap.createNode(0, 0);
       switch(type) {
           case 'task':
               node.styles.backgroundColor = '#e3f2fd';
               node.title = 'New Task';
               break;
           case 'note':
               node.styles.backgroundColor = '#fff3e0';
               node.title = 'Note';
               break;
       }
       return node;
   }
   ```

3. **Auto-Layout**
   ```javascript
   function arrangeNodes() {
       mindMap.nodes.forEach((node, i) => {
           const angle = (i / mindMap.nodes.length) * Math.PI * 2;
           node.x = 400 + Math.cos(angle) * 300;
           node.y = 300 + Math.sin(angle) * 200;
       });
       mindMap.updateConnections();
   }
   ```
