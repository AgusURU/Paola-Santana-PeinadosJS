const form = document.getElementById("form-turno");
const listaTurnos = document.getElementById("lista-turnos");
const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");

// Horarios válidos
const horarios = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
];

// Cargar horarios disponibles al seleccionar fecha
fechaInput.addEventListener("change", () => {
  horaSelect.innerHTML = '<option value="">Seleccionar</option>';
  const fecha = fechaInput.value;

  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  const bloqueos = JSON.parse(localStorage.getItem("bloqueos")) || {};

  const usados = turnos
    .filter(t => t.fecha === fecha)
    .map(t => t.hora);

  const bloqueados = bloqueos[fecha] || [];

  horarios.forEach(h => {
    if (!usados.includes(h) && !bloqueados.includes(h)) {
      const option = document.createElement("option");
      option.value = h;
      option.textContent = h;
      horaSelect.appendChild(option);
    }
  });

  mostrarTurnos(); // Mostrar ocupados en esa fecha
});

// Guardar turno
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const servicio = document.getElementById("servicio").value;
  const fecha = fechaInput.value;
  const hora = horaSelect.value;

  if (!nombre || !servicio || !fecha || !hora) {
    alert("Por favor completá todos los campos.");
    return;
  }

  const nuevoTurno = { nombre, servicio, fecha, hora };
  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];

  const existe = turnos.some(t => t.fecha === fecha && t.hora === hora);
  if (existe) {
    alert("Ese turno ya está reservado.");
    return;
  }

  turnos.push(nuevoTurno);
  localStorage.setItem("turnos", JSON.stringify(turnos));

  form.reset();
  horaSelect.innerHTML = '<option value="">Seleccionar</option>';
  mostrarTurnos();
});

// Mostrar lista de turnos (solo estado, sin datos personales)
function mostrarTurnos() {
  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  const bloqueos = JSON.parse(localStorage.getItem("bloqueos")) || {};
  const fechaSeleccionada = fechaInput.value;

  listaTurnos.innerHTML = "";

  if (!fechaSeleccionada) return;

  horarios.forEach(hora => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const estaOcupado = turnos.some(t => t.fecha === fechaSeleccionada && t.hora === hora);
    const estaBloqueado = (bloqueos[fechaSeleccionada] || []).includes(hora);

    if (estaBloqueado) {
      li.textContent = `${hora} - NO DISPONIBLE`;
      li.classList.add("text-muted");
    } else if (estaOcupado) {
      li.textContent = `${hora} - OCUPADO`;
      li.classList.add("text-danger");
    } else {
      li.textContent = `${hora} - DISPONIBLE`;
      li.classList.add("text-success");
    }

    listaTurnos.appendChild(li);
  });
}

// Al cargar
mostrarTurnos();
