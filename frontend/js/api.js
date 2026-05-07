const API_URL = "https://senorpirapi.onrender.com";

// =========================
// OBTENER ÚLTIMOS MOVIMIENTOS
// =========================
async function obtenerMovimientos(limite = 20) {
  try {
    const respuesta = await fetch(
      `${API_URL}/movimientos?limite=${limite}`
    );

    if (!respuesta.ok) {
      throw new Error("No se pudieron obtener los movimientos");
    }

    return await respuesta.json();

  } catch (error) {
    console.error("Error obteniendo movimientos:", error);
    return [];
  }
}

// =========================
// GRÁFICA DEL DÍA
// =========================
async function obtenerGraficaDia() {
  try {
    const respuesta = await fetch(`${API_URL}/movimientos/dia`);

    if (!respuesta.ok) {
      throw new Error("Error obteniendo gráfica del día");
    }

    return await respuesta.json();

  } catch (error) {
    console.error(error);
    return Array(24).fill(0);
  }
}

// =========================
// GRÁFICA DEL MES
// =========================
async function obtenerGraficaMes() {
  try {
    const respuesta = await fetch(`${API_URL}/movimientos/mes`);

    if (!respuesta.ok) {
      throw new Error("Error obteniendo gráfica del mes");
    }

    return await respuesta.json();

  } catch (error) {
    console.error(error);
    return Array(30).fill(0);
  }
}

// =========================
// GRÁFICA DEL AÑO
// =========================
async function obtenerGraficaAnio() {
  try {
    const respuesta = await fetch(`${API_URL}/movimientos/anio`);

    if (!respuesta.ok) {
      throw new Error("Error obteniendo gráfica del año");
    }

    return await respuesta.json();

  } catch (error) {
    console.error(error);
    return Array(12).fill(0);
  }
}