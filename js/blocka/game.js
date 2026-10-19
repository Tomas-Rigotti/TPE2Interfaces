const NIVELES = [
    {nivel: 1, tiempoMaximo: null},
    {nivel: 2, tiempoMaximo: null},
    {nivel: 3, tiempoMaximo: null},
    {nivel: 4, tiempoMaximo: 30},
    {nivel: 5, tiempoMaximo: 40}
];

const OPCIONES_PIEZAS = [4, 9, 16];
const PIEZAS_POR_DEFECTO = 4;

const SEGUNDOS_URGENCIA = 10;
const INTERVALO_CRONOMETRO_MS = 250;

const DURACION_REVELADO_NIVEL = 1500;

const ANCHO_MAXIMO_CANVAS = 1000;
const LADO_MINIMO_CANVAS = 300;
const MARGEN_INFERIOR_CANVAS = 24;

let imagenCargada = null;
let imagenesDisponibles = [...IMAGENES]; // Copia del banco original
let versionNivel = 0;

const estadoJuego = {
    nivelActualIndex: 0,
    imagenSeleccionada: null,
    piezas: [],
    piezasFijas: [],
    iniciado: false,
    jugando: false,
    tiempoNivel: 0,
    marcaTiempoInicio: null,
    timerInterval: null,
    timeoutResultado: null,
    seleccionandoImagen: false,
    nivelCompletado: false,
    nivelFallado: false,
    errorLienzo: false,
    cantidadPiezasElegida: null,
    filtroActual: null
};

function getNivelActual() {
    return NIVELES[estadoJuego.nivelActualIndex];
}

function getTiempoMaximoNivelActual() {
    const configNivel = getNivelActual();
    const limite = configNivel && configNivel.tiempoMaximo;

    return typeof limite === 'number' && limite > 0 ? limite : null;
}

function hayNivelEnCurso() {
    return !estadoJuego.seleccionandoImagen
        && !estadoJuego.nivelCompletado
        && !estadoJuego.nivelFallado
        && !estadoJuego.errorLienzo
        && imagenCargada !== null;
}

function getCantidadPiezas() {
    return OPCIONES_PIEZAS.includes(estadoJuego.cantidadPiezasElegida)
        ? estadoJuego.cantidadPiezasElegida
        : PIEZAS_POR_DEFECTO;
}

function elegirPiezas(cantidad) {
    if (!OPCIONES_PIEZAS.includes(cantidad)) return;
    if (!estadoJuego.iniciado) return;

    estadoJuego.cantidadPiezasElegida = cantidad;

    document.getElementById('selector-piezas').hidden = true;
    document.querySelector('.hud-panel').hidden = false;
    iniciarNivel(1, true);
}

function manejarErrorLienzo() {
    if (estadoJuego.errorLienzo) return;

    estadoJuego.errorLienzo = true;
    estadoJuego.seleccionandoImagen = false;
    detenerTemporizador();
    cancelarTimeoutResultado();

    canvasElem.hidden = true;
    document.getElementById('selector-imagen').hidden = true;
    mostrarAvisoDeServidor();
}

function mostrarAvisoDeServidor() {
    document.getElementById('resultado-titulo').textContent = 'No se pudieron leer los píxeles de la imagen';
    document.getElementById('resultado-detalle').textContent =
        'El navegador bloqueó la lectura de los píxeles y el juego no puede rotar las piezas. ' +
        'Las imágenes viajan dentro del propio juego, así que no hace falta abrirlo desde un servidor. ' +
        'Lo más probable es que una de las imágenes esté dañada o incompleta. ' +
        'Mirá la consola del navegador (F12) para ver el detalle del error.';
    document.getElementById('btn-siguiente-nivel').hidden = true;
    document.getElementById('btn-reintentar-nivel').hidden = true;
    document.getElementById('resultado-nivel').hidden = false;
}

function aplicarTamanoCanvas() {
    const wrapper = document.querySelector('.canvas-wrapper');
    const juego = document.querySelector('.juego');
    if (!wrapper || !juego) return;

    const posicionEnDocumento = juego.getBoundingClientRect().top + window.scrollY;
    const altoDisponible = window.innerHeight - posicionEnDocumento - MARGEN_INFERIOR_CANVAS;

    const lado = Math.max(
        LADO_MINIMO_CANVAS,
        Math.min(ANCHO_MAXIMO_CANVAS, juego.clientWidth, altoDisponible)
    );

    wrapper.style.width = `${lado}px`;
}

function getImagenAleatoria() {
    if (imagenesDisponibles.length === 0) {
        imagenesDisponibles = [...IMAGENES];
    }

    const indiceRandom = Math.floor(Math.random() * imagenesDisponibles.length);
    
    const imagenElegida = imagenesDisponibles.splice(indiceRandom, 1)[0];

    return imagenElegida;
}

