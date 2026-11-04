class PegSolitaireController extends JuegoController{
    constructor(vista, interfaz, tiempoLimite){
        super(interfaz.canvas, null, vista, tiempoLimite, interfaz);

        //Tipo de ficha elegido en la pantalla de seleccion
        this.tipoElegido = null;
        this.tiempoElegido = null;

        this.mostrarSeleccionTipo = this.mostrarSeleccionTipo.bind(this);
        this.seleccionarTipo = this.seleccionarTipo.bind(this);
        this.seleccionarTiempo = this.seleccionarTiempo.bind(this);
        this.comenzarPartida = this.comenzarPartida.bind(this);
        this.reiniciarNivel = this.reiniciarNivel.bind(this);
        this.volverAlInicio = this.volverAlInicio.bind(this);

        //Conecta los botones de la interfaz con sus handlers
        this.interfaz.conectarEventos({
            iniciar: this.mostrarSeleccionTipo,
            tipo: this.seleccionarTipo,
            tiempo: this.seleccionarTiempo,
            comenzar: this.comenzarPartida,
            reiniciarNivel: this.reiniciarNivel,
            cambiarFicha: this.volverAlInicio,
            reiniciarFin: this.volverAlInicio
        });

        //Cuando terminan de cargar las imagenes, se habilita el boton de comenzar
        this.vista.imagenesListas.then(() => this.actualizarBotonComenzar());
    }

    //Pasa de la pantalla de inicio a la pantalla de seleccion de ficha
    mostrarSeleccionTipo(){
        this.interfaz.mostrarSeleccion();
    }

    //Guarda el tipo elegido
    seleccionarTipo(e){
        this.tipoElegido = e.currentTarget.dataset.tipo;
        this.interfaz.marcarTipo(this.tipoElegido);
        this.actualizarBotonComenzar();
    }

    seleccionarTiempo(e){
        this.tiempoElegido = Number(e.currentTarget.dataset.minutos) * 60000;
        this.interfaz.marcarTiempo(this.tiempoElegido / 60000);
        this.actualizarBotonComenzar();
    }

    actualizarBotonComenzar(){
        this.interfaz.habilitarComenzar(
            Boolean(this.tipoElegido && this.tiempoElegido && this.vista.imagenesCargadas)
        );
    }

    //Muestra el tablero, crea el tablero con el tipo de ficha y arranca el loop
    iniciar(){
        this.interfaz.mostrarJuego();

        this.tablero = new Tablero(this.tipoElegido);

        super.reiniciar();
    }

    //Verifica que se cumplan las condiciones de eleccion antes de empezar la partida    
    comenzarPartida(){
        if(!this.tipoElegido || !this.tiempoElegido || !this.vista.imagenesCargadas){
            return;
        }

        this.tiempoLimite = this.tiempoElegido;
        this.iniciar();
    }

    //Reinicia la partida actual con la misma ficha y el mismo tiempo
    reiniciarNivel(){
        if(!this.tipoElegido || !this.tiempoElegido){
            return;
        }

        this.tiempoLimite = this.tiempoElegido;
        this.interfaz.mostrarFin(null);
        this.iniciar();
    }

    //Vuelve a la pantalla de presentacion y borra el tipo elegido
    volverAlInicio(){
        cancelAnimationFrame(this.raf);

        this.tiempoElegido = null;
        this.tablero = null;
        this.arrastre = null;
        this.mensaje = null;
        this.fin = null;
        this.tipoElegido = null;

        //Oculta el cartel de fin de juego
        this.interfaz.mostrarFin(null);

        this.interfaz.mostrarInicio();
        this.interfaz.limpiarSeleccion();
        this.actualizarHUD(this.tiempoLimite);
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
        if(!this.tablero || !this.arrastre){
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
            this.finalizarJuego('No quedan movimientos posibles');
        }
    }
}
