// PROYECTO FINAL
// JAVASCRIPT
// PABLO JAVIER RASELLI

//------------------------------------------------------------------

let DateTime = luxon.DateTime;

const cotizacionesContainer = document.querySelector(".cotizaciones");

// Función para mostrar las cotizaciones
async function mostrarCotizaciones() {
    try {
        // Obtener los datos de la API:
        const response = await fetch('https://openexchangerates.org/api/latest.json?app_id=397d351e07324161bded7947abda3024');
        const data = await response.json();

        // Imprimir en consola los valores de todas las monedas:
        console.log("Valores de todas las monedas en la API:", data.rates);

        // Obtener el valor del peso argentino (ARS):
        const arsValue = data.rates.ARS;

        // Crear un objeto con las cotizaciones deseadas referenciadas al ARS:
        // Quería mostrar el valor de cambio con respecto al peso argentino (ARS) pero la API de cambios
        // no era gratuita, por lo que tomé el valor de cada moneda que quiero referenciar (cuyo valor ya
        // esta referenciado al dolar por defecto) y divido ese valor sobre el valor del peso argentino.
        // De esta manera obtengo un valor muy parecido al los que figuran en las web de cotizaciones.
        // De todas maneras, todo está calculado sobre los valores que figuran en la API.
        
        const cotizaciones = {
            "USD": arsValue / data.rates.USD,
            "EUR": arsValue / data.rates.EUR,
            "BRL": arsValue / data.rates.BRL,
            "CLP": arsValue / data.rates.CLP,
            "COP": arsValue / data.rates.COP,
            "PYG": arsValue / data.rates.PYG,
            "UYU": arsValue / data.rates.UYU,
            "PEN": arsValue / data.rates.PEN,
            // Aquí se pueden ir agregando mas monedas que esten en la API
        };

        // Crear un string con las cotizaciones formateadas y con dos decimales:
        let cotizacionesString = "Valores de Cambio Actualizados:\n";
        for (const moneda in cotizaciones) {
            cotizacionesString += `${moneda}: $ ${cotizaciones[moneda].toFixed(2)} | `;
        }
        
        // Eliminar el último '|':
        cotizacionesString = cotizacionesString.slice(0, -3);

        // Mostrar las cotizaciones en el contenedor:
        cotizacionesContainer.textContent = cotizacionesString;
    } catch (error) {
        console.error("Error al obtener las cotizaciones:", error);
        cotizacionesContainer.textContent = "Error al obtener las cotizaciones.";
    }
}

// Llamar a la función para mostrar las cotizaciones al cargar la página:
mostrarCotizaciones();

document.addEventListener("DOMContentLoaded", function() {
    displayCurrentDate();
    loadPayments();
    actualizarTotalPagos();

    document.querySelector("#formularioPagos").addEventListener("submit", function(event) {
        event.preventDefault();
        
        // Obtener valores del formulario:
        const nombre = document.querySelector("#nombrePago").value;
        const dia = document.querySelector("#diaPago").value;
        const monto = document.querySelector("#montoPago").value;
        
        // Crear objeto de pago:
        const pago = {
            nombre: nombre,
            dia: dia,
            monto: monto,
            pagado: false
        };
        
        // Guardar pago:
        guardarPago(pago);
        
        // Limpiar formulario:
        document.querySelector("#formularioPagos").reset();

        // Mostrar notificación de Toastify:
        mostrarNotificacion();
    });

    document.querySelector("#listaPagos").addEventListener("click", function(event) {
        if (event.target.classList.contains("delete-button")) {
            const fila = event.target.closest("div");
            const pago = fila.dataset.pago;
            eliminarPago(pago);
        } else if (event.target.classList.contains("check-pago")) {
            const fila = event.target.closest("div");
            const pago = JSON.parse(fila.dataset.pago);
            const isChecked = event.target.checked;
            marcarPagoComoPagado(pago, isChecked);
        }
    });
});

function guardarPago(pago) {
    let pagos = JSON.parse(localStorage.getItem("pagos")) || [];
    pagos.push(pago);
    localStorage.setItem("pagos", JSON.stringify(pagos));
    loadPayments();
    actualizarTotalPagos();
}

