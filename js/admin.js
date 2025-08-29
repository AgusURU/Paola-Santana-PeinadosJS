import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Clave única de admin
const CLAVE_ADMIN = "paolapelu1";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBlv2_ly2BPTKTTgMujCQsK4i_LwiWfPvs",
  authDomain: "paola-santana-peluqueria.firebaseapp.com",
  projectId: "paola-santana-peluqueria",
  storageBucket: "paola-santana-peluqueria.appspot.com",
  messagingSenderId: "956120172923",
  appId: "1:956120172923:web:ff349d624dd1ffc48395de",
  measurementId: "G-2EEBHTQPT5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Verificación de acceso general
function verificarClave() {
  const input = document.getElementById("admin-pass").value;
  if (input === CLAVE_ADMIN) {
    document.getElementById("login-admin").classList.add("d-none");
    document.getElementById("admin-panel").classList.remove("d-none");
    cargarTurnos();
    cargarHorariosBloqueo();
  } else {
    alert("Contraseña incorrecta.");
  }
}

// Mostrar turnos agendados
async function cargarTurnos() {
  const lista = document.getElementById("admin-turnos");
  if (!lista) return;
  lista.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "reservas"));
  querySnapshot.forEach((docSnap) => {
    const t = docSnap.data();
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      ${t.fecha} ${t.hora} - ${t.nombre} (${t.servicio}) - <span class="text-secondary">Tel: ${t.telefono || 'No informado'}</span>
      <button class="btn btn-danger btn-sm ms-2">Eliminar</button>
    `;
    const btn = li.querySelector("button");
    btn.addEventListener("click", () => eliminarTurnoFirestore(docSnap.id));
    lista.appendChild(li);
  });
}

// Eliminar turno de Firestore
async function eliminarTurnoFirestore(id) {
  if (confirm("¿Seguro que deseas eliminar este turno?")) {
    await deleteDoc(doc(db, "reservas", id));
    cargarTurnos();
  }
}

// Cargar horarios para el select de bloqueo
function cargarHorariosBloqueo() {
  const horarios = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
  ];
  const select = document.getElementById("bloqueo-horas");
  if (!select) return;
  select.innerHTML = "";
  horarios.forEach(hora => {
    const option = document.createElement("option");
    option.value = hora;
    option.textContent = hora;
    select.appendChild(option);
  });
}

// Bloquear horarios para una fecha
async function bloquearHorarios() {
  const fecha = document.getElementById("fecha-bloqueo").value;
  const select = document.getElementById("bloqueo-horas");
  if (!fecha || !select) return;
  const seleccionados = Array.from(select.selectedOptions).map(opt => opt.value);
  if (seleccionados.length === 0) {
    alert("Selecciona al menos un horario para bloquear.");
    return;
  }
  await setDoc(doc(db, "bloqueos", fecha), { horas: seleccionados });
  alert("Horarios bloqueados para " + fecha);
  mostrarBloqueosFecha();
}

// Desbloquear horarios para una fecha
async function desbloquearHorarios() {
  const fecha = document.getElementById("fecha-bloqueo").value;
  if (!fecha) return;
  await deleteDoc(doc(db, "bloqueos", fecha));
  alert("Bloqueos eliminados para " + fecha);
  mostrarBloqueosFecha();
}

// Mostrar bloqueos de una fecha en el select
async function mostrarBloqueosFecha() {
  const fecha = document.getElementById("fecha-bloqueo").value;
  const select = document.getElementById("bloqueo-horas");
  if (!fecha || !select) return;
  Array.from(select.options).forEach(opt => opt.selected = false);
  const docSnap = await getDoc(doc(db, "bloqueos", fecha));
  if (docSnap.exists()) {
    const bloqueados = docSnap.data().horas || [];
    Array.from(select.options).forEach(opt => {
      if (bloqueados.includes(opt.value)) opt.selected = true;
    });
  }
}

// Exponer funciones necesarias al global para el HTML
window.verificarClave = verificarClave;
window.bloquearHorarios = bloquearHorarios;
window.desbloquearHorarios = desbloquearHorarios;
window.eliminarTurnoFirestore = eliminarTurnoFirestore;
window.mostrarBloqueosFecha = mostrarBloqueosFecha;
