// --- 1. GUARDIA DE SEGURIDAD (TOKEN) ---
const token = localStorage.getItem("token");

if (!token) {
    // Si no hay token, no preguntamos nada, directo al login
    window.location.href = "login.html";
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// --- 2. CONFIGURACIÓN DEL CRUD ---
let tasks = [];
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

// --- 3. FUNCIONES CONECTADAS AL BACKEND ---

async function mostrarTareas() {
    try {
        const respuesta = await fetch('/tareas', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (respuesta.status === 401 || respuesta.status === 403) {
            // Si el token es inválido o expiró, limpiamos y redirigimos
            localStorage.removeItem("token");
            alert("Tu sesión ha expirado. Inicia sesión de nuevo.");
            window.location.href = "login.html";
            return;
        }

        if (respuesta.ok) {
            tasks = await respuesta.json();
            renderizarPantalla();
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

function renderizarPantalla() {
    taskList.innerHTML = "";
    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state">No hay tareas. ¡Agrega una!</div>';
        return;
    }

    tasks.forEach(function (tarea) {
        let li = document.createElement("li");
        li.className = tarea.completada ? "task-item completed" : "task-item";

        // Usamos tarea.completada (que viene de la DB como 0 o 1)
        const isChecked = tarea.completada === 1 || tarea.completada === true;

        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" ${isChecked ? "checked" : ""} 
                    onchange="cambiarEstado(${tarea.id}, ${tarea.completada})">
                <span class="task-text">${tarea.titulo || "Sin título"}</span>
            </div>
            <div class="task-actions">
                <button onclick="editar(${tarea.id}, '${tarea.titulo}')">Editar</button>
                <button onclick="eliminar(${tarea.id})">Eliminar</button>
            </div>`;
        taskList.appendChild(li);
    });
}

// Agregar tarea
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
            mostrarTareas();
        }
    } catch (error) {
        alert("Error al guardar la tarea");
    }
}

// Eliminar tarea
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

// Cambiar estado
async function cambiarEstado(id, estadoActual) {
    // Convertimos a 1 o 0 para la base de datos
    const nuevoEstado = estadoActual ? 0 : 1; 
    try {
        await fetch(`/tareas/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ completada: nuevoEstado })
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
if (addBtn) {
    addBtn.onclick = agregar;
}
taskInput.addEventListener("keypress", (e) => { if (e.key === "Enter") agregar(); });

// Cargar todo al iniciar
mostrarTareas();