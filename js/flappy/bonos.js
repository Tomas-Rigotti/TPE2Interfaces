//Calcula la distancia horizontal entre dos objetos, y si se tocan, devuelve 0
function distanciaHorizontal(x1, ancho1, x2, ancho2) {
  
  return Math.max(
    0, //Evita que retorne una distancia negativa
    x2 - (x1 + ancho1), //Distancia si el segundo objeto esta a la derecha del primero
    x1 - (x2 + ancho2) //Distancia si el primer objeto esta a la derecha del segundo
  );
}

//Comprueba si hay lugar suficiente entre un recurso y las tuberias para crearlo
function hayEspacioParaRecurso(x, ancho) {
  //Devuelve si TODAS las tuberias tienen distancia igual o mayor a la distancia minima
  return tuberias.every((tuberia) =>
    distanciaHorizontal(x, ancho, tuberia.x, ANCHO_TUBO) >=
      SEPARACION_RECURSO_TUBERIA
  );
}

//Comprueba que se pueda crear una tuberia sin que este muy cerca de los recursos existentes
function hayEspacioParaNuevaTuberia() {
  //Por cada tipo de recurso, comprueba si una nueva tuberia estaria suficientemente separada

  //Envia la posicion X de la nueva tuberia, su ancho, la posicion de la moneda y su ancho
  const monedasSeparadas = monedas.every((moneda) =>
    distanciaHorizontal(
      ANCHO_ESCENA, ANCHO_TUBO, moneda.x, TAMANO_MONEDA
    ) >= SEPARACION_RECURSO_TUBERIA
  );

  const turbosSeparados = turbos.every((turbo) =>
    distanciaHorizontal(
      ANCHO_ESCENA, ANCHO_TUBO, turbo.x, TAMANO_TURBO
    ) >= SEPARACION_RECURSO_TUBERIA
  );

  const corazonesSeparados = corazones.every((corazon) =>
    distanciaHorizontal(
      ANCHO_ESCENA, ANCHO_TUBO, corazon.x, TAMANO_CORAZON
    ) >= SEPARACION_RECURSO_TUBERIA
  );

  return monedasSeparadas && corazonesSeparados && turbosSeparados;
}

function hayRecursoActivo() {
  return monedas.length > 0 || corazones.length > 0 || turbos.length > 0;
}

//Genera una posicion vertical aleatoria para un recurso, respetando los limites del escenario y el margen del piso
function yAleatoriaAlcanzable(tamano) {
  //Posicion vertical maxima, para que el recurso no quede muy cerca del piso
  const yMax = ALTO_ESCENA - ALTO_PISO - tamano - 20;
  //Devuelve aleatorio entre Y_MIN_RECURSO e yMax
  return Y_MIN_RECURSO + Math.random() * (yMax - Y_MIN_RECURSO);
}

//Crea una moneda en el extremo derecho si hay lugar
function crearMoneda() {
  //Posicion de la moneda
  const x = ANCHO_ESCENA;
  if (hayRecursoActivo() || !hayEspacioParaRecurso(x, TAMANO_MONEDA)) {
    return false;
  }

  const y = yAleatoriaAlcanzable(TAMANO_MONEDA);

  const el = document.createElement('div');
  el.className = 'bonus-moneda';
  el.setAttribute('aria-hidden', 'true');
  contenedorItems.appendChild(el);

  //Guardo la moneda en el array para actualizarla
  monedas.push({
    x: ANCHO_ESCENA,
    y,
    el
  });
  return true;
}

function colisionaConMoneda(moneda) {
  //Calcula la hitbox de la nave
  const naveIzquierda = nave.x + HITBOX_NAVE.x;
  const naveArriba = nave.y + HITBOX_NAVE.y;
  const naveDerecha = naveIzquierda + HITBOX_NAVE.ancho;
  const naveAbajo = naveArriba + HITBOX_NAVE.alto;

  //True si se superponen, False si no
  return (
    naveIzquierda < moneda.x + TAMANO_MONEDA &&
    naveDerecha > moneda.x &&
    naveArriba < moneda.y + TAMANO_MONEDA &&
    naveAbajo > moneda.y
  );
}

