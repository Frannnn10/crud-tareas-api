document.addEventListener('DOMContentLoaded', () => {

    const loginForm =
        document.getElementById('loginForm');

    loginForm.addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            const email =
                document.getElementById('email').value;

            const password =
                document.getElementById('password').value;

            try {

                const respuesta =
                    await fetch('/login', {

                        method: 'POST',

                        credentials: 'include',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body: JSON.stringify({
                            email,
                            password
                        })

                    });

                const datos =
                    await respuesta.json();

                if (respuesta.ok) {

                    alert(
                        "Inicio de sesión exitoso"
                    );

                    // Ir a la ruta principal
                    window.location.href = "/";

                } else {

                    alert(
                        "Error: " + datos.error
                    );

                }

            } catch (error) {

                console.error(
                    "Error:", error
                );

                alert(
                    "No se pudo conectar al servidor"
                );

            }

        }
    );

});