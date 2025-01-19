// src/utils/dom.js

/**
 * Utility functions for DOM manipulation
 */
export const DOMUtils = {
    /**
     * Creates an HTML element with specified attributes
     * @param {string} type - Element type (div, span, etc.)
     * @param {string} className - CSS classes to add
     * @param {Object} attributes - HTML attributes to set
     * @returns {HTMLElement} The created element
     */
    createElement(type, className = '', attributes = {}) {
        const element = document.createElement(type);
        if (className) {
            element.className = className;
        }
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (typeof value === 'boolean') {
                element.toggleAttribute(key, value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    },

    /**
     * Adds event listeners to an element
     * @param {HTMLElement} element - Target element
     * @param {Object} listeners - Map of event types to handlers
     */
    addEventListeners(element, listeners) {
        Object.entries(listeners).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
        });
    },

    /**
     * Sets multiple styles on an element
     * @param {HTMLElement} element - Target element
     * @param {Object} styles - Style properties to set
     */
    setStyles(element, styles) {
        Object.entries(styles).forEach(([property, value]) => {
            element.style[property] = value;
        });
    },

    /**
     * Returns the computed position of an element relative to the document
     * @param {HTMLElement} element - Target element
     * @returns {Object} Position with x and y coordinates
     */
    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        const scroll = {
            top: window.pageYOffset || document.documentElement.scrollTop,
            left: window.pageXOffset || document.documentElement.scrollLeft
        };
        
        return {
            x: rect.left + scroll.left,
            y: rect.top + scroll.top
        };
    },

    /**
     * Checks if an element contains a point
     * @param {HTMLElement} element - Element to check
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} Whether the point is inside the element
     */
    elementContainsPoint(element, x, y) {
        const rect = element.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && 
               y >= rect.top && y <= rect.bottom;
    }
};
