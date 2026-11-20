// Devuelve el nivel de dificultad actual, de 0 a NIVEL_MAXIMO.
function nivelDificultad() {
  return Math.min(NIVEL_MAXIMO, Math.floor(tiempoJugado / DURACION_NIVEL));
}

function huecoActual() {
  return Math.max(HUECO_MINIMO, HUECO_INICIAL - nivelDificultad() * HUECO_PASO);
}

function separacionActual() {
  return Math.max(
    SEPARACION_MINIMA,
    SEPARACION_INICIAL - nivelDificultad() * SEPARACION_PASO
  ) * separacionDificultad;
}

function generarSeparacionSiguiente() {
  const separacionBase = separacionActual();
  const variacion = separacionBase * VARIACION_SEPARACION;
  return separacionBase - variacion + Math.random() * variacion * 2;
}

function crearTuberia() {
  const altoHueco = huecoActual();
  const altoJugable = ALTO_ESCENA - ALTO_PISO;
  const minHueco = MARGEN_TUBO;
  const maxHueco = altoJugable - MARGEN_TUBO - altoHueco;
  const huecoY = minHueco + Math.random() * Math.max(0, maxHueco - minHueco);

  const el = document.createElement('div');
  el.className = 'tuberia';

  const arriba = document.createElement('div');
  arriba.className = 'tubo tubo-arriba';
  arriba.style.height = `${huecoY}px`;

  const abajo = document.createElement('div');
  abajo.className = 'tubo tubo-abajo';
  abajo.style.top = `${huecoY + altoHueco}px`;

  el.append(arriba, abajo);
  contenedorTuberias.appendChild(el);

  tuberias.push({
    x: ANCHO_ESCENA,
    huecoY,
    altoHueco,
    el,
    pasada: false,
    colisionada: false
  });
}

function actualizarTuberias(dt) {
  distanciaDesdeUltima += velocidadActual() * dt;
  if (
    distanciaDesdeUltima >= separacionSiguiente &&
    hayEspacioParaNuevaTuberia()
  ) {
    distanciaDesdeUltima = 0;
    crearTuberia();
    separacionSiguiente = generarSeparacionSiguiente();
  }

  for (const t of tuberias) {
    const bordeIzquierdoHitbox = nave.x + HITBOX_NAVE.x;

    t.x -= velocidadActual() * dt;

    if (
      !t.colisionada &&
      !t.pasada &&
      t.x + ANCHO_TUBO <= bordeIzquierdoHitbox
    ) {
      t.pasada = true;

      const centroHitboxY = nave.y + HITBOX_NAVE.y + HITBOX_NAVE.alto / 2;
      if (
        centroHitboxY > t.huecoY &&
        centroHitboxY < t.huecoY + t.altoHueco
      ) {
        puntaje++;
      }
    }

    if (
      !t.colisionada &&
      Math.abs(t.x - nave.x) < ANCHO_TUBO + 128 &&
      colisionaConTuberia(t)
    ) {
      t.colisionada = true;
      chocar();
      break;
    }
  }

  for (let i = tuberias.length - 1; i >= 0; i--) {
    if (tuberias[i].x + ANCHO_TUBO < 0) {
      tuberias[i].el.remove();
      tuberias.splice(i, 1);
    }
  }
}

function colisionaConTuberia(t) {
  const x1 = nave.x + HITBOX_NAVE.x;
  const y1 = nave.y + HITBOX_NAVE.y;
  const x2 = x1 + HITBOX_NAVE.ancho;
  const y2 = y1 + HITBOX_NAVE.alto;

  const rects = [
    { x: t.x, y: 0, w: ANCHO_TUBO, h: t.huecoY },
    {
      x: t.x,
      y: t.huecoY + t.altoHueco,
      w: ANCHO_TUBO,
      h: ALTO_ESCENA
    }
  ];

  return rects.some((r) =>
    x1 < r.x + r.w &&
    x2 > r.x &&
    y1 < r.y + r.h &&
    y2 > r.y
  );
}