function sortearFiltro(filtroPrevio) {
    const candidatos = FILTROS_DISPONIBLES.filter(filtro => filtro !== filtroPrevio);

    return candidatos[Math.floor(Math.random() * candidatos.length)];
}

function empezarJuego() {
    if (estadoJuego.iniciado) return;

    estadoJuego.iniciado = true;
    document.getElementById('pantalla-inicio').hidden = true;
    mostrarSelectorPiezas();
}

function mostrarSelectorPiezas() {
    const contenedor = document.getElementById('botones-piezas');
    if (!contenedor) return;

    contenedor.replaceChildren(...OPCIONES_PIEZAS.map(cantidad => {
        const { columnas, filas } = resolverLayout(cantidad);
        const boton = document.createElement('button');

        boton.type = 'button';
        boton.className = 'boton-piezas';
        boton.setAttribute('data-piezas', String(cantidad));
        boton.setAttribute('aria-label', `Jugar con ${cantidad} piezas`);
        boton.innerHTML =
            `<strong class="boton-piezas-cantidad">${cantidad}</strong>` +
            `<span class="boton-piezas-layout">${columnas}×${filas}</span>` +
            `<span class="boton-piezas-dificultad">${dificultadDe(cantidad)}</span>`;
        boton.onclick = () => elegirPiezas(cantidad);

        return boton;
    }));

    document.getElementById('selector-piezas').hidden = false;
    contenedor.querySelector('button')?.focus();
}

const ETIQUETAS_DIFICULTAD = ['Fácil', 'Media', 'Difícil'];

function dificultadDe(cantidad) {
    const indice = OPCIONES_PIEZAS.indexOf(cantidad);

    return ETIQUETAS_DIFICULTAD[indice] ?? `Nivel ${indice + 1}`;
}

function iniciarNivel(nivel, iniciarAutomaticamente = false) {
    const versionActual = ++versionNivel;
    const configNivel = NIVELES.find(n => n.nivel === nivel) || NIVELES[0];

    detenerTemporizador();
    cancelarTimeoutResultado();
    document.getElementById('resultado-nivel').hidden = true;
    estadoJuego.nivelActualIndex = configNivel.nivel - 1;
    estadoJuego.imagenSeleccionada = getImagenAleatoria();
    estadoJuego.filtroActual = sortearFiltro(estadoJuego.filtroActual);
    estadoJuego.tiempoNivel = 0;
    estadoJuego.seleccionandoImagen = true;
    estadoJuego.nivelCompletado = false;
    estadoJuego.nivelFallado = false;
    estadoJuego.errorLienzo = false;
    imagenCargada = null;
    actualizarHUD();

    const totalPiezas = getCantidadPiezas();
    estadoJuego.piezas = generarRotacionInicial(totalPiezas);
    estadoJuego.piezasFijas = Array(totalPiezas).fill(false);

    selectorImagen.mostrar(IMAGENES, estadoJuego.imagenSeleccionada, (rutaImagen) => {
        if (versionActual !== versionNivel) return;

        imagenCargada = new Image();
        imagenCargada.onload = () => {
            if (versionActual !== versionNivel) return;

            if (!prepararNivel(imagenCargada, estadoJuego.filtroActual, totalPiezas)) return;

            renderizarImagen(estadoJuego.piezas, totalPiezas);
            selectorImagen.ocultar();
            estadoJuego.seleccionandoImagen = false;
            if (iniciarAutomaticamente) comenzarTemporizador();
        };
        imagenCargada.onerror = () => {
            if (versionActual === versionNivel) {
                selectorImagen.mostrarError('No se pudo cargar la imagen seleccionada.', reintentarNivel);
            }
        };
        imagenCargada.src = rutaImagen;
    }, reintentarNivel);

    console.log(`--- INICIANDO NIVEL ${configNivel.nivel} (filtro: ${estadoJuego.filtroActual}) ---`);
}

function reintentarNivel() {
    if (!estadoJuego.iniciado) return;
    iniciarNivel(estadoJuego.nivelActualIndex + 1, true);
}

const canvasElem = document.getElementById('game-canvas');

canvasElem.addEventListener('contextmenu', (e) => e.preventDefault());

canvasElem.addEventListener('mousedown', (e) => {
    if (!hayNivelEnCurso()) return;

    const cuadrante = indicePiezaDesdeClick(canvasElem, e, getCantidadPiezas());

    if (estadoJuego.piezasFijas[cuadrante]) return;

    if (!estadoJuego.jugando) comenzarTemporizador();

    if (e.button === 0) { 
        estadoJuego.piezas[cuadrante] = (estadoJuego.piezas[cuadrante] - 90 + 360) % 360;
    } else if (e.button === 2) { 
        estadoJuego.piezas[cuadrante] = (estadoJuego.piezas[cuadrante] + 90) % 360;
    }

    renderizarImagen(estadoJuego.piezas, getCantidadPiezas());

    verificarVictoria();
});

