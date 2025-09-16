// script.js

// Obtener el contenedor de servicios
const listaServicios = document.getElementById("lista-servicios");

// Cargar servicios desde el archivo JSON
fetch("servicios.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo cargar el JSON: " + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    // Limpiamos el contenedor por si acaso
    listaServicios.innerHTML = "";

    data.forEach(servicio => {
      const card = document.createElement("div");
      card.classList.add("servicio");

      card.innerHTML = `
        <div class="servicio-header">
          <div class="servicio-logo"></div>
          <div class="servicio-titulo">${servicio.titulo}</div>
        </div>
        <div class="servicio-precio">${servicio.precio}</div>
        <div class="servicio-duracion">${servicio.duracion}</div>
        <div class="servicio-descripcion">${servicio.descripcion}</div>
        <button class="btn-reservar" onclick="document.getElementById('reservar').scrollIntoView({ behavior: 'smooth' })">
          Reservar
        </button>
      `;

      listaServicios.appendChild(card);
    });
  })
  .catch(error => console.error("Error cargando servicios:", error));


  // script.js
window.addEventListener('scroll', function() {
  const logo = document.querySelector('.logo');
  if (window.scrollY > 50) { // cuando scrolleas más de 50px
    logo.classList.add('small');
  } else {
    logo.classList.remove('small');
  }
});
// ----------------------------
// WIZARD DE RESERVA
// ----------------------------
(() => {
  const panels = Array.from(document.querySelectorAll(".step-panel"));
  const steps = Array.from(document.querySelectorAll(".step"));
  const selectServicio = document.getElementById("select-servicio");
  const resumen = document.getElementById("servicio-resumen");
  const montoPago = document.getElementById("monto-pago");
  const horaSelect = document.getElementById("hora");
  const resultado = document.getElementById("resultado-reserva");

  let serviciosData = [];
  let state = {
    step: 1,
    servicioIndex: null,
    datos: {},
    pagoConfirmado: false,
    fecha: null,
    hora: null,
  };

  // Cambia de paso
  function showStep(n) {
    state.step = n;
    panels.forEach((p) =>
      p.classList.toggle("is-active", Number(p.dataset.step) === n)
    );
    steps.forEach((s) => {
      const i = Number(s.dataset.step);
      s.classList.toggle("active", i === n);
      s.setAttribute("aria-selected", i === n ? "true" : "false");
    });
  }

  // Horas disponibles por defecto
  function fillHorasPorDefecto() {
    const horas = ["09:00", "10:30", "12:00", "15:00", "17:00"];
    horaSelect.innerHTML = '<option value="">Seleccioná una hora</option>';
    horas.forEach((h) => {
      const opt = document.createElement("option");
      opt.value = h;
      opt.textContent = h;
      horaSelect.appendChild(opt);
    });
  }

  // Resumen del servicio
  function renderResumen(index) {
    if (index === null || serviciosData.length === 0) {
      resumen.hidden = true;
      return;
    }
    const s = serviciosData[index];
    resumen.hidden = false;
    resumen.innerHTML = `
      <strong>${s.titulo}</strong>
      <div style="margin-top:6px;color:var(--violeta-medio)">
        ${s.duracion} · <span style="color:var(--verde);font-weight:700">${s.precio}</span>
      </div>
      <p style="margin-top:8px;color:var(--texto);font-size:0.95rem">
        ${s.descripcion.slice(0, 160)}${s.descripcion.length > 160 ? "..." : ""}
      </p>
    `;
    montoPago.textContent = s.precio || "—";
  }

  // Llenar select con servicios
  function populateSelect() {
    selectServicio.innerHTML = '<option value="">Elegí un servicio</option>';
    serviciosData.forEach((s, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${s.titulo} — ${s.precio}`;
      selectServicio.appendChild(opt);
    });
  }

  // Cargar servicios
  fetch("servicios.json")
    .then((r) => {
      if (!r.ok) throw new Error("No se pudo cargar servicios.json");
      return r.json();
    })
    .then((json) => {
      serviciosData = json;
      populateSelect();
      renderResumen(null);
    })
    .catch((err) => {
      console.error("Error cargando servicios.json:", err);
      serviciosData = [
        {
          titulo: "Sesión de ejemplo",
          descripcion: "Descripción ejemplo",
          duracion: "45 min",
          precio: "$0",
        },
      ];
      populateSelect();
      renderResumen(null);
    });

  // Handlers
  selectServicio.addEventListener("change", (e) => {
    const idx = e.target.value === "" ? null : Number(e.target.value);
    state.servicioIndex = idx;
    renderResumen(idx);
    document.getElementById("next-1").disabled = idx === null;
  });

  document.getElementById("next-1").addEventListener("click", () => {
    if (state.servicioIndex !== null) showStep(2);
  });

  document.getElementById("back-2").addEventListener("click", (e) => {
    e.preventDefault();
    showStep(1);
  });

  document.getElementById("next-2").addEventListener("click", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    if (!nombre || !email) {
      alert("Por favor completá tu nombre y email.");
      return;
    }
    state.datos = {
      nombre,
      email,
      telefono: document.getElementById("telefono").value.trim(),
    };
    showStep(3);
  });

  document.getElementById("back-3").addEventListener("click", () => showStep(2));

  document.getElementById("next-3").addEventListener("click", (e) => {
    e.preventDefault();
    state.pagoConfirmado = true;
    fillHorasPorDefecto();
    showStep(4);
  });

  document.getElementById("back-4").addEventListener("click", () => showStep(3));

  document.getElementById("confirmar").addEventListener("click", () => {
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    if (!fecha || !hora) {
      alert("Por favor seleccioná fecha y hora.");
      return;
    }
    state.fecha = fecha;
    state.hora = hora;

    const s = serviciosData[state.servicioIndex];
    resultado.hidden = false;
    resultado.innerHTML = `
      <p><strong>Reserva confirmada:</strong></p>
      <p>${s.titulo} — ${s.precio}</p>
      <p>Fecha: ${state.fecha} a las ${state.hora}</p>
      <p>Para: ${state.datos.nombre} (${state.datos.email})</p>
    `;

    steps.forEach((st) =>
      st.classList.toggle("active", Number(st.dataset.step) === 4)
    );
  });

  // Permitir volver a pasos anteriores clickeando
  steps.forEach((s) => {
    s.addEventListener("click", () => {
      const stepNum = Number(s.dataset.step);
      if (stepNum < state.step) showStep(stepNum);
    });
  });

  // Init → Paso 1 (sin focus automático)
  showStep(1);
})();
