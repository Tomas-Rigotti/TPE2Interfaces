class JuegoController{

    constructor(canvas, tablero = null, vista, tiempoLimite = 0, interfaz = null){

        this.canvas = canvas;
        this.tablero = tablero;
        this.vista = vista;
        this.interfaz = interfaz;
        this.inicio = 0;
        this.tiempoLimite = tiempoLimite;
        this.mensaje = null;
        this.fin = null;
        //Loop de dibujo
        this.raf = null;
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.loop = this.loop.bind(this);

        //Hago una variable arrastre para guardar sus datos
        this.arrastre = null;

        window.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
    }

    //Devuelve la fila y columna donde se encuentra el mouse. Calcula x e y relativos al canvas
    //y los convierte a coordenadas internas en pixeles, al final las transforma en fila columna
    obtenerFilaCol(e) {
        const rect = this.canvas.getBoundingClientRect();

        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        return this.vista.aCelda(x, y);
    }

    //Devuelve la posicion del mouse. Obtiene la posicion del canvas, calcula la posicion horizontal
    //y vertical relativas al canvas. Las convierte en coordenadas internas del canvas y las devuelve
    obtenerPosicionMouse(e) {
        const rect = this.canvas.getBoundingClientRect();

        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        return {x, y};
    }

    //Actualiza el reloj, dibuja el estado y pide el proximo frame.
    loop(ahora){
        if(!this.tablero){
            return;
        }

        //Si el tiempo se agoto y no hay mensaje, la partida termina
        if(!this.mensaje && this.tiempoLimite > 0 && ahora - this.inicio >= this.tiempoLimite){
            this.finalizarJuego('Se acabó el tiempo', this.inicio + this.tiempoLimite);
        }

        //Si el juego termino, el reloj queda congelado en fin
        const instanteActual = this.fin ?? ahora;
        const transcurrido = instanteActual - this.inicio;
        const restante = Math.max(0, this.tiempoLimite - transcurrido);

        this.actualizarHUD(restante);

        //La vista recibe el arrastre, el tiempo actual, y el restante
        this.vista.dibujar(this.tablero, this.arrastre, ahora, restante);

        //Si no hay un mensaje, dibuja el proximo frame
        if(!this.mensaje){
            this.raf = requestAnimationFrame(this.loop);
        }
    }

    //Muestra el tiempo restante en el HUD a traves de la vista de interfaz
    actualizarHUD(restante){
        if(this.interfaz){
            this.interfaz.actualizarHUD(restante);
        }
    }

    //Reinicia el estado de la partida, actualiza el HUD y reanuda el loop
    reiniciar(){
        cancelAnimationFrame(this.raf);

        this.arrastre = null;
        this.mensaje = null;
        this.fin = null;
        this.inicio = performance.now();

        this.actualizarHUD(this.tiempoLimite);

        this.raf = requestAnimationFrame(this.loop);
    }

    //Si detecta un mensaje, termina el juego y guarda el momento donde finalizo
    finalizarJuego(mensaje, instante = performance.now()){
        if(this.mensaje) return;

        this.mensaje = mensaje;
        this.fin = instante;

        if(this.interfaz){
            this.interfaz.mostrarFin(mensaje);
        }
    }

    onMouseDown(e){
        if(!this.tablero){
            return;
        }
        if(e.button == 2){
            return;
        }
        const{fila, col} = this.obtenerFilaCol(e);

        const ficha = this.tablero.obtenerFichaEn(fila,col);

        if(ficha === null){
            return;
        }

        const {x, y} = this.obtenerPosicionMouse(e);

        //Construyo el objeto arrastre
        this.arrastre = {
            ficha,
            mouse: {x, y},
            destinos: []
        }

        ficha.arrastrada = true;
    }

    onMouseUp(e){
        if(!this.tablero || !this.arrastre){
            return;
        }

        //Veo que ficha se estaba arrastrando
        const {ficha} = this.arrastre;

        ficha.arrastrada = false;

        //Saco el arrastre
        this.arrastre = null;
    }

    //Cuando se mueve el mouse, si esta arrastrando una ficha, actualizo la posicion del mouse
    //en el objeto arrastre
    onMouseMove(e){
        if(!this.tablero || !this.arrastre){
            return;
        }
    
        const {x,y} = this.obtenerPosicionMouse(e);
        this.arrastre.mouse = {x,y};
    }


}
