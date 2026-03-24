// Verificar si hay token
if (!localStorage.getItem("token")) {

  if (window.location.pathname.includes("index.html")) {
    window.location.href = "/login.html";
  }

}

// Obtener el token guardado
const token = localStorage.getItem("token");

// ----------- LOGIN -----------

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Obtener datos del formulario
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Enviar datos al servidor
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await res.json();

    // Verificar si el login fue correcto
    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Login exitoso");
      window.location.href = "index.html";
    } else {
      alert(data.error);
    }
  });
}

// ----------- CARGAR TAREAS -----------

async function cargarTareas() {
  const res = await fetch("http://localhost:3000/tareas", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const tareas = await res.json();
  const lista = document.getElementById("listaTareas");

  lista.innerHTML = "";

  // Mostrar tareas en la lista
  tareas.forEach(function (t) {
    const li = document.createElement("li");
    li.textContent = t.titulo + " - " + t.descripcion;
    lista.appendChild(li);
  });
}

// ----------- CREAR TAREA -----------

const taskForm = document.getElementById("taskForm");

if (taskForm) {
  taskForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;

    await fetch("http://localhost:3000/tareas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        titulo: titulo,
        descripcion: descripcion
      })
    });

    // Recargar tareas y limpiar formulario
    cargarTareas();
    taskForm.reset();
  });
}

// Si existe el token, cargar tareas
if (token) {
  cargarTareas();
}