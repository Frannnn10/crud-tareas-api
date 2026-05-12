document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

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
                // --- LA LÍNEA QUE FALTABA ---
                // Guardamos el token en el bolsillo del navegador
                localStorage.setItem('token', datos.token);
                
                alert("Inicio de sesión exitoso");
                
                // Redirigir al CRUD (index.html)
                window.location.href = 'index.html';
            } else {
                // Si el servidor responde con error (ej. contraseña mal)
                alert("Error: " + datos.error);
            }

        } catch (error) {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor. Revisa la terminal.");
        }
    });
});