import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Obtener el nombre y la ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../documents")); // Asegúrate de que la ruta sea correcta
  },
  filename: function (req, file, cb) {
    const userId = req.session.usuario?.id || "guest"; // Asegura un ID de usuario válido
    const ext = path.extname(file.originalname); // Obtener la extensión del archivo
    const baseName = path.basename(file.originalname, ext); // Extraer el nombre del archivo sin la extensión
    const newFilename = `${userId}_${baseName}${ext}`; // Concatenar el ID del usuario con el nombre del archivo
    cb(null, newFilename);
  },
});

// Filtro para aceptar solo PDF, Word y Excel
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false); // Rechaza el archivo sin lanzar un error visible
  }
};

const upload = multer({ storage, fileFilter }).single("archivo");

// 📂 Listar documentos del usuario
export const documentosUser = async (req, res) => {
  if (!req.session.usuario) {
    req.session.error = "Necesita iniciar sesión para acceder.";
    return res.redirect("/login");
  }

  const idUsuario = req.session.usuario.id;

  try {
    // Validar usuario
    const [existingUser] = await pool.query(
      "SELECT * FROM usuarios WHERE id = ?",
      [idUsuario]
    );
    if (existingUser.length === 0) throw new Error("El usuario no existe.");

    // Obtener documentos del usuario
    const [documents] = await pool.query(
      "SELECT * FROM documentos WHERE usuario_id = ?",
      [idUsuario]
    );

    console.log("Documentos encontrados:", documents);

    return res.render("documents", { usuario: req.session.usuario, documents });
  } catch (error) {
    console.error("Error al obtener documentos:", error.message);
    req.session.error = error.message;
    return res.redirect("/documentos");
  }
};

// 📤 Subir un documento

export const subirDocumento = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (!req.session.usuario) {
      req.session.error = "Necesita iniciar sesión para acceder.";
      return res.redirect("/login");
    }

    if (err) {
      return next(err);
    }

    if (!req.file) {
      req.session.error = "El archivo debe de ser pdf, word o excel.";
      return res.redirect("/documentos/crear");
    }

    const userId = req.session.usuario.id;
    const fileName = req.file.filename;
    const fileType = req.file.mimetype;
    const filePath = req.file.path;
    const localFilePath = path.join(__dirname, "documents", fileName);

    try {
      // Verificar si el archivo ya existe en la base de datos
      const [existingFiles] = await pool.query(
        "SELECT * FROM documentos WHERE nombre = ? AND usuario_id = ?",
        [fileName, userId]
      );

      if (existingFiles.length > 0 || fs.existsSync(localFilePath)) {
        fs.unlinkSync(filePath); // Eliminar archivo recién subido
        req.session.error = "El archivo ya existe.";
        return res.redirect("/documentos/crear");
      }

      // Insertar en la base de datos
      await pool.query(
        "INSERT INTO documentos (nombre, ruta_archivo, tipo_archivo, usuario_id) VALUES (?, ?, ?, ?)",
        [fileName, filePath, fileType, userId]
      );

      console.log("Documento guardado correctamente.");
      res.redirect("/documentos");
    } catch (error) {
      console.error("Error al guardar el documento:", error.message);
      req.session.error = error.message;
      res.redirect("/documentos/crear");
    }
  });
};

// 🗑️ Eliminar un documento
export const eliminarDocumento = async (req, res) => {
  const { documentoId } = req.params; // Asumiendo que el ID del documento se pasa como parámetro en la URL
  const userId = req.session.usuario?.id; // Obtener el ID del usuario desde la sesión

  if (!userId) {
    req.session.error = "Necesita iniciar sesión para acceder.";
    return res.redirect("/login");
  }

  try {
    // 1️⃣ Verificar si el documento existe en la base de datos
    const [documento] = await pool.query(
      "SELECT * FROM documentos WHERE id = ? AND usuario_id = ?",
      [documentoId, userId]
    );

    if (documento.length === 0) {
      // ❌ El documento no existe en la base de datos o no pertenece al usuario
      return res
        .status(404)
        .send("Documento no encontrado o no tiene permisos para eliminarlo.");
    }

    const filePath = documento[0].ruta_archivo; // Obtener la ruta del archivo desde la base de datos
    const fileName = documento[0].nombre; // Obtener el nombre del archivo

    // 2️⃣ Verificar si el archivo existe en la carpeta local
    const filePathLocal = path.join(__dirname, "../documents", fileName); // Ruta completa del archivo en la carpeta local
    if (fs.existsSync(filePathLocal)) {
      // El archivo existe en la carpeta, lo eliminamos
      fs.unlinkSync(filePathLocal);
      console.log(`Archivo ${fileName} eliminado de la carpeta.`);
    } else {
      console.log(`Archivo ${fileName} no encontrado en la carpeta.`);
    }

    // 3️⃣ Eliminar el archivo de la base de datos
    await pool.query("DELETE FROM documentos WHERE id = ?", [documentoId]);

    console.log("Documento eliminado de la base de datos.");
    res.redirect("/documentos"); // Redirigir a la lista de documentos después de la eliminación
  } catch (error) {
    console.error("Error al eliminar el documento:", error.message);
    req.session.error = "Necesita iniciar sesión para acceder.";
    res.redirect("/documentos");
  }
};

// 📝 Mostrar formulario para subir documentos
export const crearDocumento = (req, res) => {
  res.render("newDocument");
};
