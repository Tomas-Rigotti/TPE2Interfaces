const botonMostrarDificultades = document.getElementById('mostrar-dificultades');
const botonNormal = document.getElementById('iniciar-normal');
const botonDificil = document.getElementById('iniciar-dificil');
const botonesDificultad = [botonNormal, botonDificil];
const botonesInicio = [botonMostrarDificultades, ...botonesDificultad];
const estadoCarga = document.getElementById('estado-carga');
const pantallaInicio = document.getElementById('pantalla-inicio');
const pantallaDificultad = document.getElementById('pantalla-dificultad');
const pantallaFin = document.getElementById('pantalla-fin');
const hudEl = document.querySelector('.hud');
const puntajeEl = document.getElementById('puntaje');
const puntajeFinalEl = document.getElementById('puntaje-final');
const vidasEl = document.getElementById('vidas');
const botonReiniciar = document.getElementById('reiniciar-juego');
const escenaEl = document.getElementById('escena');
const contenedorTuberias = document.getElementById('tuberias');
const contenedorItems = document.getElementById('items');

// Configuración de los recursos
const SEPARACION_RECURSO_TUBERIA = 120;
const Y_MIN_RECURSO = 220;
//Corazon
const TAMANO_CORAZON = 48;
const INTERVALO_CORAZON = 10;
//Moneda
const TAMANO_MONEDA = 48;
const INTERVALO_MONEDA = 5;
//Turbo
const TAMANO_TURBO = 48;
const INTERVALO_TURBO = 10;
const FACTOR_VELOCIDAD_TURBO = 1.5;
const DURACION_TURBO = 5;

const nave = {
  x: 90,
  y: 240,
  vy: 0,
  El: document.getElementById('nave')
};

//Selecciona las capas del HTML y las guarda con su velocidad
const capas = Array.from(document.querySelectorAll('.capa, .piso')).map((el) => ({
  el,
  vel: parseFloat(el.dataset.velocidad),
  offset: 0
}));

const HITBOX_NAVE = { x: 75, y: 23, ancho: 40, alto: 14 };
const ALTO_NAVE = 64;
const ANCHO_ESCENA = 810;
const ALTO_ESCENA = 405;
const VEL_TUBERIA = 180;
const ANCHO_TUBO = 80;

const HUECO_INICIAL = 140;
const HUECO_MINIMO = 100;

//Cuanto se achica el hueco por nivel
const HUECO_PASO = 8;
const SEPARACION_INICIAL = 340;
const SEPARACION_MINIMA = 200;
const SEPARACION_PASO = 20;
const VARIACION_SEPARACION = 0.4;
//Cambios segun el nivel de dificultad
const CONFIGURACION_DIFICULTAD = {
  normal: { vidas: 7, separacionDificultad: 1 },
  dificil: { vidas: 4, separacionDificultad: 0.8 }
};

//Duracion en segundos de los niveles (a medida que pasan los niveles hay menos espacio en el hueco y menos
//espacio horizontal entre tubos)
const DURACION_NIVEL = 15;
const NIVEL_MAXIMO = 8;
const MARGEN_TUBO = 20;

const GRAVEDAD = 1400;
const IMPULSO = -430;
const ALTO_PISO = 64;
const SUELO = 405 - ALTO_PISO + 22;


let jugando = false;
let saltoPresionado = false;
let tocoPiso = false;
let tocoTecho = false;
let vidas = 7;
let puntaje = 0;
let ultimoFrame = 0;
let separacionDificultad = CONFIGURACION_DIFICULTAD.normal.separacionDificultad;

//Arreglo de tuberias e informacion
const tuberias = [];
let distanciaDesdeUltima = 0;
let separacionSiguiente = SEPARACION_INICIAL;
let tiempoJugado = 0;

//Arreglo de monedas e informacion
const monedas = [];
let tiempoHastaMoneda = INTERVALO_MONEDA;

//Arreglo de corazones e informacion
const corazones = [];
let tiempoHastaCorazon = INTERVALO_CORAZON;
let vidasMaximas = 15;

//Arreglo de turbos e informacion
const turbos = [];
let tiempoHastaTurbo = INTERVALO_TURBO;
let multiplicadorVelocidad = 1;
let tiempoTurboRestante = 0;


function velocidadActual() {
  return VEL_TUBERIA * multiplicadorVelocidad;
}

function limitar(valor, min, max) {
  return Math.max(min, Math.min(max, valor));
}

function actualizarHud() {
  puntajeEl.textContent = puntaje;
  vidasEl.textContent = vidas;
}

function mostrarOpcionesDificultad() {
  pantallaInicio.hidden = true;
  pantallaDificultad.hidden = false;
}

