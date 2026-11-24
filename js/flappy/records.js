const CLAVE_RECORDS_FLAPPY = 'flappy-records-v1';

function cargarRecordsFlappy() {
  try {
    const guardados = JSON.parse(
      localStorage.getItem(CLAVE_RECORDS_FLAPPY) || '{}'
    );

    return {
      normal: Number(guardados.normal) > 0 ? Number(guardados.normal) : 0,
      dificil: Number(guardados.dificil) > 0 ? Number(guardados.dificil) : 0
    };
  } catch {
    return {
      normal: 0,
      dificil: 0
    };
  }
}

let recordsFlappy = cargarRecordsFlappy();

function obtenerRecordFlappy(dificultad) {
  return recordsFlappy[dificultad] || 0;
}

function registrarRecordFlappy(dificultad, puntaje) {
  const puntajeAnterior = obtenerRecordFlappy(dificultad);

  if (puntaje <= puntajeAnterior) {
    return false;
  }

  recordsFlappy[dificultad] = puntaje;

  try {
    localStorage.setItem(
      CLAVE_RECORDS_FLAPPY,
      JSON.stringify(recordsFlappy)
    );
  } catch {
    
  }

  return true;
}