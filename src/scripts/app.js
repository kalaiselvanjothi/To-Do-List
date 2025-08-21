document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');

    // Notification element
    let notification = document.createElement('div');
    notification.id = 'notification';
    document.body.appendChild(notification);

    // In-memory task array
    let tasks = [];

    // Load tasks from storage
    loadTasksFromStorage();

    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTask();
    });

    taskList.addEventListener('click', (event) => {
        const li = event.target.closest('li');
        if (!li) return;
        const id = li.dataset.id;

        if (event.target.classList.contains('remove-task-button')) {
            if (confirm("Are you sure you want to delete this task?")) {
                tasks = tasks.filter(task => task.id !== id);
                saveTasksToStorage();
                renderTasks();
                showNotification("Task removed!", "success");
            }
        }
        if (event.target.classList.contains('edit-task-button')) {
            startEditTask(li, id);
        }
        if (event.target.classList.contains('save-task-button')) {
            saveEditTask(li, id);
        }
    });

    function showNotification(message, type="error") {
        notification.textContent = message;
        notification.className = 'show ' + type;
        setTimeout(() => {
            notification.className = '';
        }, 2000);
    }

    function saveTasksToStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasksFromStorage() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            renderTasks();
        }
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            showNotification('Please enter a task!', "error");
            taskInput.focus();
            return;
        }
        const id = Date.now().toString();
        tasks.push({ id, text: taskText, completed: false });
        saveTasksToStorage();
        renderTasks();
        taskInput.value = '';
        taskInput.focus();
        showNotification("Task added!", "success");
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id;
            li.innerHTML = `
                <span class="task-text ${task.completed ? 'completed' : ''}">
                    ${task.text}
                </span>
                <div class="task-actions">
                    <button class="edit-task-button">Edit</button>
                    <button class="remove-task-button">Remove</button>
                </div>
            `;
            // toggle complete
            li.querySelector('.task-text').addEventListener('click', () => {
                task.completed = !task.completed;
                saveTasksToStorage();
                renderTasks();
            });
            taskList.appendChild(li);
        });
    }

    function startEditTask(li, id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        li.innerHTML = `
            <input type="text" class="edit-input" value="${task.text}">
            <div class="task-actions">
                <button class="save-task-button">Save</button>
                <button class="remove-task-button">Remove</button>
            </div>
        `;
        li.querySelector('.edit-input').focus();
        li.querySelector('.edit-input').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                saveEditTask(li, id);
            }
        });
    }

    function saveEditTask(li, id) {
        const input = li.querySelector('.edit-input');
        const newText = input.value.trim();
        if (newText === '') return;
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.text = newText;
            saveTasksToStorage();
            renderTasks();
            showNotification("Task updated!", "success");
        }
    }
});
