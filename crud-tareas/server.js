// Importar librerías necesarias
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./database"); // Asegúrate que database.js esté en la misma carpeta
const path = require("path");

const app = express();
const SECRET = "secreto_super_seguro";

// Middlewares
app.use(cors());
app.use(express.json());

// IMPORTANTE: En tu foto la carpeta es "Public" con P mayúscula. 
// Usamos path.join para evitar errores de rutas en Windows.
app.use(express.static(path.join(__dirname, "Public")));

// --- VERIFICACIÓN DE TOKEN ---
function autenticarToken(req, res, next) {
    const header = req.headers["authorization"];
    const token = header && header.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "No hay token, acceso denegado" });
    }

    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token inválido o expirado" });
        }
        req.user = user;
        next();
    });
}

// --- RUTAS DE AUTENTICACIÓN ---

// Registro de usuario
app.post("/register", async (req, res) => {
    const { nombre, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Faltan datos" });

    try {
        const hash = await bcrypt.hash(password, 10);
        db.run(
            `INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)`,
            [nombre || 'Usuario', email, hash],
            function (err) {
                if (err) {
                    return res.status(400).json({ error: "El correo ya está registrado" });
                }
                res.json({ message: "Usuario registrado correctamente" });
            }
        );
    } catch (e) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: "Error en DB" });
        if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

        const valida = await bcrypt.compare(password, user.password);
        if (!valida) return res.status(400).json({ error: "Contraseña incorrecta" });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            SECRET,
            { expiresIn: "2h" }
        );

        res.json({ message: "Login exitoso", token });
    });
});

// --- RUTA PRINCIPAL (Carga el login) ---
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Public", "login.html"));
});

// --- RUTAS DEL CRUD (Protegidas) ---

// Obtener tareas del usuario logueado
app.get("/tareas", autenticarToken, (req, res) => {
    db.all(`SELECT * FROM tareas WHERE usuario_id = ?`, [req.user.id], (err, filas) => {
        if (err) return res.status(500).json({ error: "Error al obtener tareas" });
        res.json(filas);
    });
});

// Crear tarea vinculada al usuario
app.post("/tareas", autenticarToken, (req, res) => {
    const { titulo, descripcion } = req.body;
    db.run(
        `INSERT INTO tareas (titulo, descripcion, usuario_id) VALUES (?, ?, ?)`,
        [titulo, descripcion, req.user.id],
        function (err) {
            if (err) return res.status(500).json({ error: "Error al crear tarea" });
            res.json({ id: this.lastID, message: "Tarea guardada" });
        }
    );
});

// Eliminar tarea (solo si pertenece al usuario)
app.delete("/tareas/:id", autenticarToken, (req, res) => {
    db.run(
        `DELETE FROM tareas WHERE id = ? AND usuario_id = ?`,
        [req.params.id, req.user.id],
        function (err) {
            if (this.changes === 0) return res.status(404).json({ error: "No encontrada" });
            res.json({ message: "Tarea eliminada" });
        }
    );
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
    ==============================================
     Servidor corriendo en: http://localhost:${PORT}
     Archivos estáticos desde: /Public
    ==============================================
    `);
});