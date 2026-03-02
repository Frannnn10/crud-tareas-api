const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./tareas.db", (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos", err);
  } else {
    console.log("Base de datos conectada correctamente ");
  }
});

module.exports = db;