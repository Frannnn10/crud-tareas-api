let tasks = [];

const taskInput =
    document.getElementById("taskInput");

const addBtn =
    document.getElementById("addBtn");

const taskList =
    document.getElementById("taskList");


// Mostrar tareas
async function mostrarTareas() {

    try {

        const respuesta =
            await fetch('/tareas', {
                credentials: 'include'
            });

        // Si no está autenticado
        if (
            respuesta.status === 401 ||
            respuesta.status === 403
        ) {

            // Solo redirige sin alert
            window.location.href = "/";

            return;
        }

        tasks =
            await respuesta.json();

        renderizarPantalla();

    } catch (error) {

        console.error(
            "Error:", error
        );

    }

}


// Renderizar tareas
function renderizarPantalla() {

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        taskList.innerHTML = `
        <div class="empty-state">
            No hay tareas. ¡Agrega una!
        </div>
        `;

        return;
    }

    tasks.forEach((tarea) => {

        const li =
            document.createElement("li");

        li.className =
            tarea.completada
                ? "task-item completed"
                : "task-item";

        li.innerHTML = `
            <div class="task-content">

                <input
                    type="checkbox"
                    ${tarea.completada ? "checked" : ""}
                    onchange="cambiarEstado(
                        ${tarea.id},
                        ${tarea.completada}
                    )"
                >

                <span class="task-text">
                    ${tarea.titulo}
                </span>

            </div>

            <div class="task-actions">

                <button onclick="
                    editar(
                        ${tarea.id},
                        '${tarea.titulo}'
                    )
                ">
                    Editar
                </button>

                <button onclick="
                    eliminar(${tarea.id})
                ">
                    Eliminar
                </button>

            </div>
        `;

        taskList.appendChild(li);

    });

}


// Agregar tarea
async function agregar() {

    const texto =
        taskInput.value.trim();

    if (!texto) {
        alert("Escribe una tarea");
        return;
    }

    try {

        await fetch('/tareas', {

            method: 'POST',

            credentials: 'include',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body: JSON.stringify({
                titulo: texto,
                descripcion: ""
            })

        });

        taskInput.value = "";

        mostrarTareas();

    } catch (error) {

        console.error(error);

    }

}


// Eliminar tarea
async function eliminar(id) {

    if (!confirm(
        "¿Eliminar tarea?"
    )) return;

    try {

        await fetch(
            `/tareas/${id}`,
            {
                method: 'DELETE',
                credentials: 'include'
            }
        );

        mostrarTareas();

    } catch (error) {

        console.error(error);

    }

}


// Cambiar estado
async function cambiarEstado(
    id,
    estadoActual
) {

    try {

        await fetch(
            `/tareas/${id}`,
            {

                method: 'PUT',

                credentials: 'include',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    completada:
                        !estadoActual
                })

            }
        );

        mostrarTareas();

    } catch (error) {

        console.error(error);

    }

}


// Editar tarea
async function editar(
    id,
    textoActual
) {

    const nuevo =
        prompt(
            "Editar tarea:",
            textoActual
        );

    if (
        !nuevo ||
        nuevo.trim() === ""
    ) return;

    try {

        await fetch(
            `/tareas/${id}`,
            {

                method: 'PUT',

                credentials: 'include',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    titulo:
                        nuevo.trim()
                })

            }
        );

        mostrarTareas();

    } catch (error) {

        console.error(error);

    }

}


// Eventos
if (addBtn && taskInput) {

    addBtn.onclick = agregar;

    taskInput.addEventListener(
        "keypress",
        (e) => {

            if (e.key === "Enter") {

                agregar();

            }

        }
    );

    mostrarTareas();

}