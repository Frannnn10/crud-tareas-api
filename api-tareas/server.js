const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./database");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tareas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      descripcion TEXT,
      usuario_id INTEGER,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )
  `);

  console.log("Tablas creadas o verificadas correctamente ");
});

function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado, no hay token" });
  }

  jwt.verify(token, "secreto_super_seguro", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }

    req.user = user;
    next();
  });
}

app.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)`,
      [nombre, email, hashedPassword],
      function (err) {
        if (err) {
          return res.status(400).json({ error: "El usuario ya existe o hubo un error" });
        }

        res.json({ message: "Usuario registrado correctamente ✅" });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Error al cifrar la contraseña" });
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    `SELECT * FROM usuarios WHERE email = ?`,
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Error del servidor" });
      }

      if (!user) {
        return res.status(400).json({ error: "Usuario no encontrado" });
      }

      const passwordValida = await bcrypt.compare(password, user.password);

      if (!passwordValida) {
        return res.status(400).json({ error: "Contraseña incorrecta" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        "secreto_super_seguro",
        { expiresIn: "1h" }
      );

      res.json({ message: "Login exitoso ✅", token });
    }
  );
});

app.get("/tareas", autenticarToken, (req, res) => {
  db.all(
    `SELECT * FROM tareas WHERE usuario_id = ?`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Error al obtener tareas" });
      }

      res.json(rows);
    }
  );
});

app.post("/tareas", autenticarToken, (req, res) => {
  const { titulo, descripcion } = req.body;

  db.run(
    `INSERT INTO tareas (titulo, descripcion, usuario_id) VALUES (?, ?, ?)`,
    [titulo, descripcion, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Error al crear la tarea" });
      }

      res.json({
        message: "Tarea creada correctamente ✅",
        tarea: {
          id: this.lastID,
          titulo,
          descripcion
        }
      });
    }
  );
});

app.delete("/tareas/:id", autenticarToken, (req, res) => {
  const { id } = req.params;

  db.run(
    `DELETE FROM tareas WHERE id = ? AND usuario_id = ?`,
    [id, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Error al eliminar tarea" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Tarea no encontrada" });
      }

      res.json({ message: "Tarea eliminada correctamente ✅" });
    }
  );
});

app.put("/tareas/:id", autenticarToken, (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion } = req.body;

  db.run(
    `UPDATE tareas 
     SET titulo = ?, descripcion = ?
     WHERE id = ? AND usuario_id = ?`,
    [titulo, descripcion, id, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Error al actualizar tarea" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Tarea no encontrada" });
      }

      res.json({ message: "Tarea actualizada correctamente ✅" });
    }
  );
});

app.get("/", (req, res) => {
  res.send("API funcionando correctamente 🚀");
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});