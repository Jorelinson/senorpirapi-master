// =========================
// dashboard.js COMPLETO CORREGIDO
// =========================

let grafica = null;
let vistaActual = "dia";

// =========================
// CARGAR HISTORIAL
// =========================
async function cargarHistorial() {
  const tabla = document.getElementById("tablaMovimientos");

  try {
    const movimientos = await obtenerMovimientos(5000);

    if (!movimientos || movimientos.length === 0) {
      tabla.innerHTML = `
        <tr>
          <td colspan="4">No hay movimientos registrados</td>
        </tr>
      `;

      document.getElementById("estado").textContent = "Sin movimiento";
      document.getElementById("hora").textContent = "--:--:--";
      document.getElementById("movimientosHoy").textContent = "0";
      return;
    }

    // Limpiar tabla
    tabla.innerHTML = "";

    // Hora actual en Colombia
    const ahoraColombia = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "America/Bogota"
      })
    );

    let contadorHoy = 0;

    movimientos.forEach((mov) => {
      const fechaColombia = new Date(
        new Date(mov.fecha).toLocaleString("en-US", {
          timeZone: "America/Bogota"
        })
      );

      // Contar movimientos del día actual
      if (
        fechaColombia.getDate() === ahoraColombia.getDate() &&
        fechaColombia.getMonth() === ahoraColombia.getMonth() &&
        fechaColombia.getFullYear() === ahoraColombia.getFullYear()
      ) {
        contadorHoy++;
      }

      const fechaTexto =
        fechaColombia.toLocaleDateString("es-CO") + " " +
        fechaColombia.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        });

      tabla.innerHTML += `
        <tr>
          <td>${fechaTexto}</td>
          <td>${mov.movimiento ? "Movimiento detectado" : "Sin movimiento"}</td>
          <td>${mov.datos?.sensor || "PIR"}</td>
          <td>Registrado</td>
        </tr>
      `;
    });

    const ultimo = movimientos[0];

    const ultimaFechaColombia = new Date(
      new Date(ultimo.fecha).toLocaleString("en-US", {
        timeZone: "America/Bogota"
      })
    );

    // Estado del sensor:
    // si el último movimiento fue hace menos de 10 segundos => activo
    const diferenciaSegundos =
      (ahoraColombia - ultimaFechaColombia) / 1000;

    document.getElementById("estado").textContent =
      diferenciaSegundos <= 60
        ? "Activo"
        : "Desactivado";

    // Última detección en formato militar
    document.getElementById("hora").textContent =
      ultimaFechaColombia.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });

    // Movimientos del día
    document.getElementById("movimientosHoy").textContent = contadorHoy;

  } catch (error) {
    console.error("Error cargando historial:", error);
  }
}

// =========================
// CARGAR GRAFICA
// =========================
async function cargarGrafica() {
  let datos = [];
  let etiquetas = [];

  try {
    if (vistaActual === "dia") {
      datos = await obtenerGraficaDia();

      etiquetas = [
        "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
        "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
        "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
        "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
      ];
    }

    if (vistaActual === "mes") {
      datos = await obtenerGraficaMes();
      etiquetas = Array.from({ length: 30 }, (_, i) => `Día ${i + 1}`);
    }

    if (vistaActual === "anio") {
      datos = await obtenerGraficaAnio();

      etiquetas = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
      ];
    }

    const canvas = document.getElementById("graficaMovimientos");
    const ctx = canvas.getContext("2d");

    if (grafica) {
      grafica.destroy();
    }

    grafica = new Chart(ctx, {
      type: "line",
      data: {
        labels: etiquetas,
        datasets: [{
          label: "Movimientos detectados",
          data: datos,
          borderColor: "#0b5cc7",
          backgroundColor: "rgba(11,92,199,0.15)",
          fill: true,
          borderWidth: 4,
          pointRadius: 5,
          tension: 0.35
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

  } catch (error) {
    console.error("Error cargando gráfica:", error);
  }
}

// =========================
// CAMBIAR VISTA
// =========================
function cambiarVista(vista) {
  vistaActual = vista;

  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.classList.remove("tab-active");
  });

  document.getElementById(`tab-${vista}`).classList.add("tab-active");

  cargarGrafica();
}

// =========================
// ACTUALIZAR DATOS
// =========================
function actualizarDatos() {
  cargarHistorial();
  cargarGrafica();
}

// =========================
// INICIO
// =========================
document.addEventListener("DOMContentLoaded", () => {
  actualizarDatos();

  // Actualizar automáticamente cada 5 segundos
  setInterval(() => {
    actualizarDatos();
  }, 5000);
});