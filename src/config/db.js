import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",  // Cambia esto según tu configuración
  user: "root",       // Usuario de MySQL
  password: "",       // Contraseña de MySQL
  database: "userdocument", // Nombre de la base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


const testConnection = async () => {
  try {
    const [rows, fields] = await pool.query('SELECT 1');
    console.log('Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  }
};

testConnection();

/* host: "194.195.84.154",  // Cambia esto según tu configuración
  user: "u618100137_rosasebas",       // Usuario de MySQL
  password: "Rosa.sebas22",       // Contraseña de MySQL
  database: "u618100137_userdocument",  */

export default pool;
