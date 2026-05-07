// Esta función se ejecuta cuando el usuario presiona el botón Entrar
async function manejarInicioSesion(event) {

  // Evita que la página se recargue
  event.preventDefault();

  // Guarda lo que el usuario escribió
  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;

  try {

    const respuesta = await fetch("https://senorpirapi.onrender.com/api/login", {
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

    if (!respuesta.ok) {
      alert(data.mensaje);
      return;
    }

    // Guardar el id del usuario para usarlo en el dashboard
    localStorage.setItem("usuarioId", data.usuario.id);

    // Opcional: guardar nombre y correo
    localStorage.setItem("nombre", data.usuario.nombre);
    localStorage.setItem("correo", data.usuario.correo);

    alert("Inicio de sesión correcto");

    // Lleva al usuario al dashboard
    window.location.href = "dashboard.html";

  } catch (error) {
    console.error("Error en login:", error);
    alert("No se pudo iniciar sesión");
  }
}