function generarRotacionInicial(cantidad) {
    const angulos = [90,180,270];
    const rotaciones = [];

    for (let i = 0; i < cantidad; i++) {
        const anguloRandom = angulos[Math.floor(Math.random() * angulos.length)];
        rotaciones.push(anguloRandom);
    }

    return rotaciones;
}

function comenzarTemporizador() {
    if (estadoJuego.jugando || !hayNivelEnCurso()) return;

    estadoJuego.jugando = true;
    estadoJuego.marcaTiempoInicio = Date.now();
    estadoJuego.timerInterval = setInterval(avanzarCronometro, INTERVALO_CRONOMETRO_MS);
    avanzarCronometro();
}

function avanzarCronometro() {
    if (!estadoJuego.jugando || estadoJuego.marcaTiempoInicio === null) return;

    const limite = getTiempoMaximoNivelActual();
    const transcurrido = Math.floor((Date.now() - estadoJuego.marcaTiempoInicio) / 1000);

    sincronizarTiempo();

    if (limite !== null && transcurrido >= limite) {
        perderNivel();
    }
}

function sincronizarTiempo() {
    if (estadoJuego.marcaTiempoInicio !== null) {
        const limite = getTiempoMaximoNivelActual();
        const transcurrido = Math.floor((Date.now() - estadoJuego.marcaTiempoInicio) / 1000);

        estadoJuego.tiempoNivel = limite === null
            ? transcurrido
            : Math.min(transcurrido, limite);
    }

    actualizarHUD();
}

function aplicarPenalizacionAyuda() {
    if (estadoJuego.marcaTiempoInicio !== null) {
        estadoJuego.marcaTiempoInicio -= 5000;
    }
}

function detenerTemporizador() {
    estadoJuego.jugando = false;
    estadoJuego.marcaTiempoInicio = null;
    if (estadoJuego.timerInterval !== null) {
        clearInterval(estadoJuego.timerInterval);
        estadoJuego.timerInterval = null;
    }
}

function cancelarTimeoutResultado() {
    if (estadoJuego.timeoutResultado !== null) {
        clearTimeout(estadoJuego.timeoutResultado);
        estadoJuego.timeoutResultado = null;
    }
}

function actualizarHUD() {
    const levelElem = document.getElementById('current-level');
    if (levelElem) {
        levelElem.textContent = String(estadoJuego.nivelActualIndex + 1);
    }

    const timerElem = document.getElementById('timer');
    if(timerElem){
        const limite = getTiempoMaximoNivelActual();

        if (limite === null) {
            timerElem.textContent = `Tiempo: ${estadoJuego.tiempoNivel} segundos`;
            timerElem.classList.remove('timer--urgente');
        } else {
            const restante = Math.max(0, limite - estadoJuego.tiempoNivel);
            timerElem.textContent = `Tiempo: ${estadoJuego.tiempoNivel}s · Quedan: ${restante}s`;
            timerElem.classList.toggle('timer--urgente', restante <= SEGUNDOS_URGENCIA);
        }
    }

    const recordElem = document.getElementById('record');
    if (recordElem) {
        const nivelActual = estadoJuego.nivelActualIndex + 1;
        const record = obtenerRecord(nivelActual);
        const limite = getTiempoMaximoNivelActual();
        const recordMostrable = record !== null
            && (limite === null || record < limite);

        recordElem.textContent = recordMostrable
            ? `Récord del nivel: ${record} segundos`
            : 'Récord del nivel: --';
    }
}

function registrarRecord() {
    const nivelActual = estadoJuego.nivelActualIndex + 1;
    const nuevoRecord = registrarRecordNivel(nivelActual, estadoJuego.tiempoNivel);

    actualizarHUD();

    return nuevoRecord;
}

function verificarVictoria() {
    if (estadoJuego.piezas.length === 0) return;

    const estaResuelto = estadoJuego.piezas.every(angulo => angulo === 0);

    if (estaResuelto) {
        if (estadoJuego.nivelCompletado || estadoJuego.nivelFallado) return;

        estadoJuego.nivelCompletado = true;
        detenerTemporizador();
        const nuevoRecord = registrarRecord();

        renderizarImagen(estadoJuego.piezas, getCantidadPiezas(), true);

        mostrarResultadoNivel({ nivelPerdido: false, nuevoRecord });
    }
}

function perderNivel() {
    if (estadoJuego.nivelCompletado || estadoJuego.nivelFallado) return;

    estadoJuego.nivelFallado = true;
    detenerTemporizador();

    renderizarImagen(estadoJuego.piezas.map(() => 0), getCantidadPiezas(), true);

    mostrarResultadoNivel({ nivelPerdido: true, nuevoRecord: false });
}

