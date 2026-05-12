const sqlite3 = require('sqlite3').verbose();
// Aquí es donde se crea la variable db. ¡No la borres!
const db = new sqlite3.Database('./tareas.db');

db.serialize(() => {
    // 1. Crear tabla de usuarios con las columnas correctas
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    // 2. Crear tabla de tareas vinculada al usuario_id
    db.run(`CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        descripcion TEXT,
        completada INTEGER DEFAULT 0,
        usuario_id INTEGER,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )`);
});

module.exports = db;