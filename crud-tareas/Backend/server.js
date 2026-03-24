// Importar librerías necesarias
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./database");

const path = require('path');

// Crear la aplicación 
const app = express();
const SECRET = "secreto_super_seguro";

// Usar configuraciones básicas
app.use(cors());
app.use(express.json());

// Crear tablas si no existen
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      email TEXT UNIQUE,
      password TEXT
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS tareas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      descripcion TEXT,
      usuario_id INTEGER
    )`
  );
});

// Función para verificar el token
function autenticarToken(req, res, next) {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No hay token" });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }

    req.user = user;
    next();
  });
}

// Registrar usuario
app.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)`,
    [nombre, email, hash],
    function (err) {
      if (err) {
        res.status(400).json({ error: "Usuario ya existe" });
      } else {
        res.json({ message: "Usuario registrado correctamente" });
      }
    }
  );
});

// Iniciar sesión
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    `SELECT * FROM usuarios WHERE email = ?`,
    [email],
    async (err, user) => {
      if (!user) {
        return res.status(400).json({ error: "Usuario no encontrado" });
      }

      const valida = await bcrypt.compare(password, user.password);

      if (!valida) {
        return res.status(400).json({ error: "Contraseña incorrecta" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        SECRET,
        { expiresIn: "1h" }
      );

      res.json({ message: "Login exitoso", token });
    }
  );
});

console.log(process.cwd())
app.use(express.static(path.join(process.cwd(),'crud-tareas/Frontend')))

// Mostrar login primero
app.get("/", (req, res) => {
  res.sendFile(
    path.join(process.cwd(), "crud-tareas/Frontend/login.html")
  );
});

// Ver tareas
app.get("/tareas", autenticarToken, (req, res) => {
  db.all(
    `SELECT * FROM tareas WHERE usuario_id = ?`,
    [req.user.id],
    (err, filas) => {
      if (err) {
        res.status(500).json({ error: "Error al obtener tareas" });
      } else {
        res.json(filas);
      }
    }
  );
});

// Crear tarea
app.post("/tareas", autenticarToken, (req, res) => {
  const { titulo, descripcion } = req.body;

  db.run(
    `INSERT INTO tareas (titulo, descripcion, usuario_id) VALUES (?, ?, ?)`,
    [titulo, descripcion, req.user.id],
    function (err) {
      if (err) {
        res.status(500).json({ error: "Error al crear tarea" });
      } else {
        res.json({
          message: "Tarea creada correctamente",
          id: this.lastID
        });
      }
    }
  );
});

// Eliminar tarea
app.delete("/tareas/:id", autenticarToken, (req, res) => {
  const id = req.params.id;

  db.run(
    `DELETE FROM tareas WHERE id = ? AND usuario_id = ?`,
    [id, req.user.id],
    function (err) {
      if (this.changes === 0) {
        res.status(404).json({ error: "Tarea no encontrada" });
      } else {
        res.json({ message: "Tarea eliminada" });
      }
    }
  );
});

// Actualizar tarea
app.put("/tareas/:id", autenticarToken, (req, res) => {
  const id = req.params.id;
  const { titulo, descripcion } = req.body;

  db.run(
    `UPDATE tareas 
     SET titulo = ?, descripcion = ?
     WHERE id = ? AND usuario_id = ?`,
    [titulo, descripcion, id, req.user.id],
    function (err) {
      if (this.changes === 0) {
        res.status(404).json({ error: "Tarea no encontrada" });
      } else {
        res.json({ message: "Tarea actualizada" });
      }
    }
  );
});

// Mostrar LOGIN primero
app.get("/", (req, res) => {
  res.sendFile(
    path.join(process.cwd(), "crud-tareas/Frontend/login.html")
  );
});
// Iniciar servidor
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});