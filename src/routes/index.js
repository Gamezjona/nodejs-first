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

router.post("/usuarios", UserController.crearUsuario);

router.post("/login", UserController.validarUsuario);

router.delete('/documentos/:documentoId', DocumentController.eliminarDocumento);

/* // Rutas de documentos
router.get("/documentos", (req, res) => res.render("documents"));
router.get("/documentos/crear", (req, res) => res.render("crearDocumento")); // Asegurar que esta vista existe
router.post("/documentos", (req, res) => {
  // Lógica para crear un documento
  res.redirect("/documentos");
});
router.delete("/documentos/:id", (req, res) => {
  // Lógica para eliminar un documento
  res.json({ message: "Documento eliminado" });
});
 */
// Rutas de usuarios
router.get("/usuarios", (req, res) => res.render("documents"));
/* router.get("/usuarios", (req, res) => res.render("listaUsuarios")); // Asegurar que esta vista existe
router.get("/usuarios/editar/:id", (req, res) => res.render("editarUsuario")); // Asegurar que esta vista existe
 */

/* router.put("/usuarios/:id", (req, res) => {
  // Lógica para actualizar usuario
  res.json({ message: "Usuario actualizado" });
});
router.delete("/usuarios/:id", (req, res) => {
  // Lógica para eliminar usuario
  res.json({ message: "Usuario eliminado" });
});

// Ruta para mostrar información de un usuario
router.get("/usuarios/:id", (req, res) => {
  res.render("perfilUsuario", { userId: req.params.id }); // Asegurar que esta vista existe
}); */

export default router;
