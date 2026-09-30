const productosEnCarrito = new Set();
const carruseles = Array.from(document.querySelectorAll(".carrusel"));
const controladoresCarrusel = new WeakMap();
const breakpointCarrusel = window.matchMedia("(min-width: 768px)");

carruseles.forEach(inicializarControlesCarrito);

function actualizarModoCarruseles(evento) {
    carruseles.forEach(function (carruselEl) {
        const limpiarCarrusel = controladoresCarrusel.get(carruselEl);

        if (evento.matches && !limpiarCarrusel) {
            const limpiar = inicializarCarruselDesktop(carruselEl);

            if (limpiar) {
                controladoresCarrusel.set(carruselEl, limpiar);
            }
        } else if (!evento.matches && limpiarCarrusel) {
            limpiarCarrusel();
            controladoresCarrusel.delete(carruselEl);
        }
    });
}

actualizarModoCarruseles(breakpointCarrusel);
breakpointCarrusel.addEventListener("change", actualizarModoCarruseles);

document.addEventListener("click", function (event) {
    const control = event.target.closest(".card-carrito[role='button']");

    if (control) {
        alternarCarrito(control);
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") {
        return;
    }

    const control = event.target.closest(".card-carrito[role='button']");

    if (control) {
        event.preventDefault();
        control.click();
    }
});

function inicializarControlesCarrito(carruselEl) {
    carruselEl.querySelectorAll(".card-carrito").forEach(function (control) {
        const card = control.closest(".card");
        const nombreProducto = card?.querySelector("h4")?.textContent.trim();

        if (!card || !nombreProducto) {
            return;
        }

        card.dataset.carritoKey = card.id || nombreProducto;
        control.setAttribute("role", "button");
        control.setAttribute("tabindex", "0");
        control.setAttribute("aria-pressed", "false");
        control.setAttribute("aria-label", "Agregar al carrito");
    });
}

function alternarCarrito(control) {
    const card = control.closest(".card");
    const claveProducto = card?.dataset.carritoKey;

    if (!claveProducto) {
        return;
    }

    const agregado = !productosEnCarrito.has(claveProducto);

    if (agregado) {
        productosEnCarrito.add(claveProducto);
    } else {
        productosEnCarrito.delete(claveProducto);
    }

    document.querySelectorAll(".card[data-carrito-key]").forEach(function (cardRelacionada) {
        if (cardRelacionada.dataset.carritoKey !== claveProducto) {
            return;
        }

        const controlRelacionado = cardRelacionada.querySelector(".card-carrito");
        const imagen = controlRelacionado?.querySelector("img");

        if (!controlRelacionado || !imagen) {
            return;
        }

        imagen.src = agregado
            ? "img/cards/carrito-agregado.svg"
            : "img/cards/carrito.svg";
        controlRelacionado.setAttribute("aria-pressed", String(agregado));
        controlRelacionado.setAttribute(
            "aria-label",
            agregado ? "Quitar del carrito" : "Agregar al carrito"
        );
    });
}

function obtenerIdYoutube(url) {
    try {
        return new URL(url).pathname.split("/").filter(Boolean).pop();
    } catch {
        return null;
    }
}

function crearClonParaLoop(elemento) {
    if (elemento.classList.contains("media-video")) {
        const idVideo = obtenerIdYoutube(elemento.src);
        const miniatura = document.createElement("img");
        miniatura.className = "media-imagen";
        miniatura.src = idVideo
            ? `https://img.youtube.com/vi/${idVideo}/hqdefault.jpg`
            : "";
        miniatura.alt = elemento.title || "";
        miniatura.setAttribute("aria-hidden", "true");
        return miniatura;
    }

    return elemento.cloneNode(true);
}

