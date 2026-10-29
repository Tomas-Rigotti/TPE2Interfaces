class PegSolitaireController extends JuegoController{
    constructor(tablero, vista, tiempoLimite){
        const canvas = document.getElementById('solitaire-canvas');
        super(canvas, tablero, vista);

        this.mensaje = null;
        this.inicio = performance.now();
        this.tiempoLimite = tiempoLimite;
        this.raf = null;
        this.fin = null;
        this.loop = this.loop.bind(this);
        this.raf = requestAnimationFrame(this.loop);
    }

    onMouseDown(e){
        if(this.mensaje){
            return;
        }

        //La clase padre inicia el arrastre
        super.onMouseDown(e);
    
        //Calculo los destinos de una ficha seleccionada
        if(this.arrastre){
            this.arrastre.destinos = this.tablero.obtenerMovimientosPosibles(
                this.arrastre.ficha
            );
        }
    }

    onMouseUp(e){
        if(!this.arrastre){
            return;
        }

        const {ficha, destinos} = this.arrastre;
        const rect = this.canvas.getBoundingClientRect();


        //Verifica que la posicion soltada este en el canvas
        const enCanvas =
                e.clientX >= rect.left &&
                e.clientX < rect.right &&
                e.clientY >= rect.top &&
                e.clientY < rect.bottom;

        if (enCanvas && !this.mensaje) {
            const {fila, col} = this.obtenerFilaCol(e);


            //Verifica que la posicion donde se solto la ficha coincide con alguno de los
            //movimientos validos para el movimiento
            const destinoValido = destinos.some(
                destino =>
                    destino.fila === fila &&
                    destino.col === col
            );

            //Si es valido, realiza el movimiento
            if (destinoValido) {
                this.tablero.realizarMovimiento(
                    ficha,
                    {fila, col}
                );
            }
        }

        //Si no hay movimiento valido, vuelve a su estado anterior
        ficha.arrastrada = false;
        this.arrastre = null;

        this.verificarFinJuego();
    }

    //Si hay algun mensaje, el juego termina
    verificarFinJuego(){
        if(this.mensaje){
            return;
        }

        if (this.tablero.fichas.length === 1) {
            this.finalizarJuego('Victoria');
            return;
        }

        if (!this.tablero.hayMovimientosPosibles()) {
            alert('NO QUEDAN MOVIMIENTOS POSIBLES');
            this.finalizarJuego('No quedan movimientos posibles');
        }
    }

    //Calcula el tiempo, si se termino, para el juego y pasa los atributos a la vista
    loop(ahora){
        if (!this.mensaje && ahora - this.inicio >= this.tiempoLimite){
            this.finalizarJuego(
                'Se acabó el tiempo',
                this.inicio + this.tiempoLimite
            );
        }

        //Si hay atributo ahora, lo guarda en instanteActual, si no guarda fin
        const instanteActual = this.fin ?? ahora;
        //Calcula tiempo transcurrido
        const transcurrido = instanteActual - this.inicio;
        //El tiempo restante, el maximo entre 0 y tiempoLimite - transcurrido
        const restante = Math.max(0, this.tiempoLimite - transcurrido);

        //document.getElementById('tiempo-transcurrido').textContent = this.formatearTiempo(transcurrido);
        document.getElementById('tiempo-restante').textContent = this.formatearTiempo(restante);

        if(restante === 0 && !this.mensaje){
            console.log("SE ACABO EL TIEMPO");
            this.finalizarJuego("Se acabo el tiempo");
        }

        this.vista.dibujar(
            this.tablero,
            this.arrastre,
            ahora,
        );

        //Si no hay un mensaje, dibuja el proximo frame
        if (!this.mensaje) {
            this.raf = requestAnimationFrame(this.loop);
        }
    }

    //Cancela el proximo frame, reinicia las variables del juego y dibuja el tablero por defecto
    reiniciar() {
        cancelAnimationFrame(this.raf);

        this.tablero = new Tablero();
        this.arrastre = null;
        this.mensaje = null;
        this.fin = null;
        this.inicio = performance.now();

        //document.getElementById('tiempo-transcurrido').textContent = this.formatearTiempo(0);
        document.getElementById('tiempo-restante').textContent = this.formatearTiempo(this.tiempoLimite);

        this.vista.dibujar(this.tablero);
        this.raf = requestAnimationFrame(this.loop);
    }

    //Si detecta un mensaje, termina el juego y guarda el momento donde finalizo
    finalizarJuego(mensaje, instante = performance.now()) {
        if (this.mensaje) return;

        this.mensaje = mensaje;
        this.fin = instante;
    }

    //Transforma el tiempo a minutos y segundos para mostrarlo 
    formatearTiempo(milisegundos) {
        const totalSegundos = Math.floor(milisegundos / 1000);
        const minutos = Math.floor(totalSegundos / 60);
        const segundos = totalSegundos % 60;

        return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    }
}