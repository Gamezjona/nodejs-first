import { Router } from "express";
import * as UserController from "../controller/UserController.js";
import * as DocumentController from "../controller/DocumentControll.js";

const router = Router();

// Página principal
router.get("/", (req, res) => {
  res.render("index");
});

router.get("/login", (req, res) => {
  const errorMessage = req.session.error; // Obtiene el mensaje de error de la sesión
  req.session.error = null;
  res.render("login", { errorMessage: errorMessage });
});

router.get("/registro", (req, res) => {
  const errorMessage = req.session.error; // Obtiene el mensaje de error de la sesión
  req.session.error = null;
  res.render("registro", { errorMessage: errorMessage });
});

router.get("/cerrarSesion", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar la sesión:", err);
      return res.status(500).send("Error al cerrar sesión.");
    }
    res.redirect("/"); // Redirige al login tras cerrar la sesión
  });
});

router.get("/perfil", (req, res) => {
  if (!req.session.usuario) {
    req.session.error = "Necesita iniciar sesión para acceder.";
    return res.redirect("/login"); // Redirigir a login si no hay sesión
  }

  const errorMessage = req.session.error; // Obtiene el mensaje de error de la sesión
  req.session.error = null;

  res.render("perfil", { errorMessage: errorMessage });
});

router.get("/documentos", UserController.documentosUser);

router.get("/documentos/crear", (req, res) => {
  if (!req.session.usuario) {
    req.session.error = "Necesita iniciar sesión para acceder.";
    return res.redirect("/login"); // Redirigir a login si no hay sesión
  }

  const errorMessage = req.session.error; // Obtiene el mensaje de error de la sesión
  req.session.error = null;

  res.render("newDocument", { errorMessage: errorMessage });
});

router.post("/documentos",DocumentController.subirDocumento);

//Listado de Usuarios
router.get("/usuarios", UserController.usuarios);

// CREAR EL USUARIO
router.post("/usuarios", UserController.crearUsuario);

//Valida el usuario
router.post("/login", UserController.validarUsuario);

router.delete('/documentos/:documentoId', DocumentController.eliminarDocumento);

router.delete('/usuarios/:userId', UserController.eliminarUsuario);


export default router;