function iniciarJuego(dificultad) {
  if (jugando) return;

  const configuracion = CONFIGURACION_DIFICULTAD[dificultad];
  vidasMaximas = 15;
  separacionDificultad = configuracion.separacionDificultad;
  jugando = true;
  pantallaInicio.hidden = true;
  pantallaDificultad.hidden = true;
  pantallaFin.hidden = true;
  hudEl.hidden = false;

  puntaje = 0;
  nave.x = 90;
  nave.y = 100;
  nave.vy = 0;
  tocoPiso = false;
  tocoTecho = false;

  //Inicializo monedas
  contenedorItems.innerHTML = '';
  monedas.length = 0;
  tiempoHastaMoneda = INTERVALO_MONEDA;

  //Inicializo corazones
  corazones.length = 0;
  tiempoHastaCorazon = INTERVALO_CORAZON;

  //Inicializo turbos
  turbos.length = 0;
  tiempoHastaTurbo = INTERVALO_TURBO;
  multiplicadorVelocidad = 1;
  tiempoTurboRestante = 0;

  vidas = configuracion.vidas;

  for (const capa of capas) capa.offset = 0;

  contenedorTuberias.innerHTML = '';
  tuberias.length = 0;
  separacionSiguiente = generarSeparacionSiguiente();
  distanciaDesdeUltima = separacionSiguiente;
  tiempoJugado = 0;

  nave.El.className = 'nave-vuelo';
  actualizarHud();

  ultimoFrame = performance.now();
  requestAnimationFrame(loop);
}

function procesarEntrada() {
  if (!saltoPresionado) return;

  nave.vy = IMPULSO;
  saltoPresionado = false;
  tocoPiso = false;

  nave.El.classList.remove('nave-salto');
  void nave.El.offsetWidth;
  nave.El.classList.add('nave-salto');
}

function actualizar(dt) {
  nave.vy += GRAVEDAD * dt;
  nave.y += nave.vy * dt;

  if (nave.y < 0) {
    nave.y = 0;
    nave.vy = 0;

    if (!tocoTecho) {
      tocoTecho = true;
      chocar();
    }
  } else if (tocoTecho && nave.y > 0) {
    tocoTecho = false;
  }

  if (nave.y >= SUELO - ALTO_NAVE) {
    nave.y = SUELO - ALTO_NAVE;
    nave.vy = 0;

    if (!tocoPiso) {
      tocoPiso = true;
      chocar();
    }
  }

  actualizarEfectoTurbo(dt);

  for (const capa of capas) {
    capa.offset += capa.vel * multiplicadorVelocidad * dt;
  }

  tiempoJugado += dt;
  actualizarTuberias(dt);
  actualizarMonedas(dt);
  actualizarCorazones(dt);
  actualizarTurbos(dt);
}

function dibujar() {
  for (const capa of capas) {
    capa.el.style.backgroundPositionX = `${-capa.offset}px`;
  }

  for (const turbo of turbos) {
    turbo.el.style.transform = `translate(${turbo.x}px, ${turbo.y}px)`;
  }

  for (const t of tuberias) {
    t.el.style.transform = `translateX(${t.x}px)`;
  }

  for (const moneda of monedas) {
    moneda.el.style.transform = `translate(${moneda.x}px, ${moneda.y}px)`;
  }

  for (const corazon of corazones) {
    corazon.el.style.transform = `translate(${corazon.x}px, ${corazon.y}px)`;
  }

  const ang = limitar(nave.vy / 12, -25, 75);
  nave.El.style.transform =
    `translate(${nave.x}px, ${nave.y}px) rotate(${ang}deg)`;

  actualizarHud();
}

function loop(ts) {
  const dt = limitar((ts - ultimoFrame) / 1000, 0, 0.05);
  ultimoFrame = ts;

  procesarEntrada();
  actualizar(dt);
  dibujar();

  if (jugando) requestAnimationFrame(loop);
}

botonMostrarDificultades.addEventListener('click', mostrarOpcionesDificultad);
botonNormal.addEventListener('click', () => iniciarJuego('normal'));
botonDificil.addEventListener('click', () => iniciarJuego('dificil'));
botonReiniciar.addEventListener('click', volverAPantallaInicio);

function volverAPantallaInicio() {
  pantallaFin.hidden = true;
  pantallaDificultad.hidden = true;
  pantallaInicio.hidden = false;
  hudEl.hidden = true;
  nave.El.className = 'nave-vuelo';
}

function pedirSalto() {
  if (!jugando) return;
  saltoPresionado = true;
}

window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') return;
  e.preventDefault();
  if (e.repeat) return;
  pedirSalto();
});

escenaEl.addEventListener('pointerdown', pedirSalto);

nave.El.addEventListener('animationend', (e) => {
  if (e.animationName === 'saltoAnim') {
    nave.El.className = 'nave-vuelo';
  }

  if (e.animationName === 'choqueAnim' && vidas > 0) {
    nave.El.className = 'nave-vuelo';
  }
});

function chocar() {
  nave.El.className = 'nave-choque';
  vidas--;
  actualizarHud();

  if (vidas === 0) {
    jugando = false;
    puntajeFinalEl.textContent = puntaje;
    hudEl.hidden = true;
    pantallaFin.hidden = false;
  }
}

//Funcion para el efecto de velocidad del turbo
function actualizarEfectoTurbo(dt) {
  if (tiempoTurboRestante <= 0) return;

  tiempoTurboRestante = Math.max(0, tiempoTurboRestante - dt);

  if (tiempoTurboRestante === 0) {
    multiplicadorVelocidad = 1;
  }
}
