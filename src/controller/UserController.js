import pool from "../config/db.js";
import session from "express-session"; // Asegúrate de tener esta dependencia instalada

export const perfil = (req, res) => {
  res.render("perfil");
};

export const documentosUser = async (req, res) => {
  if (!req.session.usuario) {
    req.session.error = "Necesita iniciar sesión para accederñ.";
    return res.redirect("/login"); // Redirigir a login si no hay sesión
  }

  const idUsuario = req.session.usuario.id; // Tomar el ID desde la sesión

  try {
    // Validar que el ID no esté vacío
    if (!idUsuario) {
      throw new Error("El ID de usuario es obligatorio.");
    }

    // Verificar si el usuario existe
    const [existingUser] = await pool.query(
      "SELECT * FROM usuarios WHERE id = ?",
      [idUsuario]
    );

    if (existingUser.length === 0) {
      throw new Error("El usuario no existe.");
    }

    // Obtener los documentos del usuario
    const [documents] = await pool.query(
      "SELECT * FROM documentos WHERE usuario_id = ?",
      [idUsuario]
    );

    console.log("Los documentos son:", documents);

    // Renderizar la página con los documentos obtenidos
    return res.render("documents", { usuario: req.session.usuario, documents });
  } catch (error) {
    console.error("Error al obtener documentos:", error.message);
    req.session.error = error.message; // Guardar el error en la sesión
    return res.redirect("/registro"); // Redirigir a una página de error
  }
};

export const crearDocumento = (req, res) => {
  res.render("newDocument");
};

export const usuarios = async (req, res) => {
  if (!req.session.usuario) {
    req.session.error = "Necesita iniciar sesión para acceder.";
    return res.redirect("/login"); // Redirigir a login si no hay sesión
  }

  try {
    if (req.session.usuario.nombre !== "Admin") {
      throw new Error("El usuario debe ser admin.");
    }

    // Obtener usuarios
    const [users] = await pool.query("SELECT * FROM usuarios WHERE  nombre != 'Admin'");

    console.log("Usuarios Extraídos:", users);

    return res.render("listadousuarios", { users });


  } catch (error) {
    console.error("Error:", error.message);
    req.session.error = error.message;
    return res.redirect("/login");
  }
};

export const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password, password2 } = req.body;

    // Validar que los campos no estén vacíos
    if (!nombre || !apellido || !email || !password || !password2) {
      throw new Error("Todos los campos son obligatorios.");
    }

    // Verificar si las contraseñas coinciden
    if (password !== password2) {
      throw new Error("Las contraseñas no coinciden.");
    }

    // Verificar si el correo ya está registrado
    const [existingUser] = await pool.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [email]
    );
    if (existingUser.length > 0) {
      throw new Error("El correo ya está registrado.");
    }

    // Insertar el usuario en la base de datos
    const [result] = await pool.query(
      "INSERT INTO `usuarios`(`nombre`, `apellido`, `correo`, `contrasena`) VALUES (?, ?, ?, ?)",
      [nombre, apellido, email, password]
    );

    // Obtener el ID del usuario recién creado
    const userId = result.insertId;

    // Guardar el usuario en la sesión
    req.session.usuario = {
      id: userId,
      nombre,
      apellido,
      email,
    };

    console.log("Usuario creado y guardado en sesión:", req.session.usuario);

    // Redirigir a la página de inicio
    return res.redirect("/documentos");
  } catch (error) {
    console.error("Error al crear usuario:", error.message);
    req.session.error = error.message; // Obtiene el mensaje de error de la sesión
    return res.redirect("/registro"); // Redirigir a la página de registro
  }
};

export const validarUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que los campos no estén vacíos
    if (!email || !password) {
      throw new Error("El correo y la contraseña son obligatorios.");
    }

    // Buscar el usuario en la base de datos
    const [user] = await pool.query("SELECT * FROM usuarios WHERE correo = ?", [
      email,
    ]);

    // Verificar si el usuario existe
    if (user.length === 0) {
      throw new Error("El correo no está registrado.");
    }

    const usuario = user[0]; // Obtener el usuario encontrado

    // Verificar si la contraseña es correcta
    if (usuario.contrasena !== password) {
      throw new Error("Contraseña incorrecta.");
    }

    // Guardar sesión del usuario
    req.session.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.correo,
    };

    console.log("Usuario autenticado:", req.session.usuario);

    if (usuario.nombre == "Admin") {
      return res.redirect("/usuarios");
    } else {
      return res.redirect("/documentos");
    }
  } catch (error) {
    console.error("Error en login:", error.message);
    req.session.error = error.message; // Guardar el error en la sesión
    return res.redirect("/login"); // Redirigir al login si hay error
  }
};

export const eliminarUsuario = async (req, res) => {
  const userId = req.session.usuario?.id; // Obtener el ID del usuario desde la sesión

  if (!userId) {
    req.session.error = "Necesita iniciar sesión para acceder.";
    return res.redirect("/login");
  }

  try {
    // 1️⃣ Obtener todos los documentos del usuario
    const [documentos] = await pool.query(
      "SELECT * FROM documentos WHERE usuario_id = ?",
      [userId]
    );



    // 2️⃣ Eliminar los archivos locales
    documentos.forEach((doc) => {
      const filePathLocal = path.join(__dirname, "../documents", doc.nombre);
      if (fs.existsSync(filePathLocal)) {
        fs.unlinkSync(filePathLocal);
        console.log(`Archivo ${doc.nombre} eliminado de la carpeta.`);
      } else {
        console.log(`Archivo ${doc.nombre} no encontrado.`);
      }
    });

    // 3️⃣ Eliminar los documentos de la base de datos
    await pool.query("DELETE FROM documentos WHERE usuario_id = ?", [userId]);

    // 4️⃣ Eliminar al usuario de la base de datos
    await pool.query("DELETE FROM usuarios WHERE id = ?", [userId]);

    console.log("Usuario y documentos eliminados correctamente.");
    
     // Cerrar sesión después de eliminar la cuenta
    return res.redirect("/usuarios"); // Redirigir al login después de eliminar la cuenta
  } catch (error) {
    console.error("Error al eliminar usuario y documentos:", error.message);
    req.session.error = error.message;
    return res.redirect("/usuarios");
  }
};


export const usuarioPorId = (req, res) => {};
