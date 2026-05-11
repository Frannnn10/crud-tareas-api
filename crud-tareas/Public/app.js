// Seleccionamos el formulario por su ID
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    // Evitamos que la página se recargue (comportamiento por defecto del form)
    e.preventDefault();

    // Obtenemos los valores de los inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const respuesta = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            alert("¡Bienvenido!");
            // Guardamos el token para poder hacer el CRUD después
            localStorage.setItem('token', datos.token);
            
            // Redirigimos a la página principal del CRUD
            window.location.href = 'index.html'; 
        } else {
            // Muestra el error que viene del servidor (ej: "Usuario no encontrado")
            alert("Error: " + datos.error);
        }

    } catch (error) {
        console.error("Error al conectar:", error);
        alert("El servidor no responde. ¿Olvidaste encenderlo con node server.js?");
    }
});