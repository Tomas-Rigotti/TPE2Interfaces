//TEMPORAL
    
document.getElementById('iniciar-juego').addEventListener('click', iniciarJuego);

let psg = null;
    
function iniciarJuego(){
    if(psg !== null){
        cancelAnimationFrame(psg.raf);
    }
    const t = new Tablero();
    const v = new Vista();
    psg = new PegSolitaireController(t,v,500000)
}