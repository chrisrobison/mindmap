// src/utils/state.js

/**
 * Handles state management for the mind map application
 */
export const StateManager = {
    STORAGE_KEY: 'mindmap',
    
    /**
     * Saves state to local storage
     * @param {Object} data - State data to save
     * @throws {Error} If data cannot be stringified or saved
     */
    save(data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(this.STORAGE_KEY, serialized);
        } catch (error) {
            console.error('Failed to save state:', error);
            throw new Error('Failed to save mind map state');
        }
    },

    /**
     * Loads state from local storage
     * @returns {Object|null} Parsed state data or null if none exists
     */
    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Failed to load state:', error);
            return null;
        }
    },

    /**
     * Clears saved state from local storage
     */
    clear() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear state:', error);
        }
    },

    /**
     * Creates a backup of the current state
     * @returns {string} Backup data as a JSON string
     */
    createBackup() {
        const state = this.load();
        if (state) {
            return JSON.stringify(state, null, 2);
        }
        return null;
    },

    /**
     * Restores state from a backup
     * @param {string} backup - Backup data as JSON string
     * @returns {boolean} Whether restore was successful
     */
    restoreFromBackup(backup) {
        try {
            const state = JSON.parse(backup);
            this.save(state);
            return true;
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            return false;
        }
    },

    /**
     * Validates state data structure
     * @param {Object} state - State data to validate
     * @returns {boolean} Whether state is valid
     */
    validateState(state) {
        if (!state || typeof state !== 'object') return false;
        
        const requiredFields = ['nodes', 'connections', 'nextId'];
        return requiredFields.every(field => field in state);
    }
};
