// Esta función se ejecuta cuando el usuario presiona el botón Entrar
async function manejarInicioSesion(event) {

  // Evita que la página se recargue
  event.preventDefault();

  // Guarda lo que el usuario escribió
  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;

  try {

    const respuesta = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        correo,
        contrasena
      })
    });

    const data = await respuesta.json();

    console.log("Respuesta:", data);

    if (!respuesta.ok) {
      alert(data.mensaje);
      return;
    }

    // GUARDAR SESIÓN COMPLETA
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    alert("Inicio de sesión correcto");

    // Lleva al usuario al dashboard
    window.location.href = "dashboard.html";

  } catch (error) {
    console.error("Error en login:", error);
    alert("No se pudo iniciar sesión");
  }
}