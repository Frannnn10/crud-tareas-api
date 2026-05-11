const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tareas.db');

db.serialize(() => {
    // Tabla de tareas (la que ya tenías)
    db.run(`CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion TEXT,
        completada INTEGER
    )`);

    // NUEVA: Tabla de usuarios para el Login
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        correo TEXT UNIQUE,
        password TEXT
    )`);
});

module.exports = db;