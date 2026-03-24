// Cargar tareas guardadas
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Obtener elementos del HTML
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

// Guardar tareas en el navegador
function guardar() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Mostrar tareas en pantalla
function mostrarTareas() {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = 
        '<div class="empty-state">No hay tareas. ¡Agrega una!</div>';
        return;
    }

    tasks.forEach(function (tarea, i) {
        let li = document.createElement("li");

        // Si está completada, agregar clase
        if (tarea.completed) {
            li.className = "task-item completed";
        } else {
            li.className = "task-item";
        }

        li.innerHTML =
            '<div class="task-content">' +
            '<input type="checkbox" ' +
            (tarea.completed ? "checked" : "") +
            ' onchange="cambiarEstado(' + i + ')">' +
            '<span class="task-text">' + tarea.text + '</span>' +
            '</div>' +
            '<div class="task-actions">' +
            '<button onclick="editar(' + i + ')">Editar</button>' +
            '<button onclick="eliminar(' + i + ')">Eliminar</button>' +
            '</div>';

        taskList.appendChild(li);
    });
}

// Agregar tarea
function agregar() {
    let texto = taskInput.value.trim();

    if (texto === "") {
        alert("Escribe una tarea");
        return;
    }

    tasks.push({
        text: texto,
        completed: false
    });

    taskInput.value = "";
    guardar();
    mostrarTareas();
}

// Marcar tarea como completada
function cambiarEstado(i) {
    tasks[i].completed = !tasks[i].completed;
    guardar();
    mostrarTareas();
}

// Eliminar tarea
function eliminar(i) {
    if (confirm("¿Eliminar tarea?")) {
        tasks.splice(i, 1);
        guardar();
        mostrarTareas();
    }
}

// Editar tarea
function editar(i) {
    let nuevo = prompt("Editar tarea:", tasks[i].text);

    if (nuevo && nuevo.trim() !== "") {
        tasks[i].text = nuevo.trim();
        guardar();
        mostrarTareas();
    }
}

// Eventos
addBtn.onclick = agregar;

taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        agregar();
    }
});

// Mostrar tareas al iniciar
mostrarTareas();