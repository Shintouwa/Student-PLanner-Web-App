/**
 * app.js - Core logic for Task Manager
 */

(function () {
    // --- State ---
    let tasks = [];
    let currentFilter = 'all'; // 'all', 'pending', 'completed'

    // --- DOM Elements ---
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const taskStats = document.getElementById('taskStats');
    const emptyState = document.getElementById('emptyState');
    const filterButtons = {
        all: document.getElementById('filterAll'),
        pending: document.getElementById('filterPending'),
        completed: document.getElementById('filterCompleted')
    };

    // --- Storage / Sync ---

    function loadTasksFromStorage() {
        // Use antigravity.js API
        if (window.ag && typeof window.ag.loadTasks === 'function') {
            tasks = window.ag.loadTasks() || [];
        } else {
            // Fallback if ag is missing (though it shouldn't be)
            console.warn('Antigravity API not found, falling back to localStorage');
            const saved = localStorage.getItem('antigravity_tasks');
            tasks = saved ? JSON.parse(saved) : [];
        }
    }

    function saveTasksToStorage() {
        // Use antigravity.js API
        if (window.ag && typeof window.ag.saveTasks === 'function') {
            window.ag.saveTasks(tasks);
        } else {
            console.warn('Antigravity API not found, falling back to localStorage');
            localStorage.setItem('antigravity_tasks', JSON.stringify(tasks));
        }
    }

    // --- Core Logic ---

    function addTask(text) {
        const trimmed = text.trim();
        if (!trimmed) return;

        const newTask = {
            id: Date.now().toString(),
            text: trimmed,
            completed: false,
            createdAt: Date.now()
        };

        tasks.push(newTask);
        saveTasksToStorage();
        renderTasks();
        taskInput.value = '';
    }

    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        task.completed = !task.completed;
        saveTasksToStorage();
        renderTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasksToStorage();
        renderTasks();
    }

    function setFilter(filterType) {
        currentFilter = filterType;

        // Update active button state
        Object.values(filterButtons).forEach(btn => btn.classList.remove('active'));
        filterButtons[filterType].classList.add('active');

        renderTasks();
    }

    // --- Rendering ---

    function renderTasks() {
        // 1. Filter tasks
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        // 2. Update Stats
        const remaining = tasks.filter(t => !t.completed).length;
        taskStats.innerHTML = `<span>${remaining} task${remaining !== 1 ? 's' : ''} remaining</span>`;

        // 3. Clear List
        taskList.innerHTML = '';

        // 4. Show/Hide Empty State
        if (tasks.length === 0) {
            emptyState.style.display = 'block';
            taskList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            taskList.style.display = 'block';
        }

        // 5. Render Items
        filteredTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task ${task.completed ? 'completed' : ''}`;
            taskEl.dataset.id = task.id;

            taskEl.innerHTML = `
                <label class="custom-checkbox">
                    <input type="checkbox" data-action="toggle" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <span class="text">${escapeHtml(task.text)}</span>
                <button class="delete-btn" data-action="delete" aria-label="Delete task">✕</button>
            `;

            taskList.appendChild(taskEl);
        });
    }

    // Helper to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- Event Listeners ---

    function setupEventListeners() {
        // Form Submit
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addTask(taskInput.value);
        });

        // Task List Delegation (Toggle & Delete)
        taskList.addEventListener('click', (e) => {
            const target = e.target;
            const taskEl = target.closest('.task');
            if (!taskEl) return;

            const id = taskEl.dataset.id;

            if (target.dataset.action === 'delete' || target.closest('[data-action="delete"]')) {
                deleteTask(id);
            } else if (target.dataset.action === 'toggle' || target.closest('label')) {
                // The change event on checkbox handles the toggle logic better usually, 
                // but click delegation works too if we are careful. 
                // Let's use the 'change' event for the checkbox specifically to be robust.
            }
        });

        // Better handling for checkbox toggle
        taskList.addEventListener('change', (e) => {
            if (e.target.dataset.action === 'toggle') {
                const taskEl = e.target.closest('.task');
                if (taskEl) {
                    toggleTask(taskEl.dataset.id);
                }
            }
        });

        // Filters
        filterButtons.all.addEventListener('click', () => setFilter('all'));
        filterButtons.pending.addEventListener('click', () => setFilter('pending'));
        filterButtons.completed.addEventListener('click', () => setFilter('completed'));
    }

    // --- Initialization ---

    function init() {
        loadTasksFromStorage();
        renderTasks();
        setupEventListeners();
        console.log('Task Manager App Initialized');
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // --- Public API ---
    window.App = {
        addTask,
        deleteTask,
        toggleTask,
        getTasks: () => [...tasks]
    };

})();
