const API_URL = "http://localhost:3000";

// =========================
// OBTENER USUARIO ACTUAL
// =========================
function obtenerUsuario() {

  return JSON.parse(localStorage.getItem("usuario"));
}

// =========================
// OBTENER ÚLTIMOS MOVIMIENTOS
// =========================
async function obtenerMovimientos(limite = 20) {

  try {

    const usuario = obtenerUsuario();

    if (!usuario) {
      return [];
    }

    const respuesta = await fetch(
      `${API_URL}/movimientos/${usuario.id}?limite=${limite}`
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

    const usuario = obtenerUsuario();

    if (!usuario) {
      return Array(24).fill(0);
    }

    const respuesta = await fetch(
      `${API_URL}/movimientos/dia/${usuario.id}`
    );

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

    const usuario = obtenerUsuario();

    if (!usuario) {
      return Array(31).fill(0);
    }

    const respuesta = await fetch(
      `${API_URL}/movimientos/mes/${usuario.id}`
    );

    if (!respuesta.ok) {
      throw new Error("Error obteniendo gráfica del mes");
    }

    return await respuesta.json();

  } catch (error) {

    console.error(error);

    return Array(31).fill(0);
  }
}

// =========================
// GRÁFICA DEL AÑO
// =========================
async function obtenerGraficaAnio() {

  try {

    const usuario = obtenerUsuario();

    if (!usuario) {
      return Array(12).fill(0);
    }

    const respuesta = await fetch(
      `${API_URL}/movimientos/anio/${usuario.id}`
    );

    if (!respuesta.ok) {
      throw new Error("Error obteniendo gráfica del año");
    }

    return await respuesta.json();

  } catch (error) {

    console.error(error);

    return Array(12).fill(0);
  }
}