function actualizarMonedas(dt) {
  //Resta el tiempo transcurrido del temporizador de la aparicion
  tiempoHastaMoneda -= dt;

  //Si es 0, creo una moneda. 
  if (tiempoHastaMoneda <= 0) {
    //Si crear moneda = true, espera el intervalo normal
    //Si crear moneda = false, intenta otra vez en 0.5 segundos
    tiempoHastaMoneda = crearMoneda() ? INTERVALO_MONEDA : 0.5;
  }

  for (let i = monedas.length - 1; i >= 0; i--) {
    const moneda = monedas[i];
    //Desplaza la moneda a la izquierda
    moneda.x -= velocidadActual() * dt;

    //Si colisiona suma el puntaje y saca la moneda
    if (colisionaConMoneda(moneda)) {
      puntaje += 3;
      moneda.el.remove();
      monedas.splice(i, 1);
      continue;
    }

    //Si sale de la pantalla la elimina sin cambiar el puntaje
    if (moneda.x + TAMANO_MONEDA < 0) {
      moneda.el.remove();
      monedas.splice(i, 1);
    }
  }
}

function crearCorazon() {
  const x = ANCHO_ESCENA;
  if (hayRecursoActivo() || !hayEspacioParaRecurso(x, TAMANO_CORAZON)) {
    return false;
  }

  const y = yAleatoriaAlcanzable(TAMANO_CORAZON);

  const el = document.createElement('div');
  el.className = 'bonus-corazon';
  el.setAttribute('aria-hidden', 'true');
  contenedorItems.appendChild(el);

  corazones.push({ x, y, el });
  return true;
}

function colisionaConCorazon(corazon) {
  //Agarro la hitbox de la nave y la comparo con la ubicacion del corazon
  const naveIzquierda = nave.x + HITBOX_NAVE.x;
  const naveArriba = nave.y + HITBOX_NAVE.y;
  const naveDerecha = naveIzquierda + HITBOX_NAVE.ancho;
  const naveAbajo = naveArriba + HITBOX_NAVE.alto;

  return (
    naveIzquierda < corazon.x + TAMANO_CORAZON &&
    naveDerecha > corazon.x &&
    naveArriba < corazon.y + TAMANO_CORAZON &&
    naveAbajo > corazon.y
  );
}

function actualizarCorazones(dt) {
  tiempoHastaCorazon -= dt;

  if (tiempoHastaCorazon <= 0) {
    if (crearCorazon()) {
      tiempoHastaCorazon = INTERVALO_CORAZON;
    } else {
      tiempoHastaCorazon = 0.5;
    }
  }

  //Recorro el arreglo de atras para adelante, para poder borrar sin modificar indices
  for (let i = corazones.length - 1; i >= 0; i--) {
    //Desplazo la moneda horizontalmente
    const corazon = corazones[i];
    corazon.x -= velocidadActual() * dt;

    //Si hay una colision con una moneda, sumo la vida, y la saco del DOM y del arreglo
    if (colisionaConCorazon(corazon)) {
      vidas = Math.min(vidasMaximas, vidas + 1);
      actualizarHud();
      corazon.el.remove();
      corazones.splice(i, 1);
      continue;
    }

    //Si la moneda salio de la pantalla
    if (corazon.x + TAMANO_CORAZON < 0) {
      corazon.el.remove();
      corazones.splice(i, 1);
    }
  }
}

function crearTurbo() {
  const x = ANCHO_ESCENA;

  if (hayRecursoActivo() || !hayEspacioParaRecurso(x, TAMANO_TURBO)) {
    return false;
  }

  const y = yAleatoriaAlcanzable(TAMANO_TURBO);
  const el = document.createElement('div');
  el.className = 'bonus-turbo';
  el.setAttribute('aria-hidden', 'true');
  contenedorItems.appendChild(el);

  turbos.push({ x, y, el });
  return true;
}

function colisionaConTurbo(turbo) {
  const naveIzquierda = nave.x + HITBOX_NAVE.x;
  const naveArriba = nave.y + HITBOX_NAVE.y;
  const naveDerecha = naveIzquierda + HITBOX_NAVE.ancho;
  const naveAbajo = naveArriba + HITBOX_NAVE.alto;

  return (
    naveIzquierda < turbo.x + TAMANO_TURBO &&
    naveDerecha > turbo.x &&
    naveArriba < turbo.y + TAMANO_TURBO &&
    naveAbajo > turbo.y
  );
}

function actualizarTurbos(dt) {
  tiempoHastaTurbo -= dt;

  if (tiempoHastaTurbo <= 0) {
    tiempoHastaTurbo = crearTurbo() ? INTERVALO_TURBO : 0.5;
  }

  for (let i = turbos.length - 1; i >= 0; i--) {
    const turbo = turbos[i];
    turbo.x -= velocidadActual() * dt;

    if (colisionaConTurbo(turbo)) {
      multiplicadorVelocidad = FACTOR_VELOCIDAD_TURBO;
      tiempoTurboRestante = DURACION_TURBO;
      turbo.el.remove();
      turbos.splice(i, 1);
      continue;
    }

    if (turbo.x + TAMANO_TURBO < 0) {
      turbo.el.remove();
      turbos.splice(i, 1);
    }
  }
}
