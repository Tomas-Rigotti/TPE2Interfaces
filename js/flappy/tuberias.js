// Devuelve el nivel de dificultad actual, de 0 a NIVEL_MAXIMO.
function nivelDificultad() {
  return Math.min(NIVEL_MAXIMO, Math.floor(tiempoJugado / DURACION_NIVEL));
}

//Calculo el hueco actual reduciendolo segun el nivel
function huecoActual() {
  return Math.max(HUECO_MINIMO, HUECO_INICIAL - nivelDificultad() * HUECO_PASO);
}

//Calcula la separacion horizontal actual entre las tuberias (se usa como base para generar la proxima)
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

  //Maximo y minimo vertical del hueco, respetando los margenes y la altura
  const minHueco = MARGEN_TUBO;
  const maxHueco = altoJugable - MARGEN_TUBO - altoHueco;

  let minY = minHueco;
  let maxY = maxHueco;

  // Si ya existe una tubería, limita el desplazamiento vertical
  // del nuevo hueco respecto del hueco anterior.
  if (tuberias.length > 0) {
    const ultimaTuberia = tuberias[tuberias.length - 1];

    //Posicion minima para el hueco, limitandola al margen superior
    minY = Math.max(
      minHueco,
      ultimaTuberia.huecoY - DESPLAZAMIENTO_MAXIMO_HUECO
    );

    //Posicion maxima para el hueco, limitandola al margen inferior 
    maxY = Math.min(
      maxHueco,
      ultimaTuberia.huecoY + DESPLAZAMIENTO_MAXIMO_HUECO
    );
  }

  // Genera una posición vertical aleatoria dentro del rango permitido.
  const huecoY = minY + Math.random() * (maxY - minY);

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
  //Uso la distancia de la ultima tuberia para crear la nueva si hay espacio y suficiente distancia entre si 
  distanciaDesdeUltima += velocidadActual() * dt;
  if (distanciaDesdeUltima >= separacionSiguiente && hayEspacioParaNuevaTuberia()) {
    distanciaDesdeUltima = 0;
    crearTuberia();
    separacionSiguiente = generarSeparacionSiguiente();
  }

  for (const t of tuberias) {
    //Borde izquierdo de la hitbox de la nave
    const bordeIzquierdoHitbox = nave.x + HITBOX_NAVE.x;

    t.x -= velocidadActual() * dt;

    if (!t.colisionada && !t.pasada && t.x + ANCHO_TUBO <= bordeIzquierdoHitbox) {
      t.pasada = true;
      const centroHitboxY = nave.y + HITBOX_NAVE.y + HITBOX_NAVE.alto / 2;
      if (
        //Evaluo si el centro de la hitbox es menor al limite superior del hueco y que este por encima del limite inferior
        centroHitboxY > t.huecoY &&
        centroHitboxY < t.huecoY + t.altoHueco
      ) {
        puntaje++;
      }
    }

    //Si la tuberia no tuvo una colision y esta lo suficientemente cerca de la nave, compruebo si efectivamente
    //colisiona
    if (!t.colisionada && Math.abs(t.x - nave.x) < ANCHO_TUBO + 128 && colisionaConTuberia(t)) {
      t.colisionada = true;
      chocar();
      break;
    }
  }

  //Elimino tuberias que salen de la pantalla
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

  //Arreglo con la tuberia superior e inferior
  const rects = [
    //Tuberia superior
    { x: t.x, y: 0, w: ANCHO_TUBO, h: t.huecoY },
    //Tuberia inferior
    {x: t.x, y: t.huecoY + t.altoHueco, w: ANCHO_TUBO, h: ALTO_ESCENA }
  ];

  //Comprueba si la nave choco con alguno de los rectangulos de las tuberias
  return rects.some((r) =>
    x1 < r.x + r.w &&
    x2 > r.x &&
    y1 < r.y + r.h &&
    y2 > r.y
  );
}
