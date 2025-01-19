// src/MindMap.js
import { Node } from './models/Node';
import { Connection } from './models/Connection';
import { StateManager } from './utils/state';

export class MindMap {
    constructor(container) {
        this.container = container;
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        this.nextId = 1;
        this.zoomLevel = 100;

        this.init();
    }

    init() {
        this.loadState();
        this.setupEventListeners();
        this.render();
    }

    createNode(x, y) {
        const node = new Node(this.nextId++, x, y);
        node.onDelete = (id) => this.deleteNode(id);
        node.onUpdate = () => this.updateConnections();
        this.nodes.push(node);
        this.saveState();
        return node;
    }

    deleteNode(id) {
        const index = this.nodes.findIndex(n => n.id === id);
        if (index !== -1) {
            const node = this.nodes[index];
            node.element.remove();
            this.nodes.splice(index, 1);
            this.connections = this.connections.filter(
                c => c.fromNode.id !== id && c.toNode.id !== id
            );
            this.updateConnections();
            this.saveState();
            
            if (this.selectedNode && this.selectedNode.id === id) {
                this.selectedNode = null;
                this.hidePropertiesPanel();
            }
        }
    }

    createConnection(fromId, toId, options = {}) {
        const fromNode = this.nodes.find(n => n.id === fromId);
        const toNode = this.nodes.find(n => n.id === toId);
        
        if (fromNode && toNode) {
            const exists = this.connections.some(c => 
                (c.fromNode.id === fromId && c.toNode.id === toId) ||
                (c.fromNode.id === toId && c.toNode.id === fromId)
            );
            
            if (!exists) {
                const connection = new Connection(fromNode, toNode, options);
                connection.onUpdate = () => this.updateConnections();
                this.connections.push(connection);
                this.updateConnections();
                this.saveState();
                return connection;
            }
        }
        return null;
    }

    updateConnections() {
        const svg = document.querySelector('.connections');
        svg.innerHTML = '';
        
        this.connections.forEach(conn => {
            const pathElement = conn.render(svg);
            svg.appendChild(pathElement);
        });
    }

    zoom(direction) {
        const zoomStep = 10;
        
        if (direction === 'in' && this.zoomLevel < 200) {
            this.zoomLevel += zoomStep;
        } else if (direction === 'out' && this.zoomLevel > 50) {
            this.zoomLevel -= zoomStep;
        }

        this.container.style.transform = `scale(${this.zoomLevel / 100})`;
        this.container.style.transformOrigin = 'center center';
        
        document.querySelector('.zoom-level').textContent = `${this.zoomLevel}%`;
        this.updateConnections();
        this.saveState();
    }

// src/MindMap.js (continued)
    saveState() {
        const state = {
            nodes: this.nodes.map(n => ({
                id: n.id,
                x: n.x,
                y: n.y,
                width: n.width,
                height: n.height,
                title: n.title,
                html: n.element.querySelector('.node-content').innerHTML,
                images: n.images,
                styles: n.styles
            })),
            connections: this.connections.map(c => ({
                fromId: c.fromNode.id,
                toId: c.toNode.id,
                title: c.title,
                styles: c.styles
            })),
            nextId: this.nextId,
            zoomLevel: this.zoomLevel
        };
        
        StateManager.save(state);
    }

    loadState() {
        const state = StateManager.load();
        if (state) {
            this.nextId = state.nextId;
            this.zoomLevel = state.zoomLevel || 100;
            
            // Apply zoom level
            this.container.style.transform = `scale(${this.zoomLevel / 100})`;
            document.querySelector('.zoom-level').textContent = `${this.zoomLevel}%`;

            // Create nodes
            state.nodes.forEach(n => {
                const node = new Node(n.id, n.x, n.y, n.title, {
                    width: n.width,
                    height: n.height,
                    html: n.html || ''
                });
                node.styles = n.styles || node.styles;
                node.images = n.images || [];
                node.onDelete = (id) => this.deleteNode(id);
                node.onUpdate = () => this.updateConnections();
                this.nodes.push(node);
            });

            // Restore connections
            if (state.connections) {
                state.connections.forEach(conn => {
                    this.createConnection(conn.fromId, conn.toId, {
                        title: conn.title,
                        ...conn.styles
                    });
                });
            }
            
            this.updateConnections();
        }
    }

    setupEventListeners() {
        // Main canvas click handler
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                const newNode = this.createNode(e.clientX, e.clientY);
                if (this.selectedNode) {
                    this.createConnection(this.selectedNode.id, newNode.id);
                }
            }
        });

        // Node selection handler
        document.addEventListener('click', (e) => {
            const nodeElement = e.target.closest('.mindmap-node');
            
            if (nodeElement) {
                const clickedNodeId = parseInt(nodeElement.dataset.id);
                const clickedNode = this.nodes.find(n => n.id === clickedNodeId);
                
                if (e.ctrlKey && this.selectedNode && this.selectedNode.id !== clickedNodeId) {
                    this.createConnection(this.selectedNode.id, clickedNodeId);
                    return;
                }
                
                this.nodes.forEach(node => {
                    node.element.classList.remove('selected');
                });
                nodeElement.classList.add('selected');
                this.selectedNode = clickedNode;
                this.updatePropertiesPanel();
            } else {
                if (!e.target.closest('.properties-panel')) {
                    this.nodes.forEach(node => {
                        node.element.classList.remove('selected');
                    });
                    this.selectedNode = null;
                    this.hidePropertiesPanel();
                }
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedNode) {
                if (!e.target.matches('input, textarea, [contenteditable=true]')) {
                    this.deleteNode(this.selectedNode.id);
                }
            }
        });

        // Context menu
        document.addEventListener('contextmenu', (e) => {
            const nodeElement = e.target.closest('.mindmap-node');
            if (nodeElement) {
                e.preventDefault();
                const nodeId = parseInt(nodeElement.dataset.id);
                if (confirm('Delete this node and its connections?')) {
                    this.deleteNode(nodeId);
                }
            }
        });
    }

    render() {
        const svg = document.querySelector('.connections');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        this.updateConnections();
    }

    updatePropertiesPanel() {
        // Implementation of properties panel update...
        // This would be moved to a separate PropertiesPanel class in a full implementation
    }

    hidePropertiesPanel() {
        const panel = document.querySelector('.properties-panel');
        panel.classList.remove('visible');
    }
}
