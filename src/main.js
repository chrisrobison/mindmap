// src/main.js
import { MindMap } from './MindMap';

// Add required styles
const styles = `
    .connection-animated {
        transition: d 0.3s ease-in-out;
    }

    .connections path {
        pointer-events: none;
    }

    .connections path:hover {
        stroke-width: 3px;
        filter: brightness(1.2);
    }
`;

// Create and append style element
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialize the mind map
const container = document.querySelector('main');
const mindMap = new MindMap(container);

// Export for global access if needed
window.mindMap = mindMap;
