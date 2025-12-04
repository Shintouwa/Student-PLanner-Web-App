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

    // --- Focus Timer Logic ---
    let timerIntervalId = null;
    let timerRemainingSeconds = 25 * 60;

    function setupTimerPanel() {
        const appContainer = document.querySelector(".app-container") || document.body;

        // Check if already exists
        if (document.getElementById('timerDisplay')) return;

        const section = document.createElement("section");
        section.className = "card timer-card";
        // Use existing CSS classes where possible
        section.style.marginBottom = "20px";
        section.style.padding = "20px";
        section.style.backgroundColor = "var(--bg-card)";
        section.style.color = "var(--text-main)";
        section.style.borderRadius = "var(--radius-lg)";
        section.style.boxShadow = "var(--shadow-sm)";
        section.style.border = "var(--glass-border)";
        section.style.backdropFilter = "var(--glass-blur)";

        section.innerHTML = `
          <h2 class="section-title" style="margin-top: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-main);">Focus Timer</h2>
          <div class="timer-display" id="timerDisplay" style="font-size: 3em; text-align: center; margin: 20px 0; font-weight: bold; color: var(--text-main);">25:00</div>
          <div class="timer-controls" style="display: flex; justify-content: center; gap: 10px; margin-bottom: 15px;">
            <button type="button" class="btn btn-primary" id="timerStart" style="background: var(--primary-gradient); color: white; border: none; padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer;">Start</button>
            <button type="button" class="btn btn-ghost" id="timerPause" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-main); padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer;">Pause</button>
            <button type="button" class="btn btn-ghost" id="timerReset" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-main); padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer;">Reset</button>
          </div>
          <div class="timer-settings" style="text-align: center; color: var(--text-muted);">
            <label>
              Session length (minutes)
              <input id="timerMinutes" class="input" type="number" min="1" max="180" value="25" style="width: 60px; margin-left: 10px; padding: 5px; background: var(--bg-input); color: var(--text-main); border: 1px solid var(--border-color); border-radius: var(--radius-sm);" />
            </label>
          </div>
        `;

        // Insert after header
        const header = appContainer.querySelector(".app-header");
        if (header && header.nextSibling) {
            appContainer.insertBefore(section, header.nextSibling);
        } else {
            appContainer.prepend(section);
        }

        // Event Listeners
        document.getElementById("timerStart").addEventListener("click", startTimer);
        document.getElementById("timerPause").addEventListener("click", stopTimer);
        document.getElementById("timerReset").addEventListener("click", resetTimer);

        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        const display = document.getElementById("timerDisplay");
        if (!display) return;

        const minutes = Math.floor(timerRemainingSeconds / 60);
        const seconds = timerRemainingSeconds % 60;
        display.textContent = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    }

    function startTimer() {
        const minutesInput = document.getElementById("timerMinutes");
        if (minutesInput && !timerIntervalId) {
            const minutes = parseInt(minutesInput.value, 10);
            if (!isNaN(minutes) && minutes > 0) {
                // Only update remaining seconds from input if we are at the "start" of a cycle 
                // or if the current remaining time is invalid/larger than input
                if (timerRemainingSeconds <= 0 || timerRemainingSeconds > minutes * 60) {
                    timerRemainingSeconds = minutes * 60;
                }
            }
        }

        if (timerIntervalId) return;

        timerIntervalId = window.setInterval(() => {
            timerRemainingSeconds -= 1;
            if (timerRemainingSeconds <= 0) {
                timerRemainingSeconds = 0;
                stopTimer();
                alert("Time's up! Great job focusing.");
            }
            updateTimerDisplay();
        }, 1000);

        updateTimerDisplay();
    }

    function stopTimer() {
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
            timerIntervalId = null;
        }
    }

    function resetTimer() {
        const minutesInput = document.getElementById("timerMinutes");
        let minutes = 25;
        if (minutesInput) {
            const value = parseInt(minutesInput.value, 10);
            if (!isNaN(value) && value > 0) {
                minutes = value;
            }
        }
        timerRemainingSeconds = minutes * 60;
        stopTimer();
        updateTimerDisplay();
    }

    // --- Weekly Stats Logic ---
    function setupWeeklyStatsPanel() {
        const appContainer = document.querySelector(".app-container") || document.body;

        if (document.getElementById("weeklyStats")) return;

        const section = document.createElement("section");
        section.id = "weeklyStats";
        section.className = "card weekly-stats-card";
        // Styling
        section.style.marginTop = "20px";
        section.style.padding = "20px";
        section.style.backgroundColor = "var(--bg-card)";
        section.style.color = "var(--text-main)";
        section.style.borderRadius = "var(--radius-lg)";
        section.style.boxShadow = "var(--shadow-sm)";
        section.style.border = "var(--glass-border)";
        section.style.backdropFilter = "var(--glass-blur)";

        section.innerHTML = `
          <h2 class="section-title" style="margin-top: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-main);">Weekly Progress</h2>
          <div id="weeklyStatsBody" class="weekly-stats-body" style="display: flex; justify-content: space-between; align-items: flex-end; height: 150px; padding-top: 20px;">
            <!-- JS will inject daily stats here -->
          </div>
        `;

        // Insert at the end of main or app container
        const main = appContainer.querySelector("main");
        if (main) {
            main.appendChild(section);
        } else {
            appContainer.appendChild(section);
        }
    }

    function renderWeeklyStats() {
        const container = document.getElementById("weeklyStatsBody");
        if (!container) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const countsByDate = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            countsByDate[key] = 0;
        }

        tasks.forEach(task => {
            if (!task.completedAt) return;
            const completedDate = new Date(task.completedAt);
            completedDate.setHours(0, 0, 0, 0);
            const key = completedDate.toISOString().slice(0, 10);
            if (Object.prototype.hasOwnProperty.call(countsByDate, key)) {
                countsByDate[key] += 1;
            }
        });

        container.innerHTML = "";
        const keys = Object.keys(countsByDate).sort();

        keys.forEach(key => {
            const d = new Date(key);
            const label = d.toLocaleDateString(undefined, { weekday: "short" });
            const count = countsByDate[key];

            const col = document.createElement("div");
            col.style.display = "flex";
            col.style.flexDirection = "column";
            col.style.alignItems = "center";
            col.style.flex = "1";

            const barHeight = count === 0 ? 4 : Math.min(count * 20, 100); // Max 100px or %

            col.innerHTML = `
              <div style="margin-bottom: 5px; font-weight: bold; color: var(--text-main);">${count > 0 ? count : ''}</div>
              <div style="width: 20px; height: ${barHeight}px; background-color: var(--primary-color); border-radius: 4px 4px 0 0; min-height: 4px; opacity: ${count === 0 ? 0.3 : 1};"></div>
              <div style="margin-top: 5px; font-size: 0.8em; color: var(--text-muted);">${label}</div>
            `;

            container.appendChild(col);
        });
    }

    // --- Task Management ---

    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const taskStats = document.getElementById('taskStats');
    const emptyState = document.getElementById('emptyState');

    // Load and Normalize Tasks
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => ({
        id: task.id,
        text: task.text,
        completed: Boolean(task.completed),
        createdAt: task.createdAt || Date.now(),
        priority: task.priority || "medium",
        dueDate: task.dueDate || null,
        completedAt: typeof task.completedAt === "number" ? task.completedAt : (task.completed ? Date.now() : null) // Backfill if needed
    }));

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        renderWeeklyStats();
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
            priority: priority || 'medium',
            createdAt: Date.now(),
            completedAt: null
        };
        tasks.unshift(newTask);
        saveTasks();
    }

    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                const isCompleted = !task.completed;
                return {
                    ...task,
                    completed: isCompleted,
                    completedAt: isCompleted ? Date.now() : null
                };
            }
            return task;
        });
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

    // Initial Setup
    setupTimerPanel();
    setupWeeklyStatsPanel();
    renderTasks();
    renderWeeklyStats();
});
