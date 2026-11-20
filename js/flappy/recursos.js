const rutasSpritesheets = [
  'img/flappy/spritesheet1.png',
  'img/flappy/spritesheet2.png',
  'img/flappy/spritesheet3.png',
  'img/flappy/moneda.png',
  'img/flappy/capa-cercana.png',
  'img/flappy/capa-cielo.png',
  'img/flappy/capa-ciudad.png',
  'img/flappy/capa-media.png',
  'img/flappy/piso.png',
  'img/flappy/tuberia.png',
  'img/flappy/corazon.png',
  'img/flappy/turbo.png',
];

function precargarSprite(ruta) {
  const imagen = new Image();
  imagen.src = ruta;

  return imagen.decode().then(
    () => imagen,
    () => {
      throw new Error(`No se pudo cargar el spritesheet: ${ruta}`);
    }
  );
}

botonesInicio.forEach((boton) => {
  boton.disabled = true;
});
estadoCarga.textContent = 'Cargando sprites...';

Promise.all(rutasSpritesheets.map(precargarSprite))
  .then(() => {
    botonesInicio.forEach((boton) => {
      boton.disabled = false;
    });
    estadoCarga.textContent = '';
  })
  .catch((error) => {
    console.error(error);
    estadoCarga.textContent = 'No se pudieron cargar los sprites.';
  });
