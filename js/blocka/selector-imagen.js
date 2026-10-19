(() => {
    const VUELTAS = 4;
    const duracionBarrido = 2000;
    const crecimiento = 0.04;
    const RESPETAR_MOVIMIENTO_REDUCIDO = false;

    let timeoutSorteo = null;
    let versionSorteo = 0;

    function ocultarBotonReintentar(boton) {
        if (!boton) return;
        boton.hidden = true;
        boton.onclick = null;
    }

    function mostrarBotonReintentar(boton, alReintentar) {
        if (!boton || !alReintentar) return;
        boton.onclick = alReintentar;
        boton.hidden = false;
    }

    function cargarImagen(ruta) {
        return new Promise((resolver) => {
            const imagen = new Image();
            imagen.onload = () => resolver(imagen);
            imagen.onerror = () => resolver(null);
            imagen.src = ruta;
        });
    }

    function mostrar(imagenes, imagenElegida, alSeleccionar, alReintentar) {
        const selector = document.getElementById('selector-imagen');
        const contenedorMiniaturas = document.getElementById('miniaturas-imagenes');
        const estadoSorteo = document.getElementById('estado-sorteo');
        const botonReintentar = document.getElementById('btn-reintentar-imagen');
        const versionActual = ++versionSorteo;
        const indiceElegido = imagenes.indexOf(imagenElegida);

        clearTimeout(timeoutSorteo);

        if (indiceElegido < 0) {
            estadoSorteo.textContent = 'No se encontró la imagen seleccionada.';
            selector.hidden = false;
            mostrarBotonReintentar(botonReintentar, alReintentar);
            return;
        }

        selector.hidden = false;
        document.getElementById('game-canvas').hidden = true;
        estadoSorteo.textContent = 'Cargando imágenes...';
        ocultarBotonReintentar(botonReintentar);

        Promise.all(imagenes.map(cargarImagen)).then((imagenesCargadas) => {
            if (versionActual !== versionSorteo) return;
            if (!imagenesCargadas[indiceElegido]) {
                mostrarError('No se pudo cargar la imagen seleccionada.', alReintentar);
                return;
            }

            const fragmento = document.createDocumentFragment();
            imagenesCargadas.forEach((imagen, indice) => {
                const miniatura = document.createElement('figure');
                miniatura.className = 'miniatura-imagen';
                miniatura.setAttribute('aria-label', `Imagen ${indice + 1}`);

                if (imagen) {
                    imagen.alt = `Miniatura ${indice + 1}`;
                    miniatura.append(imagen);
                } else {
                    miniatura.textContent = `Imagen ${indice + 1} no disponible`;
                }

                fragmento.append(miniatura);
            });

            const marcoSeleccion = document.createElement('div');
            marcoSeleccion.className = 'marco-seleccion';
            marcoSeleccion.setAttribute('aria-hidden', 'true');
            contenedorMiniaturas.replaceChildren(fragmento, marcoSeleccion);

            const miniaturas = [...contenedorMiniaturas.querySelectorAll('.miniatura-imagen')];
            const cantidadMiniaturas = miniaturas.length;
            const movimientoReducido = RESPETAR_MOVIMIENTO_REDUCIDO
                && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const indiceInicio = movimientoReducido
                ? indiceElegido
                : (indiceElegido + 1 + Math.floor(Math.random() * (cantidadMiniaturas - 1))) % cantidadMiniaturas;
            const ultimoPaso = movimientoReducido ? 0 : cantidadMiniaturas * VUELTAS;

            const pasosTemporizados = ultimoPaso;
            const sumaCrecimiento = pasosTemporizados > 0
                ? pasosTemporizados + crecimiento * (pasosTemporizados * (pasosTemporizados - 1)) / 2
                : 0;
            const pausaInicial = sumaCrecimiento > 0 ? duracionBarrido / sumaCrecimiento : 0;
            const incremento = pausaInicial * crecimiento;
            const duracionResultado = 2000;
            let paso = 0;

            function avanzarSorteo() {
                if (versionActual !== versionSorteo) return;

                const esUltimoPaso = paso === ultimoPaso;
                const indiceActivo = esUltimoPaso
                    ? indiceElegido
                    : (indiceInicio + paso) % cantidadMiniaturas;

                miniaturas.forEach((miniatura, indice) => {
                    const activa = indice === indiceActivo;
                    miniatura.classList.toggle('activa', activa);
                    miniatura.classList.toggle('seleccionada', activa && esUltimoPaso);
                    if (activa) miniatura.setAttribute('aria-current', 'true');
                    else miniatura.removeAttribute('aria-current');
                });

                const tamanoBase = miniaturas[indiceActivo].offsetWidth;
                const tamanoAlto = miniaturas[indiceActivo].offsetHeight;
                const rectContenedor = contenedorMiniaturas.getBoundingClientRect();
                const rectMiniatura = miniaturas[indiceActivo].getBoundingClientRect();
                const escala = esUltimoPaso ? 1.25 : 1.10;
                const centroMiniatura = {
                    x: rectMiniatura.left - rectContenedor.left + rectMiniatura.width / 2,
                    y: rectMiniatura.top - rectContenedor.top + rectMiniatura.height / 2
                };

                marcoSeleccion.style.width = `${tamanoBase}px`;
                marcoSeleccion.style.height = `${tamanoAlto}px`;
                marcoSeleccion.style.transform =
                    `translate(${centroMiniatura.x - tamanoBase / 2}px, ${centroMiniatura.y - tamanoAlto / 2}px) scale(${escala})`;

                if (esUltimoPaso) {
                    estadoSorteo.textContent = `Imagen ${indiceElegido + 1} seleccionada`;
                    timeoutSorteo = setTimeout(() => {
                        if (versionActual === versionSorteo) alSeleccionar(imagenElegida);
                    }, duracionResultado);
                    return;
                }

                paso++;
                timeoutSorteo = setTimeout(avanzarSorteo, pausaInicial + (paso - 1) * incremento);
            }

            avanzarSorteo();
        });
    }

    function ocultar() {
        document.getElementById('selector-imagen').hidden = true;
        document.getElementById('game-canvas').hidden = false;
    }

    function mostrarError(mensaje, alReintentar) {
        document.getElementById('estado-sorteo').textContent = mensaje;
        mostrarBotonReintentar(document.getElementById('btn-reintentar-imagen'), alReintentar);
    }

    window.selectorImagen = { mostrar, ocultar, mostrarError };
})();
