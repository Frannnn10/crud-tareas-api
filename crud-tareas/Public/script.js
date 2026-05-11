// --- 1. GUARDIA DE SEGURIDAD (TOKEN) ---
const token = localStorage.getItem("token");

if (!token) {
    alert("Acceso denegado. Inicia sesión primero.");
    window.location.href = "login.html";
}

// Función para cerrar sesión (puedes usarla en un botón)
function cerrarSesion() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// --- 2. CONFIGURACIÓN DEL CRUD ---

// Ahora las tareas se cargarán desde el servidor, no solo del localStorage
let tasks = [];

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

// --- 3. FUNCIONES CONECTADAS AL BACKEND ---

// Cargar tareas desde la Base de Datos
async function mostrarTareas() {
    try {
        const respuesta = await fetch('/tareas', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (respuesta.ok) {
            tasks = await respuesta.json();
            renderizarPantalla();
        } else {
            console.error("Error al obtener tareas");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// Renderizar en el HTML (la lógica visual que ya tenías)
function renderizarPantalla() {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state">No hay tareas. ¡Agrega una!</div>';
        return;
    }

    tasks.forEach(function (tarea, i) {
        let li = document.createElement("li");
        li.className = tarea.completada ? "task-item completed" : "task-item";

        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" ${tarea.completada ? "checked" : ""} 
                    onchange="cambiarEstado(${tarea.id}, ${tarea.completada})">
                <span class="task-text">${tarea.titulo || tarea.text || "Sin título"}</span>
            </div>
            <div class="task-actions">
                <button onclick="editar(${tarea.id}, '${tarea.titulo}')">Editar</button>
                <button onclick="eliminar(${tarea.id})">Eliminar</button>
            </div>`;
        taskList.appendChild(li);
    });
}

// Agregar tarea a la Base de Datos
async function agregar() {
    let texto = taskInput.value.trim();
    if (texto === "") return alert("Escribe una tarea");

    try {
        const respuesta = await fetch('/tareas', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ titulo: texto, descripcion: "" })
        });

        if (respuesta.ok) {
            taskInput.value = "";
            mostrarTareas(); // Recargamos desde la DB
        }
    } catch (error) {
        alert("Error al guardar la tarea");
    }
}

// Eliminar tarea de la Base de Datos
async function eliminar(id) {
    if (confirm("¿Eliminar tarea?")) {
        try {
            const respuesta = await fetch(`/tareas/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (respuesta.ok) mostrarTareas();
        } catch (error) {
            alert("Error al eliminar");
        }
    }
}

// Cambiar estado (esta parte requiere que tu server.js tenga la ruta PUT)
async function cambiarEstado(id, estadoActual) {
    try {
        await fetch(`/tareas/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ completada: !estadoActual })
        });
        mostrarTareas();
    } catch (error) {
        console.error("Error al actualizar");
    }
}

// Editar tarea
async function editar(id, textoActual) {
    let nuevo = prompt("Editar tarea:", textoActual);
    if (nuevo && nuevo.trim() !== "") {
        try {
            await fetch(`/tareas/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ titulo: nuevo.trim() })
            });
            mostrarTareas();
        } catch (error) {
            alert("Error al editar");
        }
    }
}

// --- 4. EVENTOS ---
addBtn.onclick = agregar;
taskInput.addEventListener("keypress", (e) => { if (e.key === "Enter") agregar(); });

// Cargar todo al iniciar
mostrarTareas();