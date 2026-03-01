const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Login exitoso ✅");
      window.location.href = "index.html";
    } else {
      alert(data.error);
    }
  });
}

const token = localStorage.getItem("token");

async function cargarTareas() {
  const res = await fetch("http://localhost:3000/tareas", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const tareas = await res.json();
  const lista = document.getElementById("listaTareas");
  lista.innerHTML = "";

  tareas.forEach(tarea => {
    const li = document.createElement("li");
    li.textContent = tarea.titulo + " - " + tarea.descripcion;
    lista.appendChild(li);
  });
}

const taskForm = document.getElementById("taskForm");

if (taskForm) {
  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;

    await fetch("http://localhost:3000/tareas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ titulo, descripcion })
    });

    cargarTareas();
    taskForm.reset();
  });
}

if (token) {
  cargarTareas();
}