function mostrarResultadoNivel({ nivelPerdido, nuevoRecord }) {
    estadoJuego.timeoutResultado = setTimeout(() => {
        estadoJuego.timeoutResultado = null;

        const nivelActual = estadoJuego.nivelActualIndex + 1;
        const limite = getTiempoMaximoNivelActual();
        const resultado = document.getElementById('resultado-nivel');
        const titulo = document.getElementById('resultado-titulo');
        const detalle = document.getElementById('resultado-detalle');
        const botonSiguiente = document.getElementById('btn-siguiente-nivel');
        const botonReintentar = document.getElementById('btn-reintentar-nivel');

        canvasElem.hidden = true;

        if (nivelPerdido) {
            titulo.textContent = `¡Se te acabó el tiempo en el nivel ${nivelActual}!`;
            detalle.textContent = `Tenías ${limite} segundos para formar la imagen y te quedaste sin tiempo. Podés reintentar el nivel.`;
            botonSiguiente.hidden = true;
            botonReintentar.hidden = false;
        } else {
            const record = obtenerRecord(nivelActual);
            const recordMostrable = record !== null
                && (limite === null || record < limite);

            let mensajeRecord = '';
            if (recordMostrable) {
                mensajeRecord = nuevoRecord
                    ? ` ¡Nuevo récord para el nivel ${nivelActual}: ${estadoJuego.tiempoNivel} segundos!`
                    : ` Récord del nivel: ${record} segundos.`;
            }

            titulo.textContent = nivelActual < NIVELES.length
                ? `Nivel ${nivelActual} completado`
                : '¡Completaste todos los niveles!';
            detalle.textContent = `Tiempo del nivel: ${estadoJuego.tiempoNivel} segundos.${mensajeRecord}`;
            botonSiguiente.hidden = nivelActual >= NIVELES.length;
            botonReintentar.hidden = true;
        }

        resultado.hidden = false;
    }, DURACION_REVELADO_NIVEL);
}

function siguienteNivel() {
    if (estadoJuego.nivelFallado || !estadoJuego.nivelCompletado || estadoJuego.nivelActualIndex >= NIVELES.length - 1) return;

    const proximoNivel = estadoJuego.nivelActualIndex + 2;

    iniciarNivel(proximoNivel, true);
}

function volverAlPrincipio() {
    detenerTemporizador();
    cancelarTimeoutResultado();
    versionNivel++;
    estadoJuego.nivelActualIndex = 0;
    estadoJuego.imagenSeleccionada = null;
    estadoJuego.piezas = [];
    estadoJuego.piezasFijas = [];
    estadoJuego.iniciado = false;
    estadoJuego.seleccionandoImagen = false;
    estadoJuego.nivelCompletado = false;
    estadoJuego.nivelFallado = false;
    estadoJuego.errorLienzo = false;
    estadoJuego.tiempoNivel = 0;
    estadoJuego.cantidadPiezasElegida = null;
    estadoJuego.filtroActual = null;
    imagenCargada = null;
    imagenesDisponibles = [...IMAGENES];
    descartarNivel();

    document.getElementById('pantalla-inicio').hidden = false;
    document.querySelector('.hud-panel').hidden = true;
    document.getElementById('selector-imagen').hidden = true;
    document.getElementById('selector-piezas').hidden = true;
    document.getElementById('resultado-nivel').hidden = true;
    document.getElementById('btn-reintentar-nivel').hidden = true;
    canvasElem.hidden = true;
    actualizarHUD();
}

function darAyuda() {
    if (!hayNivelEnCurso()) return;

    if (!estadoJuego.jugando) comenzarTemporizador();
    if (!estadoJuego.jugando) return;

    const piezasSinResolver = [];
    estadoJuego.piezas.forEach((angulo, index) => {
        if (angulo !== 0 && !estadoJuego.piezasFijas[index]) {
            piezasSinResolver.push(index);
        }
    });

    if (piezasSinResolver.length > 0) {
        const indiceRandom = Math.floor(Math.random() * piezasSinResolver.length);
        const piezaElegida = piezasSinResolver[indiceRandom];

        estadoJuego.piezas[piezaElegida] = 0;
        estadoJuego.piezasFijas[piezaElegida] = true;

        aplicarPenalizacionAyuda();

        avanzarCronometro();

        verificarVictoria();

        if (!estadoJuego.nivelCompletado && !estadoJuego.nivelFallado) {
            renderizarImagen(estadoJuego.piezas, getCantidadPiezas());
        }
    }
}

function iniciarAlCargar() {
    aplicarTamanoCanvas();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarAlCargar);
} else {
    iniciarAlCargar();
}

window.addEventListener('load', aplicarTamanoCanvas);
window.addEventListener('resize', aplicarTamanoCanvas);
