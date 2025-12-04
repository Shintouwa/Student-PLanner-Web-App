/**
 * antigravity.js - Shared library for task management
 * 
 * Provides utilities for:
 * - Storing / loading data
 * - Syncing / logging
 */

(function() {
    const STORAGE_KEY = 'antigravity_tasks';

    const antigravity = {
        /**
         * Loads tasks from storage.
         * @returns {Array} Array of task objects or empty array if none found.
         */
        loadTasks: function() {
            console.log('[Antigravity] Loading tasks...');
            const data = localStorage.getItem(STORAGE_KEY);
            try {
                const tasks = data ? JSON.parse(data) : [];
                console.log(`[Antigravity] Loaded ${tasks.length} tasks.`);
                return tasks;
            } catch (e) {
                console.error('[Antigravity] Error parsing tasks:', e);
                return [];
            }
        },

        /**
         * Saves tasks to storage and simulates syncing.
         * @param {Array} tasks - Array of task objects to save.
         */
        saveTasks: function(tasks) {
            console.log('[Antigravity] Saving tasks...', tasks);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
                this.sync(tasks);
                return true;
            } catch (e) {
                console.error('[Antigravity] Error saving tasks:', e);
                return false;
            }
        },

        /**
         * Simulates syncing data to a remote server.
         * @param {Array} data - Data to sync.
         */
        sync: function(data) {
            // Simulate network delay and sync
            console.log('[Antigravity] Syncing to cloud...');
            setTimeout(() => {
                console.log('[Antigravity] Sync complete.');
            }, 500);
        },

        /**
         * Helper to log events.
         * @param {string} message 
         */
        log: function(message) {
            console.log(`[Antigravity Log] ${message}`);
        }
    };

    // Expose to global scope
    window.antigravity = antigravity;
    window.ag = antigravity; // Alias

    console.log('[Antigravity] Library initialized.');
})();
