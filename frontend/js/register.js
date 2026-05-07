// Buscar el formulario por su id
const formulario = document.getElementById("formRegistro");

// Esperar a que el usuario presione el botón Registrarse
formulario.addEventListener("submit", async function (event) {

  // Evitar que la página se recargue
  event.preventDefault();

  // Obtener los valores escritos en los inputs
  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;

  try {

    // Enviar los datos al backend
    const respuesta = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: nombre,
        correo: correo,
        contrasena: contrasena
      })
    });

    // Convertir la respuesta a JSON
    const datos = await respuesta.json();

    // Mostrar mensaje del servidor
    alert(datos.mensaje);

    // Si el registro fue exitoso, ir a login
    if (respuesta.ok) {
      window.location.href = "login.html";
    }

  } catch (error) {

    // Mostrar error en consola
    console.log(error);

    // Mostrar mensaje de error
    alert("No se pudo registrar el usuario");
  }
});