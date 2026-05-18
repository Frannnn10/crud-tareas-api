const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const db = require("./database");
const path = require("path");

const app = express();
const SECRET = "secreto_super_seguro";

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "Public")));

// --- VERIFICACIÓN DE TOKEN ---
function autenticarToken(req, res, next) {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            error: "No hay token, acceso denegado"
        });
    }

    jwt.verify(token, SECRET, (err, user) => {

        if (err) {
            return res.status(403).json({
                error: "Token inválido o expirado"
            });
        }

        req.user = user;
        next();
    });
}

// ---------------- REGISTRO ----------------

app.post("/register", async (req, res) => {

    const { nombre, email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: "Faltan datos"
        });
    }

    try {

        const hash = await bcrypt.hash(password, 10);

        db.run(
            `INSERT INTO usuarios (nombre, email, password)
             VALUES (?, ?, ?)`,
            [nombre || "Usuario", email, hash],
            function (err) {

                if (err) {
                    return res.status(400).json({
                        error: "El correo ya está registrado"
                    });
                }

                res.json({
                    message: "Usuario registrado correctamente"
                });

            }
        );

    } catch (error) {

        res.status(500).json({
            error: "Error en el servidor"
        });

    }

});

// ---------------- LOGIN ----------------

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    db.get(
        `SELECT * FROM usuarios WHERE email = ?`,
        [email],
        async (err, user) => {

            if (err) {
                return res.status(500).json({
                    error: "Error en DB"
                });
            }

            if (!user) {
                return res.status(400).json({
                    error: "Usuario no encontrado"
                });
            }

            const valida = await bcrypt.compare(
                password,
                user.password
            );

            if (!valida) {
                return res.status(400).json({
                    error: "Contraseña incorrecta"
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email
                },
                SECRET,
                { expiresIn: "2h" }
            );

            // Guardar token en cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                maxAge: 2 * 60 * 60 * 1000
            });

            res.json({
                message: "Login exitoso"
            });

        }
    );
});

// ---------------- LOGOUT ----------------

app.post("/logout", (req, res) => {

    res.clearCookie("token");

    res.json({
        message: "Sesión cerrada"
    });

});

// ---------------- RUTA PRINCIPAL ----------------

app.get("/", (req, res) => {

    const token = req.cookies.token;

    if (!token) {
        return res.sendFile(
            path.join(__dirname, "Public", "login.html")
        );
    }

    jwt.verify(token, SECRET, (err) => {

        if (err) {
            return res.sendFile(
                path.join(__dirname, "Public", "login.html")
            );
        }

        return res.sendFile(
            path.join(__dirname, "Public", "index.html")
        );

    });

});

// ---------------- CRUD ----------------

// Obtener tareas
app.get("/tareas", autenticarToken, (req, res) => {

    db.all(
        `SELECT * FROM tareas WHERE usuario_id = ?`,
        [req.user.id],
        (err, filas) => {

            if (err) {
                return res.status(500).json({
                    error: "Error al obtener tareas"
                });
            }

            res.json(filas);
        }
    );
});

// Crear tarea
app.post("/tareas", autenticarToken, (req, res) => {

    const { titulo, descripcion } = req.body;

    db.run(
        `INSERT INTO tareas
        (titulo, descripcion, usuario_id, completada)
        VALUES (?, ?, ?, 0)`,

        [titulo, descripcion || "", req.user.id],

        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Error al crear tarea"
                });
            }

            res.json({
                id: this.lastID,
                message: "Tarea guardada"
            });

        }
    );
});

// Editar tarea
app.put("/tareas/:id", autenticarToken, (req, res) => {

    const { titulo, completada } = req.body;

    db.run(
        `UPDATE tareas
         SET titulo = COALESCE(?, titulo),
         completada = COALESCE(?, completada)
         WHERE id = ? AND usuario_id = ?`,

        [titulo, completada, req.params.id, req.user.id],

        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Error al actualizar"
                });
            }

            res.json({
                message: "Tarea actualizada"
            });

        }
    );
});

// Eliminar tarea
app.delete("/tareas/:id", autenticarToken, (req, res) => {

    db.run(
        `DELETE FROM tareas
         WHERE id = ? AND usuario_id = ?`,

        [req.params.id, req.user.id],

        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Error al eliminar"
                });
            }

            res.json({
                message: "Tarea eliminada"
            });

        }
    );
});

// Servidor
const PORT = 3000;

app.listen(PORT, () => {

    console.log(`
==============================================
Servidor corriendo:
http://localhost:${PORT}
==============================================
    `);

});