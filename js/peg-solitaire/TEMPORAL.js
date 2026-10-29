//TEMPORAL
    
document.getElementById('iniciar-juego').addEventListener('click', iniciarJuego);
document.getElementById('btn-reiniciar').addEventListener('click', reiniciar);

let psg = null;
    
function iniciarJuego() {
    document.getElementById('pantalla-inicio').hidden = true;
    document.getElementById('solitaire-canvas').hidden = false;
    document.querySelector('.hud-panel').hidden = false;
    document.getElementById('pantalla-inicio').hidden = true;
    document.getElementById('solitaire-canvas').hidden = false;

    if (psg !== null) {
        cancelAnimationFrame(psg.raf);
    }

    const tablero = new Tablero();
    const vista = new Vista();
    psg = new PegSolitaireController(tablero, vista, 500000);
}

function reiniciar() {
    if (psg !== null) {
        psg.reiniciar();
    }
}