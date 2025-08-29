import { db } from './firebase.js';
import { collection, addDoc, query, where, getDocs, onSnapshot, doc, updateDoc } from "firebase/firestore";

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

let unsubscribe = null;

// Solicitar permiso para notificaciones
window.addEventListener("DOMContentLoaded", () => {
  mostrarTurnos();

  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
});

// Mostrar turnos y actualizar select
function actualizarListaYSelect(turnos) {
  const fechaSeleccionada = fechaInput.value;
  if (!fechaSeleccionada) return;

  horaSelect.innerHTML = '<option value="">Seleccionar</option>';
  listaTurnos.innerHTML = "";

  const hoy = new Date();
  const esHoy = fechaSeleccionada === hoy.toISOString().slice(0,10);

  turnos.forEach(t => t); // solo para evitar warning si no usamos el array directamente

  horarios.forEach(hora => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const estaOcupado = turnos.some(t => t.hora === hora);

    let turnoPasado = false;
    if (esHoy) {
      const [horas, minutos] = hora.split(":").map(Number);
      const turnoDate = new Date();
      turnoDate.setHours(horas, minutos, 0, 0);
      if (turnoDate < hoy) turnoPasado = true;
    }

    if (estaOcupado) {
      li.textContent = `${hora} - OCUPADO`;
      li.classList.add("text-danger");
    } else if (turnoPasado) {
      li.textContent = `${hora} - NO DISPONIBLE`;
      li.classList.add("text-muted");
    } else {
      li.textContent = `${hora} - DISPONIBLE`;
      li.classList.add("text-success");

      const option = document.createElement("option");
      option.value = hora;
      option.textContent = hora;
      horaSelect.appendChild(option);
    }

    listaTurnos.appendChild(li);
  });
}

// Mostrar turnos en tiempo real
async function mostrarTurnos() {
  const fechaSeleccionada = fechaInput.value;
  if (!fechaSeleccionada) return;

  if (unsubscribe) unsubscribe();

  const q = query(collection(db, "reservas"), where("fecha", "==", fechaSeleccionada));
  unsubscribe = onSnapshot(q, snapshot => {
    const turnos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    actualizarListaYSelect(turnos);
    revisarTurnosProximos(turnos);
  });
}

// Revisar turnos próximos y notificar si no fue notificado aún
async function revisarTurnosProximos(turnos) {
  const ahora = new Date();

  turnos.forEach(async turno => {
    if (turno.notificado) return;

    const [horas, minutos] = turno.hora.split(":").map(Number);
    const turnoDate = new Date(turno.fecha);
    turnoDate.setHours(horas, minutos, 0, 0);

    const diffMinutos = (turnoDate - ahora) / 60000;

    if (diffMinutos > 0 && diffMinutos <= 30) {
      mostrarNotificacion(turno);
      // Marcar como notificado en Firestore
      const docRef = doc(db, "reservas", turno.id);
      await updateDoc(docRef, { notificado: true });
    }
  });
}

// Mostrar notificación
function mostrarNotificacion(turno) {
  if (Notification.permission === "granted") {
    new Notification("Turno próximo", {
      body: `Tenés un turno de ${turno.servicio} con ${turno.nombre} a las ${turno.hora}`,
      icon: "/icono-turno.png"
    });
  }
}

// Actualizar turnos al cambiar la fecha
fechaInput.addEventListener("change", mostrarTurnos);

// Guardar turno en Firestore
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const servicio = document.getElementById("servicio").value;
  const fecha = fechaInput.value;
  const hora = horaSelect.value;

  if (!nombre || !servicio || !fecha || !hora) {
    alert("Por favor completá todos los campos.");
    return;
  }

  const q = query(collection(db, "reservas"), where("fecha", "==", fecha), where("hora", "==", hora));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    alert("Ese turno ya está reservado.");
    return;
  }

  try {
    await addDoc(collection(db, "reservas"), { nombre, servicio, fecha, hora, notificado: false });
    alert("Reserva realizada!");
    form.reset();
    horaSelect.innerHTML = '<option value="">Seleccionar</option>';
    mostrarTurnos();
  } catch (error) {
    console.error(error);
    alert("Error al guardar la reserva");
  }
});
