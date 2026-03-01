let tasks = [];
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');

function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        tasks = JSON.parse(saved);
        tasks = tasks.map(task => {
            if (typeof task === 'string') {
                return { text: task, completed: false };
            }
            return task;
        });
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state">No hay tareas. ¡Agrega una para empezar!</div>';
        return;
    }

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' completed' : ''); 
        
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        
        const checkboxLabel = document.createElement('label');
        checkboxLabel.className = 'checkbox-container';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.onchange = function() { toggleTask(index); };
        
        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(checkmark);

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text; 
        
        taskContent.appendChild(checkboxLabel);
        taskContent.appendChild(taskText);
        
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Editar';
        editBtn.onclick = function() { editTask(index); };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.onclick = function() { deleteTask(index); };
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        li.appendChild(taskContent);
        li.appendChild(actions);
        taskList.appendChild(li);
    });
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('Por favor escribe una tarea');
        return;
    }

    tasks.push({ text: taskText, completed: false });
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
}

function deleteTask(index) {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }
}

function editTask(index) {
    const taskItems = taskList.children;
    const taskItem = taskItems[index];
    const currentText = tasks[index].text;
    
    taskItem.innerHTML = '';
    
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = currentText;
    
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Guardar';
    saveBtn.onclick = function() { saveTask(index, editInput.value); };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.onclick = function() { renderTasks(); };
    
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
    taskItem.appendChild(editInput);
    taskItem.appendChild(actions);
    
    editInput.focus();
    editInput.select();
}

function saveTask(index, newText) {
    newText = newText.trim();
    
    if (newText === '') {
        alert('La tarea no puede estar vacía');
        return;
    }

    tasks[index].text = newText;
    saveTasks();
    renderTasks();
}

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

loadTasks();