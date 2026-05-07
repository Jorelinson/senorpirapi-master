require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

// =========================
// CONFIGURACIÓN
// =========================
app.use(express.json());
app.use(cors());

console.log("MONGO_URI:", process.env.MONGO_URI);

// =========================
// CONEXIÓN A MONGODB
// =========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB conectado correctamente");
  })
  .catch((error) => {
    console.log("Error conectando MongoDB:");
    console.log(error);
  });

// =========================
// MODELO DE USUARIO
// =========================
const Usuario = mongoose.model(
  "Usuario",
  new mongoose.Schema({
    nombre: {
      type: String,
      required: true
    },
    correo: {
      type: String,
      required: true,
      unique: true
    },
    contrasena: {
      type: String,
      required: true
    }
  }),
  "usuarios"
);

// =========================
// MODELO DE MOVIMIENTO
// =========================
const Movimiento = mongoose.model(
  "Movimiento",
  new mongoose.Schema({
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },
    sensor: {
      type: String,
      default: "PIR"
    },
    movimiento: {
      type: Boolean,
      default: true
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  }),
  "movimientos"
);

// =========================
// RUTA PRINCIPAL
// =========================
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// =========================
// REGISTRO DE USUARIO
// =========================
app.post("/api/register", async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios"
      });
    }

    const usuarioExistente = await Usuario.findOne({ correo });

    if (usuarioExistente) {
      return res.status(400).json({
        mensaje: "Ese correo ya está registrado"
      });
    }

    const passwordEncriptada = await bcrypt.hash(contrasena, 10);

const nuevoUsuario = new Usuario({
  nombre,
  correo,
  contrasena: passwordEncriptada
});

    await nuevoUsuario.save();

    console.log("Usuario guardado correctamente");

    res.status(200).json({
      mensaje: "Usuario registrado correctamente"
    });

  } catch (error) {
    console.log("Error registrando usuario:", error);

    res.status(500).json({
      mensaje: "Error al registrar usuario"
    });
  }
});

// =========================
// LOGIN
// =========================
app.post("/api/login", async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.status(400).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      contrasena,
      usuario.contrasena
    );

    if (!passwordCorrecta) {
      return res.status(400).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    res.status(200).json({
      mensaje: "Login correcto",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });

  } catch (error) {
    console.log("Error en login:", error);

    res.status(500).json({
      mensaje: "Error en el login"
    });
  }
});

// =========================
// GUARDAR MOVIMIENTO DEL SENSOR
// =========================
app.post("/movimiento", async (req, res) => {
  try {
    console.log("Movimiento recibido:", req.body);

    const { usuarioId, sensor, movimiento } = req.body;

    if (!usuarioId) {
      return res.status(400).json({
        mensaje: "Falta usuarioId"
      });
    }

    const nuevoMovimiento = new Movimiento({
      usuarioId,
      sensor: sensor || "PIR",
      movimiento: movimiento ?? true,
      fecha: new Date()
    });

    await nuevoMovimiento.save();

    console.log("Movimiento guardado correctamente");

    res.status(200).json({
      mensaje: "Movimiento guardado correctamente"
    });

  } catch (error) {
    console.log("Error guardando movimiento:", error);

    res.status(500).json({
      mensaje: "Error guardando movimiento"
    });
  }
});

// =========================
// OBTENER ÚLTIMOS MOVIMIENTOS
// =========================
app.get("/movimientos/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const limite = Number(req.query.limite) || 20;

    const movimientos = await Movimiento.find({ usuarioId })
      .sort({ fecha: -1 })
      .limit(limite)
      .lean();

    res.status(200).json(movimientos);

  } catch (error) {
    console.log("Error obteniendo movimientos:", error);

    res.status(500).json({
      mensaje: "Error obteniendo movimientos"
    });
  }
});

// =========================
// GRAFICA DIA
// =========================
app.get("/movimientos/dia", async (req, res) => {
  try {
    const horas = Array(24).fill(0);

    // Fecha actual en Colombia
    const ahora = new Date();

    const hoyColombia = new Date(
      ahora.toLocaleString("en-US", {
        timeZone: "America/Bogota"
      })
    );

    // Inicio del día en Colombia
    const inicioDia = new Date(hoyColombia);
    inicioDia.setHours(0, 0, 0, 0);

    // Fin del día en Colombia
    const finDia = new Date(hoyColombia);
    finDia.setHours(23, 59, 59, 999);

    const movimientos = await Movimiento.find();

    movimientos.forEach((mov) => {
      // Convertir la fecha guardada a hora Colombia
      const fechaColombia = new Date(
        new Date(mov.fecha).toLocaleString("en-US", {
          timeZone: "America/Bogota"
        })
      );

      // Solo tomar movimientos del día actual
      if (fechaColombia >= inicioDia && fechaColombia <= finDia) {
        const hora = fechaColombia.getHours();
        horas[hora]++;
      }
    });

    res.json(horas);

  } catch (error) {
    console.error("Error en /movimientos/dia:", error);
    res.status(500).json({
      mensaje: "Error obteniendo gráfica del día"
    });
  }
});


// =========================
// GRAFICA MES
// =========================
app.get("/movimientos/mes", async (req, res) => {
  try {
    // Obtener fecha actual en Colombia
    const hoy = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "America/Bogota"
      })
    );

    const anio = hoy.getFullYear();
    const mesActual = hoy.getMonth();

    // Cantidad real de días del mes actual
    const totalDias = new Date(anio, mesActual + 1, 0).getDate();

    const dias = Array(totalDias).fill(0);

    const movimientos = await Movimiento.find();

    movimientos.forEach((mov) => {
      const fecha = new Date(
        new Date(mov.fecha).toLocaleString("en-US", {
          timeZone: "America/Bogota"
        })
      );

      // Solo tomar movimientos del mes y año actual
      if (
        fecha.getFullYear() === anio &&
        fecha.getMonth() === mesActual
      ) {
        const dia = fecha.getDate(); // 1 al 31
        dias[dia - 1]++;
      }
    });

    res.json(dias);

  } catch (error) {
    console.error("Error en /movimientos/mes:", error);
    res.status(500).json({
      mensaje: "Error obteniendo gráfica del mes"
    });
  }
});


// =========================
// GRAFICA AÑO
// =========================
app.get("/movimientos/anio", async (req, res) => {
  try {
    const meses = Array(12).fill(0);

    // Fecha actual en Colombia
    const hoy = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "America/Bogota"
      })
    );

    const anioActual = hoy.getFullYear();

    const movimientos = await Movimiento.find();

    movimientos.forEach((mov) => {
      // Convertir cada fecha a hora Colombia
      const fecha = new Date(
        new Date(mov.fecha).toLocaleString("en-US", {
          timeZone: "America/Bogota"
        })
      );

      // Solo contar movimientos del año actual
      if (fecha.getFullYear() === anioActual) {
        const mes = fecha.getMonth(); // 0 = Ene, 1 = Feb...
        meses[mes]++;
      }
    });

    res.json(meses);

  } catch (error) {
    console.error("Error en /movimientos/anio:", error);
    res.status(500).json({
      mensaje: "Error obteniendo gráfica del año"
    });
  }
});

// =========================
// INICIAR SERVIDOR
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});