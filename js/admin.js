// Claves
const CLAVE_ADMIN = "paolapelu1";     // Contraseña para ingresar al panel general
const CLAVE_BLOQUEO = "paolapelu2";  // Contraseña para acceder a bloqueos

// Verificación de acceso general
function verificarClave() {
  const input = document.getElementById("admin-pass").value;
  if (input === CLAVE_ADMIN) {
    document.getElementById("login-admin").classList.add("d-none");
    document.getElementById("admin-panel").classList.remove("d-none");
    cargarTurnos();
    cargarHorariosBloqueo(); // Preparamos el select, pero no mostramos el panel aún
  } else {
    alert("Contraseña incorrecta.");
  }
}

// Verificación de clave para acceder a bloqueos
function verificarBloqueo() {
  const input = document.getElementById("clave-bloqueo").value;
  if (input === CLAVE_BLOQUEO) {
    document.getElementById("bloqueo-login").classList.add("d-none");
    document.getElementById("bloqueo-panel").classList.remove("d-none");
  } else {
    alert("Contraseña incorrecta para bloqueo.");
  }
}

// Mostrar turnos agendados
function cargarTurnos() {
  const lista = document.getElementById("admin-turnos");
  lista.innerHTML = "";
  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];

  turnos.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      ${t.fecha} ${t.hora} - ${t.nombre} (${t.servicio})
      <button class="btn btn-danger btn-sm" onclick="eliminarTurno(${i})">Eliminar</button>
    `;
    lista.appendChild(li);
  });
}

// Eliminar turno
function eliminarTurno(index) {
  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  turnos.splice(index, 1);
  localStorage.setItem("turnos", JSON.stringify(turnos));
  cargarTurnos();
}

// Horarios disponibles (para bloqueo)
const horarios = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
];

// Cargar los horarios al select múltiple
function cargarHorariosBloqueo() {
  const select = document.getElementById("bloqueo-horas");
  if (!select) return;

  select.innerHTML = ""; // Por si ya estaban cargados
  horarios.forEach(h => {
    const opt = document.createElement("option");
    opt.value = h;
    opt.textContent = h;
    select.appendChild(opt);
  });
}

// Guardar bloqueos de horarios en localStorage
function bloquearHorarios() {
  const fecha = document.getElementById("fecha-bloqueo").value;
  const seleccionadas = Array.from(document.getElementById("bloqueo-horas").selectedOptions).map(opt => opt.value);

  if (!fecha || seleccionadas.length === 0) {
    alert("Seleccioná una fecha y al menos un horario para bloquear.");
    return;
  }

  const bloqueos = JSON.parse(localStorage.getItem("bloqueos")) || {};
  bloqueos[fecha] = [...new Set([...(bloqueos[fecha] || []), ...seleccionadas])];
  localStorage.setItem("bloqueos", JSON.stringify(bloqueos));

  alert("Horarios bloqueados para " + fecha);
}
