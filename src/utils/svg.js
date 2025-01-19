// src/utils/svg.js

/**
 * Utility functions for SVG manipulation
 */
export const SVGUtils = {
    /**
     * Creates an SVG element of the specified type
     * @param {string} type - SVG element type (path, circle, etc.)
     * @returns {SVGElement} The created SVG element
     */
    createSVGElement(type) {
        return document.createElementNS('http://www.w3.org/2000/svg', type);
    },

    /**
     * Ensures an SVG element has a defs section
     * @param {SVGElement} svg - The SVG element to check
     * @returns {SVGDefsElement} The defs element
     */
    ensureDefs(svg) {
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = this.createSVGElement('defs');
            svg.insertBefore(defs, svg.firstChild);
        }
        return defs;
    },

    /**
     * Creates or updates an SVG marker element
     * @param {SVGElement} svg - Parent SVG element
     * @param {string} id - Marker ID
     * @param {Object} config - Marker configuration
     * @returns {SVGMarkerElement} The marker element
     */
    createMarker(svg, id, config) {
        const defs = this.ensureDefs(svg);
        let marker = svg.querySelector(`#${id}`);
        
        if (!marker) {
            marker = this.createSVGElement('marker');
            marker.setAttribute('id', id);
            defs.appendChild(marker);
        }

        // Set marker attributes
        Object.entries(config).forEach(([key, value]) => {
            marker.setAttribute(key, value);
        });

        return marker;
    },

    /**
     * Creates an SVG path with a bezier curve
     * @param {Object} start - Start point {x, y}
     * @param {Object} end - End point {x, y}
     * @param {Object} control1 - First control point {x, y}
     * @param {Object} control2 - Second control point {x, y}
     * @returns {string} SVG path data string
     */
    createCurvePath(start, end, control1, control2) {
        return `M ${start.x},${start.y} ` +
               `C ${control1.x},${control1.y} ` +
               `${control2.x},${control2.y} ` +
               `${end.x},${end.y}`;
    },

    /**
     * Calculates control points for a smooth curve between two points
     * @param {Object} start - Start point {x, y}
     * @param {Object} end - End point {x, y}
     * @param {number} curvature - Curve intensity (0-1)
     * @returns {Object} Control points {control1, control2}
     */
    calculateControlPoints(start, end, curvature = 0.5) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const offset = distance * curvature;

        return {
            control1: {
                x: start.x + dx / 3,
                y: start.y + (dy / 3) - offset
            },
            control2: {
                x: start.x + (dx * 2) / 3,
                y: start.y + (dy * 2) / 3 + offset
            }
        };
    }
};
