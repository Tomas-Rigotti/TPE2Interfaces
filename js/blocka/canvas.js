const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let imagenOriginal = null;
let imagenFiltrada = null;

function pixelsTotalmenteVacios(imageData) {
    const { data, width, height } = imageData;
    const muestras = 16;

    for (let i = 0; i < muestras; i++) {
        const x = Math.floor((width / muestras) * i);
        const y = Math.floor(height / 2);
        if (data[(x + y * width) * 4 + 3] !== 0) return false;
    }

    return true;
}

const LADO_CANVAS = 720;

function resolverLayout(cantidadPiezas) {
    const total = Math.max(1, Math.floor(cantidadPiezas) || 1);
    let mejor = null;

    for (let columnas = 2; columnas <= total; columnas++) {
        if (total % columnas !== 0) continue;

        const filas = total / columnas;
        if (filas < 2 || columnas < filas) continue;

        const desvio = Math.abs(columnas / filas - 1);
        if (!mejor || desvio < mejor.desvio) {
            mejor = { columnas, filas, desvio };
        }
    }

    return mejor
        ? { columnas: mejor.columnas, filas: mejor.filas }
        : { columnas: 1, filas: total };
}

function resolverResolucionCanvas(cantidadPiezas) {
    const { columnas, filas } = resolverLayout(cantidadPiezas);
    const lado = Math.floor(LADO_CANVAS / columnas) * columnas;

    return {
        ancho: lado,
        alto: lado,
        columnas,
        filas
    };
}

function indicePiezaDesdeClick(canvasElem, evento, cantidadPiezas) {
    const rect = canvasElem.getBoundingClientRect();
    const clickX = (evento.clientX - rect.left) * (canvasElem.width / rect.width);
    const clickY = (evento.clientY - rect.top) * (canvasElem.height / rect.height);

    const { columnas, filas } = resolverLayout(cantidadPiezas);
    const anchoPieza = canvasElem.width / columnas;
    const altoPieza = canvasElem.height / filas;

    const columna = Math.min(columnas - 1, Math.floor(clickX / anchoPieza));
    const fila = Math.min(filas - 1, Math.floor(clickY / altoPieza));

    return fila * columnas + columna;
}

function prepararNivel(imgSource, filtro, cantidadPiezas) {
    const { ancho: width, alto: height } = resolverResolucionCanvas(cantidadPiezas);

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.drawImage(imgSource, 0, 0, width, height);

    let original;
    try {
        original = offscreenCtx.getImageData(0, 0, width, height);
    } catch (error) {
        console.error('No se pudieron leer los píxeles de la imagen.', error);
        manejarErrorLienzo();
        return false;
    }

    if (pixelsTotalmenteVacios(original)) {
        console.warn('La imagen llegó sin píxeles visibles (posible origen bloqueado).');
        manejarErrorLienzo();
        return false;
    }

    const aplicarFiltro = crearAplicadorFiltro(filtro);
    const filtrada = { data: new Uint8ClampedArray(original.data.length), width, height };

    for (let indice = 0; indice < original.data.length; indice += 4) {
        const color = aplicarFiltro(
            original.data[indice],
            original.data[indice + 1],
            original.data[indice + 2],
            original.data,
            indice,
            width,
            height
        );

        filtrada.data[indice] = color.r;
        filtrada.data[indice + 1] = color.g;
        filtrada.data[indice + 2] = color.b;
        filtrada.data[indice + 3] = original.data[indice + 3];
    }

    imagenOriginal = original;
    imagenFiltrada = filtrada;

    return true;
}

function descartarNivel() {
    imagenOriginal = null;
    imagenFiltrada = null;
}

function renderizarImagen(piezasRotaciones, cantidadPiezas, revelar = false) {
    const { ancho: width, alto: height, columnas, filas } = resolverResolucionCanvas(cantidadPiezas);
    const celdaW = width / columnas;
    const celdaH = height / filas;

    const fuente = revelar ? imagenOriginal : imagenFiltrada;

    if (!fuente) {
        console.warn('El nivel todav�a no se prepar�: no hay imagen para dibujar.');
        return;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    const destImageData = ctx.createImageData(width, height);
    const destino = destImageData.data;
    const origen = fuente.data;

    for (let indice = 0; indice < columnas * filas; indice++) {
        const angulo = piezasRotaciones[indice] ?? 0;

        const offsetX = (indice % columnas) * celdaW;
        const offsetY = Math.floor(indice / columnas) * celdaH;

        for (let y = 0; y < celdaH; y++) {
            for (let x = 0; x < celdaW; x++) {

                const srcIndex = (offsetX + x + (offsetY + y) * width) * 4;

                let rotX = x;
                let rotY = y;

                if (angulo === 90) {
                    //La nueva coordenada vertical usa la horizontal original,
                    //la nueva horizontal es la inversa de la vertical original, pixel en (2,0) pasa a (2,2)
                    rotX = celdaW - 1 - y;
                    rotY = x;
                    
                } else if (angulo === 180) {
                    //Invierte las coordenadas, pixel en (2,0) pasa a (0,2)
                    rotX = celdaW - 1 - x;
                    rotY = celdaH - 1 - y;
                } else if (angulo === 270) {
                    //Intercambia las coordenadas e invierte la posición horizontal original para calcular la nueva
                    //coordenada vertical, pixel en (2,0) pasa a (0,0)
                    rotX = y;
                    rotY = celdaH - 1 - x;
                }

                const destIndex = (offsetX + rotX + (offsetY + rotY) * width) * 4;

                destino[destIndex] = origen[srcIndex];
                destino[destIndex + 1] = origen[srcIndex + 1];
                destino[destIndex + 2] = origen[srcIndex + 2];
                destino[destIndex + 3] = origen[srcIndex + 3];
            }
        }
    }

    ctx.putImageData(destImageData, 0, 0);
}