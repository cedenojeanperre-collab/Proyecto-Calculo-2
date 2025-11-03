// script.js - versión corregida y segura
let myChart = null;

// Esperar a que el DOM cargue
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-simulador");
  const historialUL = document.getElementById("historial");
  const canvas = document.getElementById("grafico");

  // Asegura que exista un contenedor para resultados
  let resultadoDiv = document.getElementById("resultado");
  if (!resultadoDiv) {
    resultadoDiv = document.createElement("div");
    resultadoDiv.id = "resultado";
    // inserta el resultado justo antes del canvas
    canvas.parentNode.insertBefore(resultadoDiv, canvas);
    resultadoDiv.style.marginTop = "12px";
    resultadoDiv.style.fontWeight = "600";
  }

  // Listener para el formulario
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    try {
      // Leer valores
      const A0 = parseFloat(document.getElementById("capital").value) || 0;
      const M = parseFloat(document.getElementById("aporte").value) || 0;
      const rInput = parseFloat(document.getElementById("tasa").value);
      const r = isNaN(rInput) ? 0 : rInput / 100; // convierte % a decimal
      const t = parseInt(document.getElementById("tiempo").value);
      const tipo = document.getElementById("tipo").value || "comparar";
      const objetivo = document.getElementById("objetivo").value || "";

      // Validaciones básicas
      if (isNaN(t) || t <= 0) {
        resultadoDiv.innerText = "⚠️ Ingresa un tiempo (meses) válido (> 0).";
        return;
      }

      console.log("DEBUG inputs ->", { A0, M, r, t, tipo, objetivo });

      // Arrays para las series
      const etiquetas = [];
      const valoresSimple = [];
      const valoresCompuesto = [];

      // Generar series mes a mes (incluye mes 0 si quieres)
      for (let mes = 0; mes <= t; mes++) {
        // Interés simple: A0 + M * mes
        const Asimple = A0 + M * mes;

        // Interés compuesto: A0*(1+r)^mes + M * (( (1+r)^mes - 1)/r)
        let Acomp;
        if (r === 0) {
          // Si r = 0, compuesto == simple
          Acomp = A0 + M * mes;
        } else {
          Acomp = A0 * Math.pow(1 + r, mes) + M * ((Math.pow(1 + r, mes) - 1) / r);
        }

        valoresSimple.push(parseFloat(Asimple.toFixed(2)));
        valoresCompuesto.push(parseFloat(Acomp.toFixed(2)));
        etiquetas.push(mes === 0 ? "Inicio" : "Mes " + mes);
      }

      console.log("DEBUG sample values", valoresSimple.slice(0,6), valoresCompuesto.slice(0,6));

      // Monto final (último elemento)
      const finalSimple = valoresSimple[valoresSimple.length - 1];
      const finalCompuesto = valoresCompuesto[valoresCompuesto.length - 1];

      // Construir mensaje de resultado según modo
      let resultadoHTML = `<div><strong>Meta:</strong> ${objetivo} • <strong>Período:</strong> ${t} meses</div>`;
      if (tipo === "comparar") {
        resultadoHTML += `<div>Interés simple: <strong>$${finalSimple.toFixed(2)}</strong></div>`;
        resultadoHTML += `<div>Interés compuesto: <strong>$${finalCompuesto.toFixed(2)}</strong></div>`;
      } else if (tipo === "simple") {
        resultadoHTML += `<div>Interés simple: <strong>$${finalSimple.toFixed(2)}</strong></div>`;
      } else {
        resultadoHTML += `<div>Interés compuesto: <strong>$${finalCompuesto.toFixed(2)}</strong></div>`;
      }
      resultadoDiv.innerHTML = resultadoHTML;

      // Añadir registro al historial
      const li = document.createElement("li");
      if (tipo === "comparar") {
        li.innerHTML = `<strong>${objetivo}</strong> — Simple: $${finalSimple.toFixed(2)} / Compuesto: $${finalCompuesto.toFixed(2)} (${t}m)`;
      } else if (tipo === "simple") {
        li.innerHTML = `<strong>${objetivo}</strong> — Simple: $${finalSimple.toFixed(2)} (${t}m)`;
      } else {
        li.innerHTML = `<strong>${objetivo}</strong> — Compuesto: $${finalCompuesto.toFixed(2)} (${t}m)`;
      }
      historialUL.insertBefore(li, historialUL.firstChild);

      // Preparar datasets según modo
      const datasets = [];
      if (tipo === "comparar" || tipo === "simple") {
        datasets.push({
          label: "Interés Simple",
          data: valoresSimple,
          borderColor: "#2D9CDB",
          backgroundColor: "rgba(45,157,219,0.12)",
          tension: 0.25,
          fill: true,
          pointRadius: 3
        });
      }
      if (tipo === "comparar" || tipo === "compuesto") {
        datasets.push({
          label: "Interés Compuesto",
          data: valoresCompuesto,
          borderColor: "#27AE60",
          backgroundColor: "rgba(39,174,96,0.12)",
          tension: 0.25,
          fill: true,
          pointRadius: 3
        });
      }

      // Destruir gráfico anterior si existe
      if (myChart) {
        myChart.destroy();
      }

      // Crear gráfico
      const ctx = canvas.getContext("2d");
      myChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: etiquetas,
          datasets: datasets
        },
        options: {
          responsive: true,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "top" }
          },
          scales: {
            x: { title: { display: true, text: "Periodo (meses)" } },
            y: {
              title: { display: true, text: "Monto (USD)" },
              ticks: { beginAtZero: true }
            }
          }
        }
      });

    } catch (err) {
      console.error("Error en simulación:", err);
      resultadoDiv.innerText = "❗ Ocurrió un error al simular. Revisa la consola (F12) para más detalles.";
    }
  });
});

// Función global para limpiar historial y gráfico
function limpiarHistorial() {
  try {
    const historialUL = document.getElementById("historial");
    const resultadoDiv = document.getElementById("resultado");
    historialUL.innerHTML = "";
    if (resultadoDiv) resultadoDiv.innerHTML = "";
    if (window.myChart) {
      window.myChart.destroy();
      window.myChart = null;
    }
  } catch (err) {
    console.error("Error al limpiar historial:", err);
  }
}





