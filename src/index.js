import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import indexRoute from './routes/index.js';  // Asegúrate de que la ruta es correcta
import session from 'express-session';  // Importa express-session
import methodOverride from 'method-override'; 

const app = express();

// Configura method-override para manejar solicitudes DELETE desde el frontend
app.use(methodOverride('_method'));

// Obtener la ruta absoluta del directorio actual
const __dirname = dirname(fileURLToPath(import.meta.url));

// Configurar el motor de plantillas y la carpeta de vistas
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware para procesar datos de formularios (req.body)
app.use(express.urlencoded({ extended: true }));  // Esto permite procesar datos de formularios URL encoded
app.use(express.json());  // Si envías JSON, esto también será necesario

// Middleware para archivos estáticos (CSS, JS, imágenes)
app.use(express.static(join(__dirname, 'public')));

// Configuración de sesión
app.use(session({
  secret: '123456',  // Cambia esto por una clave secreta segura
  resave: false,
  saveUninitialized: true
}));

// Usar las rutas definidas en indexRoute
app.use(indexRoute);

// Iniciar servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Server is listening on port: 3000');
});
