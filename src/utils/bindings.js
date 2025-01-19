// src/utils/bindings.js

/**
 * Creates a proxy-based binding system for tracking and responding to property changes
 * @param {Object} target - The object to create bindings for
 * @param {Function} onChange - Callback function called when properties change
 * @returns {Proxy} A proxy object that triggers the callback on property changes
 */
export const createBindings = (target, onChange) => {
    const handler = {
        set(obj, prop, value) {
            const oldValue = obj[prop];
            const result = Reflect.set(obj, prop, value);
            
            // Only trigger if value actually changed
            if (oldValue !== value) {
                onChange(prop, value, oldValue);
            }
            
            return result;
        },

        get(obj, prop) {
            // Handle nested objects recursively
            const value = obj[prop];
            if (typeof value === 'object' && value !== null) {
                return new Proxy(value, handler);
            }
            return value;
        }
    };

    return new Proxy(target, handler);
};

/**
 * Creates a binding for a specific DOM element property
 * @param {HTMLElement} element - The DOM element to bind to
 * @param {string} property - The property to bind
 * @param {Function} callback - Function to call when the property changes
 */
export const bindElementProperty = (element, property, callback) => {
    const descriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(element), 
        property
    );

    if (descriptor && descriptor.set) {
        Object.defineProperty(element, property, {
            set(value) {
                descriptor.set.call(this, value);
                callback(value);
            },
            get() {
                return descriptor.get.call(this);
            }
        });
    }
};
