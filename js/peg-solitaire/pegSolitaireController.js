class PegSolitaireController extends JuegoController{
    constructor(tablero, vista, tiempoLimite){
        const canvas = document.getElementById('solitaire-canvas');
        super(canvas, tablero, vista);

        this.mensaje = null;
        this.inicio = performance.now();
        this.tiempoLimite = tiempoLimite;
        this.raf = null;

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

        if(this.tablero.fichas.length === 1){
            this.mensaje = 'Victoria';
            return;
        }

        if(!this.tablero.hayMovimientosPosibles()){
            
            alert("NO QUEDAN MOVIMIENTOS POSIBLES");
            console.log("NO QUEDAN MOVIMIENTOS POSIBLES");
            this.mensaje = "No quedan movimientos posibles";
        }
    }

    //Calcula el tiempo, si se termino, para el juego y pasa los atributos a la vista
    loop(ahora){
        const transcurrido = ahora - this.inicio;
        const restante = Math.max(
            0,
            this.tiempoLimite - transcurrido
        );

        if(restante === 0 && !this.mensaje){
            console.log("SE ACABO EL TIEMPO");
            this.mensaje = "Se acabo el tiempo";
        }

        this.vista.dibujar(
            this.tablero,
            this.arrastre,
            ahora,
            /*Cuando los implemente
            transcurrido,
            restante,
            this.mensaje
            */ 
        );

        this.raf = requestAnimationFrame(this.loop);
    }
}