function inicializarCarruselDesktop(carruselEl) {
    const carrusel = carruselEl.querySelector(".carrusel-contenido");
    const anterior = carruselEl.querySelector(".carrusel-anterior");
    const siguiente = carruselEl.querySelector(".carrusel-siguiente");

    const indicador = carruselEl.nextElementSibling;

    if (!carrusel || !anterior || !siguiente || !indicador) {
        return;
    }

    const controladorEventos = new AbortController();

    const elementosOriginales = Array.from(carrusel.children);
    const cantidadElementos = elementosOriginales.length;

    const elementosPorMovimiento = 1;
    const cantidadPasos = cantidadElementos;

    for (let indice = 0; indice < cantidadPasos; indice++) {
        const punto = document.createElement("span");
        punto.className = "carrusel-punto";
        punto.setAttribute("aria-label", `Paso ${indice + 1}`);
        indicador.appendChild(punto);
    }

    const puntos = Array.from(indicador.children);

    let indiceActual = cantidadElementos;
    let progresoActual = 0;

    elementosOriginales.forEach(function (elemento) {
        carrusel.appendChild(crearClonParaLoop(elemento));
    });

    elementosOriginales.slice().reverse().forEach(function (elemento) {
        carrusel.prepend(crearClonParaLoop(elemento));
    });

    function obtenerPaso() {
        const estilos = getComputedStyle(carrusel);
        const separacion = parseFloat(estilos.gap) || 0;

        return carrusel.children[0].getBoundingClientRect().width + separacion;
    }

    function actualizarPosicion(sinTransicion = false) {
        if (sinTransicion) {
            carrusel.style.transition = "none";
        }

        carrusel.style.transform = `translateX(-${
            indiceActual * obtenerPaso()
        }px)`;

        if (sinTransicion) {
            void carrusel.offsetWidth;
            carrusel.style.transition = "";
        }

        actualizarIndicador();
    }

    function actualizarIndicador() {
        puntos.forEach(function (punto, indice) {
            punto.classList.toggle("activo", indice === progresoActual);
        });
        indicador.setAttribute(
            "aria-label",
            `Posición ${progresoActual + 1} de ${cantidadPasos}`
        );
    }

    function moverCarrusel(direccion) {
        indiceActual += direccion * elementosPorMovimiento;
        progresoActual =
            (progresoActual + direccion + cantidadPasos) % cantidadPasos;

        carrusel.classList.remove(
            "carrusel--moviendo-siguiente",
            "carrusel--moviendo-anterior"
        );
        void carrusel.offsetWidth;
        carrusel.classList.add(
            direccion > 0
                ? "carrusel--moviendo-siguiente"
                : "carrusel--moviendo-anterior"
        );

        actualizarPosicion();
    }

    siguiente.addEventListener("click", function () {
        moverCarrusel(1);
    }, { signal: controladorEventos.signal });

    anterior.addEventListener("click", function () {
        moverCarrusel(-1);
    }, { signal: controladorEventos.signal });

    carrusel.addEventListener("transitionend", function (evento) {
        if (evento.target !== carrusel || evento.propertyName !== "transform") {
            return;
        }

        while (indiceActual >= cantidadElementos * 2) {
            indiceActual -= cantidadElementos;
        }

        while (indiceActual < cantidadElementos) {
            indiceActual += cantidadElementos;
        }

        carrusel.classList.remove(
            "carrusel--moviendo-siguiente",
            "carrusel--moviendo-anterior"
        );
        actualizarPosicion(true);
    }, { signal: controladorEventos.signal });

    window.addEventListener("resize", function () {
        actualizarPosicion(true);
    }, { signal: controladorEventos.signal });

    actualizarPosicion(true);

    return function limpiarCarruselDesktop() {
        controladorEventos.abort();
        carrusel.replaceChildren(...elementosOriginales);
        carrusel.classList.remove(
            "carrusel--moviendo-siguiente",
            "carrusel--moviendo-anterior"
        );
        carrusel.style.removeProperty("transform");
        carrusel.style.removeProperty("transition");
        indicador.replaceChildren();
        indicador.setAttribute("aria-label", `Posición 1 de ${cantidadPasos}`);
    };
}