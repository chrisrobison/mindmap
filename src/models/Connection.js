// src/models/Connection.js
import { createBindings } from '../utils/bindings';
import { SVGUtils } from '../utils/svg';

export class Connection {
    constructor(fromNode, toNode, options = {}) {
        this.id = `conn_${fromNode.id}_${toNode.id}`;
        this.fromNode = fromNode;
        this.toNode = toNode;
        this.title = options.title || '';

        this.styles = {
            strokeColor: options.strokeColor || '#666666',
            strokeWidth: options.strokeWidth || 2,
            strokeStyle: options.strokeStyle || 'solid',
            curvature: options.curvature || 0.5,
            animated: options.animated || true,
            arrowHead: options.arrowHead || false
        };

        this.properties = createBindings({
            fromNode,
            toNode,
            title: this.title,
            styles: this.styles
        }, (prop, value) => this.handlePropertyChange(prop, value));

        this.pathElement = null;
    }

    handlePropertyChange(prop, value) {
        if (this.pathElement) {
            if (prop.startsWith('styles.')) {
                this.updateStyles();
            }
            this.onUpdate?.();
        }
    }

    getNodeCenter(node) {
        return {
            x: node.x + node.width / 2,
            y: node.y + node.height / 2
        };
    }

    calculateControlPoints() {
        const fromCenter = this.getNodeCenter(this.fromNode);
        const toCenter = this.getNodeCenter(this.toNode);
        
        const dx = toCenter.x - fromCenter.x;
        const dy = toCenter.y - fromCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const offset = distance * this.styles.curvature;

        return {
            cp1: {
                x: fromCenter.x + dx / 3,
                y: fromCenter.y + (dy / 3) - offset
            },
            cp2: {
                x: fromCenter.x + (dx * 2) / 3,
                y: fromCenter.y + (dy * 2) / 3 + offset
            }
        };
    }

    generatePath() {
        const fromCenter = this.getNodeCenter(this.fromNode);
        const toCenter = this.getNodeCenter(this.toNode);
        const cp = this.calculateControlPoints();

        return `M ${fromCenter.x},${fromCenter.y} ` +
               `C ${cp.cp1.x},${cp.cp1.y} ` +
               `${cp.cp2.x},${cp.cp2.y} ` +
               `${toCenter.x},${toCenter.y}`;
    }

    setupArrowMarker(svg) {
        if (!this.styles.arrowHead) return null;

        const markerId = `arrowhead-${this.styles.strokeColor.slice(1)}`;
        let marker = svg.querySelector(`#${markerId}`);
        
        if (!marker) {
            const defs = SVGUtils.ensureDefs(svg);
            marker = SVGUtils.createSVGElement('marker');
            
            Object.entries({
                id: markerId,
                markerWidth: '10',
                markerHeight: '7',
                refX: '9',
                refY: '3.5',
                orient: 'auto'
            }).forEach(([key, value]) => marker.setAttribute(key, value));

            const polygon = SVGUtils.createSVGElement('polygon');
            polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
            polygon.setAttribute('fill', this.styles.strokeColor);
            
            marker.appendChild(polygon);
            defs.appendChild(marker);
        }

        return markerId;
    }

    render(svg) {
        this.pathElement = SVGUtils.createSVGElement('path');
        this.updatePath();
        this.updateStyles();

        const markerId = this.setupArrowMarker(svg);
        if (markerId) {
            this.pathElement.setAttribute('marker-end', `url(#${markerId})`);
        }

        return this.pathElement;
    }

    updatePath() {
        if (this.pathElement) {
            this.pathElement.setAttribute('d', this.generatePath());
        }
    }

    updateStyles() {
        if (this.pathElement) {
            this.pathElement.setAttribute('stroke', this.styles.strokeColor);
            this.pathElement.setAttribute('stroke-width', this.styles.strokeWidth);
            this.pathElement.setAttribute('fill', 'none');
            
            // Update stroke style
            if (this.styles.strokeStyle === 'dashed') {
                this.pathElement.setAttribute('stroke-dasharray', '5,5');
            } else if (this.styles.strokeStyle === 'dotted') {
                this.pathElement.setAttribute('stroke-dasharray', '2,2');
            } else {
                this.pathElement.removeAttribute('stroke-dasharray');
            }
            
            // Update animation class
            if (this.styles.animated) {
                this.pathElement.classList.add('connection-animated');
            } else {
                this.pathElement.classList.remove('connection-animated');
            }
        }
    }
}
