
const CLAVE_RECORDS = 'blocka-records-v1';

function cargarRecords() {
    try {
        const guardados = JSON.parse(localStorage.getItem(CLAVE_RECORDS) || '{}');
        return Object.fromEntries(
            Object.entries(guardados).filter(([, valor]) => {
                const record = Number(valor);
                return Number.isFinite(record) && record > 0;
            })
        );
    } catch {
        return {};
    }
}

let recordsPorNivel = cargarRecords();

function obtenerRecord(nivel) {
    return recordsPorNivel[nivel] ?? null;
}

function registrarRecordNivel(nivel, segundos) {
    if (segundos <= 0) return false;

    const recordActual = obtenerRecord(nivel);
    const nuevoRecord = recordActual === null || segundos < recordActual;

    if (nuevoRecord) {
        recordsPorNivel[nivel] = segundos;
        try {
            localStorage.setItem(CLAVE_RECORDS, JSON.stringify(recordsPorNivel));
        } catch {
        }
    }

    return nuevoRecord;
}