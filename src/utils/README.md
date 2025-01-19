# Mind Map Utilities Documentation

## Table of Contents
- [Bindings Utility](#bindings-utility)
- [DOM Utility](#dom-utility)
- [SVG Utility](#svg-utility)
- [State Management Utility](#state-management-utility)

## Bindings Utility

The bindings utility provides reactive property binding functionality using JavaScript Proxies.

### createBindings

Creates a proxy-based binding system that tracks property changes.

```javascript
import { createBindings } from './utils/bindings';

// Simple property tracking
const person = createBindings(
    { name: 'John', age: 30 },
    (prop, newValue, oldValue) => {
        console.log(`${prop} changed from ${oldValue} to ${newValue}`);
    }
);

person.name = 'Jane'; // Logs: "name changed from John to Jane"

// Using with nested objects
const node = createBindings({
    styles: {
        color: 'blue',
        fontSize: '12px'
    }
}, (prop, value) => {
    updateDisplay();
});

node.styles.color = 'red'; // Triggers update
```

### bindElementProperty

Binds a DOM element property to a callback.

```javascript
import { bindElementProperty } from './utils/bindings';

const element = document.querySelector('#myElement');
bindElementProperty(element, 'textContent', (newValue) => {
    console.log(`Content changed to: ${newValue}`);
});
```

## DOM Utility

The DOM utility provides helper functions for common DOM operations.

### createElement

Creates HTML elements with specified attributes.

```javascript
import { DOMUtils } from './utils/dom';

// Create a simple div
const div = DOMUtils.createElement('div', 'my-class');

// Create an input with attributes
const input = DOMUtils.createElement('input', 'form-input', {
    type: 'text',
    placeholder: 'Enter name',
    required: true
});

// Create a complex element
const button = DOMUtils.createElement('button', 'btn btn-primary', {
    type: 'submit',
    'data-action': 'save'
});
```

### setStyles

Apply multiple styles to an element.

```javascript
DOMUtils.setStyles(element, {
    backgroundColor: '#fff',
    borderRadius: '4px',
    padding: '10px'
});
```

### Position Utilities

Work with element positions and containment.

```javascript
// Get element position
const pos = DOMUtils.getElementPosition(element);
console.log(`Element is at ${pos.x}, ${pos.y}`);

// Check if point is inside element
const contains = DOMUtils.elementContainsPoint(element, 100, 200);
```

## SVG Utility

The SVG utility helps create and manipulate SVG elements.

### Basic SVG Elements

```javascript
import { SVGUtils } from './utils/svg';

// Create SVG elements
const circle = SVGUtils.createSVGElement('circle');
circle.setAttribute('r', '5');

// Ensure defs section exists
const defs = SVGUtils.ensureDefs(svgElement);
```

### Creating Markers (e.g., for arrows)

```javascript
const marker = SVGUtils.createMarker(svgElement, 'arrow-head', {
    markerWidth: '10',
    markerHeight: '7',
    refX: '9',
    refY: '3.5',
    orient: 'auto'
});
```

### Creating Curved Paths

```javascript
// Calculate control points for a curve
const points = SVGUtils.calculateControlPoints(
    { x: 0, y: 0 },    // start
    { x: 100, y: 100 }, // end
    0.5                 // curvature
);

// Create a curved path
const pathData = SVGUtils.createCurvePath(
    { x: 0, y: 0 },
    { x: 100, y: 100 },
    points.control1,
    points.control2
);

const path = SVGUtils.createSVGElement('path');
path.setAttribute('d', pathData);
```

## State Management Utility

The state management utility handles saving and loading application state.

### Basic State Operations

```javascript
import { StateManager } from './utils/state';

// Save state
const state = {
    nodes: [...],
    connections: [...],
    nextId: 5
};
StateManager.save(state);

// Load state
const savedState = StateManager.load();

// Clear state
StateManager.clear();
```

### Backup and Restore

```javascript
// Create a backup
const backup = StateManager.createBackup();

// Restore from backup
if (backup) {
    const success = StateManager.restoreFromBackup(backup);
    if (success) {
        console.log('State restored successfully');
    }
}
```

### State Validation

```javascript
const state = StateManager.load();
if (StateManager.validateState(state)) {
    // State is valid, proceed with loading
} else {
    // Handle invalid state
    StateManager.clear();
}
```

## Common Use Cases

### Creating a New Node

```javascript
// Create the node element
const nodeElement = DOMUtils.createElement('div', 'mindmap-node', {
    'data-id': id
});

// Add styles
DOMUtils.setStyles(nodeElement, {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`
});

// Create bindings for properties
const nodeProps = createBindings({
    x, y, width, height
}, (prop, value) => {
    if (prop === 'x') nodeElement.style.left = `${value}px`;
    if (prop === 'y') nodeElement.style.top = `${value}px`;
});
```

### Creating a Connection

```javascript
// Create SVG elements for connection
const path = SVGUtils.createSVGElement('path');
const points = SVGUtils.calculateControlPoints(startPos, endPos);
const pathData = SVGUtils.createCurvePath(startPos, endPos, points.control1, points.control2);
path.setAttribute('d', pathData);

// Add arrow marker
SVGUtils.createMarker(svg, 'arrow-marker', {
    markerWidth: '10',
    markerHeight: '7',
    refX: '9',
    refY: '3.5',
    orient: 'auto'
});
```

### Saving Application State

```javascript
// Save current state
const state = {
    nodes: nodes.map(node => ({
        id: node.id,
        x: node.x,
        y: node.y,
        content: node.content
    })),
    connections: connections.map(conn => ({
        from: conn.from,
        to: conn.to,
        type: conn.type
    }))
};

if (StateManager.validateState(state)) {
    StateManager.save(state);
}
```

## Best Practices

1. **Error Handling**
   - Always wrap state operations in try-catch blocks
   - Provide fallback behavior for failed operations
   - Validate state before saving or loading

2. **Performance**
   - Use batch operations when making multiple DOM changes
   - Cache frequently accessed elements
   - Minimize unnecessary state saves

3. **Event Handling**
   - Use event delegation where appropriate
   - Clean up event listeners when elements are removed
   - Debounce frequent events like resize or mouse move

4. **State Management**
   - Keep state structure consistent
   - Validate state before using it
   - Create regular backups for large mind maps

## Tips and Tricks

1. **Dynamic Styling**
   ```javascript
   // Create style bindings that update automatically
   const styleBindings = createBindings(
       node.styles,
       (prop, value) => DOMUtils.setStyles(element, { [prop]: value })
   );
   ```

2. **Smooth Animations**
   ```javascript
   // Add transition class before updating position
   element.classList.add('moving');
   DOMUtils.setStyles(element, { left, top });
   setTimeout(() => element.classList.remove('moving'), 300);
   ```

3. **Efficient State Updates**
   ```javascript
   // Batch multiple state changes
   StateManager.save({
       ...StateManager.load(),
       ...updates
   });
   ```
