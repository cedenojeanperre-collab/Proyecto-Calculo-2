let myChart = null;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("form-simulador").addEventListener("submit", function(e) {
        e.preventDefault();

        const A0 = parseFloat(document.getElementById("capital").value) || 0;
        const M = parseFloat(document.getElementById("aporte").value) || 0;
        const rInput = parseFloat(document.getElementById("tasa").value);
        const r = isNaN(rInput) ? 0 : rInput / 100;
        const t = parseInt(document.getElementById("tiempo").value);
        const tipo = document.getElementById("tipo").value;
        const objetivo = document.getElementById("objetivo").value;

        if (t <= 0) {
            alert("⚠️ El tiempo debe ser mayor a 0 meses.");
            return;
        }

        const etiquetas = [];
        const valoresSimple = [];
        const valoresCompuesto = [];

        for (let mes = 0; mes <= t; mes++) {
            // Interés SIMPLE: A = A0(1 + r*t) + M*t
            const Asimple = A0 * (1 + r * mes) + M * mes;

            // Interés COMPUESTO: A = A0*(1+r)^t + M * ((1+r)^t - 1) / r
            let Acomp;
            if (r === 0) {
                Acomp = A0 + M * mes;
            } else {
                Acomp = A0 * Math.pow(1 + r, mes) + M * ((Math.pow(1 + r, mes) - 1) / r);
            }

            valoresSimple.push(parseFloat(Asimple.toFixed(2)));
            valoresCompuesto.push(parseFloat(Acomp.toFixed(2)));
            etiquetas.push(mes === 0 ? "Inicio" : `Mes ${mes}`);
        }

        const finalSimple = valoresSimple[valoresSimple.length - 1];
        const finalCompuesto = valoresCompuesto[valoresCompuesto.length - 1];
        const totalInvertido = A0 + M * t;
        const gananciaSimple = finalSimple - totalInvertido;
        const gananciaCompuesta = finalCompuesto - totalInvertido;
        const diferencia = finalCompuesto - finalSimple;

        const resultadoDiv = document.getElementById("resultado");
        resultadoDiv.classList.add("show");

        let resultadoHTML = `
            <div style="text-align: center; margin-bottom: 1rem;">
                <strong style="font-size: 1.1rem; color: #2d3748;">
                    ${objetivo.replace(/^\w/, c => c.toUpperCase())} - ${t} meses
                </strong>
            </div>
            <div class="resultado-grid">
                <div class="resultado-item">
                    <div class="resultado-label">Total Invertido</div>
                    <div class="resultado-valor">$${totalInvertido.toFixed(2)}</div>
                </div>
        `;

        if (tipo === "comparar" || tipo === "simple") {
            resultadoHTML += `
                <div class="resultado-item">
                    <div class="resultado-label">Final Simple</div>
                    <div class="resultado-valor simple">$${finalSimple.toFixed(2)}</div>
                </div>
                <div class="resultado-item">
                    <div class="resultado-label">Ganancia Simple</div>
                    <div class="resultado-valor simple">$${gananciaSimple.toFixed(2)}</div>
                </div>
            `;
        }

        if (tipo === "comparar" || tipo === "compuesto") {
            resultadoHTML += `
                <div class="resultado-item">
                    <div class="resultado-label">Final Compuesto</div>
                    <div class="resultado-valor compuesto">$${finalCompuesto.toFixed(2)}</div>
                </div>
                <div class="resultado-item">
                    <div class="resultado-label">Ganancia Compuesta</div>
                    <div class="resultado-valor compuesto">$${gananciaCompuesta.toFixed(2)}</div>
                </div>
            `;
        }

        if (tipo === "comparar") {
            resultadoHTML += `
                <div class="resultado-item" style="grid-column: 1 / -1;">
                    <div class="resultado-label">Diferencia (Compuesto vs Simple)</div>
                    <div class="resultado-valor" style="color: #805ad5;">+$${diferencia.toFixed(2)}</div>
                </div>
            `;
        }

        resultadoHTML += `</div>`;
        resultadoDiv.innerHTML = resultadoHTML;

        // Agregar al historial
        const historialUL = document.getElementById("historial");
        const emptyState = historialUL.querySelector(".empty-state");
        if (emptyState) emptyState.remove();

        const li = document.createElement("li");
        const objetivoTexto = document.querySelector(`#objetivo option[value="${objetivo}"]`).textContent;
        
        if (tipo === "comparar") {
            li.innerHTML = `
                <strong>${objetivoTexto}</strong>
                <span>Simple: $${finalSimple.toFixed(2)}</span>
                <span class="badge badge-info">Compuesto: $${finalCompuesto.toFixed(2)}</span>
                <span class="badge badge-success">+$${diferencia.toFixed(2)}</span>
                <span style="display: block; margin-top: 0.5rem; font-size: 0.85rem;">${t} meses • Tasa: ${(r * 100).toFixed(2)}%</span>
            `;
        } else if (tipo === "simple") {
            li.innerHTML = `
                <strong>${objetivoTexto}</strong>
                <span>Simple: $${finalSimple.toFixed(2)}</span>
                <span style="display: block; margin-top: 0.5rem; font-size: 0.85rem;">${t} meses • Tasa: ${(r * 100).toFixed(2)}%</span>
            `;
        } else {
            li.innerHTML = `
                <strong>${objetivoTexto}</strong>
                <span>Compuesto: $${finalCompuesto.toFixed(2)}</span>
                <span style="display: block; margin-top: 0.5rem; font-size: 0.85rem;">${t} meses • Tasa: ${(r * 100).toFixed(2)}%</span>
            `;
        }

        historialUL.insertBefore(li, historialUL.firstChild);

        // Crear gráfico
        const datasets = [];

        if (tipo === "comparar" || tipo === "simple") {
            datasets.push({
                label: "Interés Simple",
                data: valoresSimple,
                borderColor: "#3182ce",
                backgroundColor: "rgba(49, 130, 206, 0.1)",
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 3
            });
        }

        if (tipo === "comparar" || tipo === "compuesto") {
            datasets.push({
                label: "Interés Compuesto",
                data: valoresCompuesto,
                borderColor: "#38a169",
                backgroundColor: "rgba(56, 161, 105, 0.1)",
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 3
            });
        }

        if (myChart) {
            myChart.destroy();
        }

        const ctx = document.getElementById("grafico").getContext("2d");
        myChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: etiquetas,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: "index",
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            font: {
                                size: 14,
                                weight: 600
                            },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ": $" + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Período (meses)",
                            font: {
                                size: 13,
                                weight: 600
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Monto (USD)",
                            font: {
                                size: 13,
                                weight: 600
                            }
                        },
                        ticks: {
                            callback: function(value) {
                                return "$" + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    });
});

function limpiarHistorial() {
    const historialUL = document.getElementById("historial");
    const resultadoDiv = document.getElementById("resultado");
    
    historialUL.innerHTML = `
        <div class="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p>No hay simulaciones todavía. ¡Crea tu primera simulación!</p>
        </div>
    `;
    
    resultadoDiv.classList.remove("show");
    
    if (myChart) {
        myChart.destroy();
        myChart = null;
    }
}

