const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const respuesta = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            alert("Usuario creado con éxito. Ahora puedes iniciar sesión.");
            window.location.href = 'login.html'; // Te manda al login automáticamente
        } else {
            alert("Error: " + datos.error);
        }
    } catch (error) {
        alert("No se pudo conectar con el servidor.");
    }
});