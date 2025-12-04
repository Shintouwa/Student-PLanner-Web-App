document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Management ---
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        htmlElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-mode'); // For compatibility
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            if (newTheme === 'dark') {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        });
    }

    // --- Priority UI Injection ---
    const taskForm = document.getElementById('taskForm');
    let prioritySelect = document.getElementById('prioritySelect');

    if (taskForm && !prioritySelect) {
        // Create and inject priority select if it doesn't exist
        const container = document.createElement('div');
        container.className = 'priority-selector';
        container.style.marginBottom = '10px';
        container.style.marginTop = '10px';

        const label = document.createElement('label');
        label.textContent = 'Priority: ';
        label.style.marginRight = '5px';
        label.style.color = 'var(--text-color, inherit)';

        prioritySelect = document.createElement('select');
        prioritySelect.id = 'prioritySelect';
        prioritySelect.innerHTML = `
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
        `;
        prioritySelect.style.padding = '5px';
        prioritySelect.style.borderRadius = '4px';

        container.appendChild(label);
        container.appendChild(prioritySelect);

        // Insert before the submit button
        const submitBtn = taskForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            taskForm.insertBefore(container, submitBtn);
        } else {
            taskForm.appendChild(container);
        }
    }

    // --- Task Management ---

    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const taskStats = document.getElementById('taskStats');
    const emptyState = document.getElementById('emptyState');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks(filter = 'all') {
        if (!taskList) return;
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (filter === 'pending') return !task.completed;
            if (filter === 'completed') return task.completed;
            return true;
        });

        // Sort by Priority (High -> Medium -> Low)
        const priorityRank = { high: 0, medium: 1, low: 2 };
        filteredTasks.sort((a, b) => {
            const pA = a.priority || 'medium';
            const pB = b.priority || 'medium';
            return priorityRank[pA] - priorityRank[pB];
        });

        if (filteredTasks.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';

            filteredTasks.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.className = `task ${task.completed ? 'completed' : ''}`;
                taskEl.setAttribute('data-id', task.id);

                // Priority Badge
                const priority = task.priority || 'medium';
                const priorityColor = priority === 'high' ? '#ffcccc' : (priority === 'medium' ? '#fff4cc' : '#ccffcc');
                const priorityBadge = `<span style="font-size: 0.75em; margin-left: 8px; padding: 2px 6px; border-radius: 4px; background-color: ${priorityColor}; color: #333; text-transform: uppercase;">${priority}</span>`;

                taskEl.innerHTML = `
                    <label class="custom-checkbox">
                        <input type="checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                    <span class="text">${escapeHtml(task.text)} ${priorityBadge}</span>
                    <button class="delete-btn" aria-label="Delete task">✕</button>
                `;

                // Event Listeners
                const checkbox = taskEl.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', () => toggleTask(task.id));

                const deleteBtn = taskEl.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => deleteTask(task.id));

                taskList.appendChild(taskEl);
            });
        }

        updateStats();
    }

    function addTask(text, priority) {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: priority || 'medium'
        };
        tasks.unshift(newTask);
        saveTasks();
    }

    function toggleTask(id) {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
    }

    function updateStats() {
        if (!taskStats) return;
        const remaining = tasks.filter(t => !t.completed).length;
        taskStats.innerHTML = `<span>${remaining} task${remaining !== 1 ? 's' : ''} remaining</span>`;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = taskInput.value.trim();
            const priority = prioritySelect ? prioritySelect.value : 'medium';
            if (text) {
                addTask(text, priority);
                taskInput.value = '';
                if (prioritySelect) prioritySelect.value = 'medium';
            }
        });
    }

    // Filter Buttons
    const filterAll = document.getElementById('filterAll');
    if (filterAll) filterAll.addEventListener('click', (e) => {
        setActiveFilter(e.target);
        renderTasks('all');
    });

    const filterPending = document.getElementById('filterPending');
    if (filterPending) filterPending.addEventListener('click', (e) => {
        setActiveFilter(e.target);
        renderTasks('pending');
    });

    const filterCompleted = document.getElementById('filterCompleted');
    if (filterCompleted) filterCompleted.addEventListener('click', (e) => {
        setActiveFilter(e.target);
        renderTasks('completed');
    });

    function setActiveFilter(btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    // Initial Render
    renderTasks();
});