function loadPayments() {
    const cuerpoTablaPagos = document.querySelector("#listaPagos");
    cuerpoTablaPagos.innerHTML = "";
    let pagos = JSON.parse(localStorage.getItem("pagos")) || [];
    pagos.sort((a, b) => a.dia - b.dia); // Ordenar pagos por día de vencimiento
    
    // Agregar los datos de los pagos a la lista:
    pagos.forEach(function(pago, index) { // Añadir el parámetro 'index' al callback de la función forEach
        const fila = document.createElement("div");

        // Botón para eliminar pago:
        const botonEliminar = document.createElement("button");
        botonEliminar.className = "delete-button";
        botonEliminar.style.marginRight = "10px";
        
        // Icono de eliminación:
        const iconoEliminar = document.createElement("img");
        iconoEliminar.src = "svg/iconX.svg";
        iconoEliminar.alt = "Eliminar pago";
        iconoEliminar.className = "icono-eliminar";
        
        // Añadir evento click al botón eliminar:
        botonEliminar.addEventListener("click", function(event) {
            const fila = event.target.closest("div");
            const pago = fila.dataset.pago; // Obtener el objeto del pago asociado con la fila
            eliminarPago(pago);
        });
        
        // Descripción del pago:
        const descripcionPago = document.createElement("span");
        descripcionPago.textContent = pago.nombre;
        descripcionPago.style.marginRight = "5px";

        // Día de vencimiento:
        const diaVencimiento = document.createElement("span");
        diaVencimiento.textContent = ` vence el día ${pago.dia}`;
        diaVencimiento.style.marginRight = "10px"; // Añadir margen derecho para separar el día del monto del pago

        // Monto del pago:
        const montoPago = document.createElement("span");
        montoPago.textContent = `| Valor: $${parseFloat(pago.monto).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
        montoPago.style.marginRight = "10px"; // Añadir margen derecho para separar el monto del checkbox

        // Checkbox para marcar como pagado:
        const checkboxPagado = document.createElement("input");
        checkboxPagado.type = "checkbox";
        checkboxPagado.className = "check-pago";
        checkboxPagado.checked = pago.pagado; // Marcar el checkbox si el pago está pagado

        // Asociar el objeto de pago con la fila:
        fila.dataset.pago = JSON.stringify(pago);

        // Agregar elementos a la fila:
        botonEliminar.appendChild(iconoEliminar);
        fila.appendChild(botonEliminar);
        fila.appendChild(descripcionPago);
        fila.appendChild(diaVencimiento);
        fila.appendChild(montoPago);
        fila.appendChild(checkboxPagado);
        
        cuerpoTablaPagos.appendChild(fila);
    });
}

function eliminarPago(pago) {
    let pagos = JSON.parse(localStorage.getItem("pagos")) || [];
    // Encontrar y eliminar el pago por su descripción
    pagos = pagos.filter(item => JSON.stringify(item) !== pago);
    localStorage.setItem("pagos", JSON.stringify(pagos));
    loadPayments();
    actualizarTotalPagos();
}

function marcarPagoComoPagado(pago, isChecked) {
    let pagos = JSON.parse(localStorage.getItem("pagos")) || [];
    // Encontrar el pago y actualizar su estado a "pagado"
    pagos = pagos.map(item => {
        if (JSON.stringify(item) === JSON.stringify(pago)) {
            item.pagado = isChecked; // Establecer el estado de pagado según el estado del checkbox
            if (isChecked) {
                item.montoOriginal = item.monto; // Guardar el monto original antes de cambiarlo
                item.monto = "0.00"; // Si se marca como pagado, llevar el monto a cero
            } else {
                item.monto = item.montoOriginal; // Restaurar el monto original al desmarcarlo
            }
        }
        return item;
    });
    localStorage.setItem("pagos", JSON.stringify(pagos));
    loadPayments();
    actualizarTotalPagos();
}

function mostrarNotificacion() {
    let pagos = JSON.parse(localStorage.getItem("pagos")) || [];
    if (pagos.length === 0) {
        Toastify({
            text: "Aún no hay pagos registrados.",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            backgroundColor: "#333",
            stopOnFocus: true
        }).showToast();
    } else {
        const pagoMasCercano = pagos.reduce((prev, curr) => (getDiasHastaVencimiento(curr.dia) < getDiasHastaVencimiento(prev.dia) ? curr : prev));
        const diasHastaVencimiento = getDiasHastaVencimiento(pagoMasCercano.dia);
        Toastify({
            text: `Restan ${diasHastaVencimiento} días para el próximo vencimiento.`,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            backgroundColor: "#4caf50",
            stopOnFocus: true
        }).showToast();
    }
}

function getDiasHastaVencimiento(diaPago) {
    const hoy = DateTime.local().day;
    let diasHastaVencimiento = diaPago - hoy;
    if (diasHastaVencimiento <= 0) {
        diasHastaVencimiento += 31; // Asumimos que el mes tiene 31 días
    }
    return diasHastaVencimiento;
}

function displayCurrentDate() {
    const currentDateElement = document.querySelector("#currentDate");
    if (currentDateElement) {
        const currentDate = DateTime.local().toLocaleString({
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        currentDateElement.textContent = `Fecha actual: ${currentDate}`;
    }
    else {
        console.error("Elemento #currentDate no encontrado en el DOM.");
    }
}

function actualizarTotalPagos() {
    let totalPagos = 0;
    let pagos = JSON.parse(localStorage.getItem("pagos")) || [];
    pagos.forEach(function(pago) {
        totalPagos += parseFloat(pago.monto);
    });
    const cantidadTotalPagos = document.querySelector("#totalPagos");
    if (cantidadTotalPagos) {
        cantidadTotalPagos.textContent = `Total a pagar en el mes: $${totalPagos.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
        cantidadTotalPagos.style.textAlign = "right";
    }
    else {
        console.error("Elemento #totalPagos no encontrado en el DOM.");
    }
}