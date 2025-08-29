// agenda.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBlv2_ly2BPTKTTgMujCQsK4i_LwiWfPvs",
  authDomain: "paola-santana-peluqueria.firebaseapp.com",
  projectId: "paola-santana-peluqueria",
  storageBucket: "paola-santana-peluqueria.firebasestorage.app",
  messagingSenderId: "956120172923",
  appId: "1:956120172923:web:ff349d624dd1ffc48395de",
  measurementId: "G-2EEBHTQPT5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Elementos del DOM
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

// Solicitar permiso para notificaciones al cargar
window.addEventListener("DOMContentLoaded", () => {
  mostrarTurnos();

  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
});

// Actualizar lista de turnos y select de horas
async function actualizarListaYSelect(turnos) {
  const fechaSeleccionada = fechaInput.value;
  if (!fechaSeleccionada) return;

  horaSelect.innerHTML = '<option value="">Seleccionar</option>';
  listaTurnos.innerHTML = "";

  // Consulta bloqueos en Firestore
  let bloqueados = [];
  const docSnap = await getDoc(doc(db, "bloqueos", fechaSeleccionada));
  if (docSnap.exists()) {
    bloqueados = docSnap.data().horas || [];
  }

  const hoy = new Date();
  const esHoy = fechaSeleccionada === hoy.toISOString().slice(0, 10);

  horarios.forEach(hora => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const estaOcupado = turnos.some(t => t.fecha === fechaSeleccionada && t.hora === hora);
    const estaBloqueado = bloqueados.includes(hora);
    let turnoPasado = false;

    if (esHoy) {
      const [horas, minutos] = hora.split(":").map(Number);
      const turnoDate = new Date();
      turnoDate.setHours(horas, minutos, 0, 0);
      if (turnoDate < hoy) turnoPasado = true;
    }

    if (estaBloqueado) {
      li.textContent = `${hora} - BLOQUEADO`;
      li.classList.add("text-warning");
    } else if (estaOcupado) {
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

// Mostrar turnos en tiempo real desde Firestore
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

// Revisar turnos próximos y notificar
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

// Evento al cambiar fecha
fechaInput.addEventListener("change", mostrarTurnos);

// Guardar turno en Firestore
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const servicio = document.getElementById("servicio").value;
  const fecha = fechaInput.value;
  const hora = horaSelect.value;

  if (!nombre || !telefono || !servicio || !fecha || !hora) {
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
    await addDoc(collection(db, "reservas"), { nombre, telefono, servicio, fecha, hora, notificado: false });
    alert("Reserva realizada!");
    form.reset();
    horaSelect.innerHTML = '<option value="">Seleccionar</option>';
    mostrarTurnos();
  } catch (error) {
    console.error(error);
    alert("Error al guardar la reserva");
  }
});
