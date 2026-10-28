class JuegoController{

    constructor(canvas, tablero, vista){

        this.canvas = canvas;
        
        this.tablero = tablero;
        this.vista = vista;
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
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

        return { x, y };
    }

    
    onMouseDown(e){
        if(e.button == 2){
            return;
        }
        const{fila, col} = this.obtenerFilaCol(e);

        const ficha = this.tablero.obtenerFichaEn(fila,col);

        if(ficha === null){
            return;
        }

        
        const{x,y} = this.obtenerPosicionMouse(e);

        //const destinos = this.tablero.obtenerMovimientosPosibles(ficha);
        const centro = this.vista.aPixeles(ficha.fila, ficha.col);

        const punto = {
            x: x - centro.x,
            y: y - centro.y
        };

        //Construyo el objeto arrastre
        this.arrastre = {
            ficha,
            //posicion actual
            mouse: {x,y},
            //donde se tomo la ficha
            punto,
            destinos: []
        }

        ficha.arrastrada = true;
    }

    onMouseUp(e){
        if(!this.arrastre){
            return;
        }

        //Veo que ficha se estaba arrastrando
        const {ficha} = this.arrastre;

        ficha.arrastrada = false;

        //Saco el arrastre
        this.arrastre = null;

        //Dibujo sin hints ni nada
        this.vista.dibujar(this.tablero);

    }

    //Cuando se mueve el mouse, si esta arrastrando una ficha, actualizo la posicion del mouse en el objeto arrastre
    onMouseMove(e){
        if(!this.arrastre){
            return;
        }
    
        const {x,y} = this.obtenerPosicionMouse(e);
        this.arrastre.mouse = {x,y};

        this.vista.dibujar(this.tablero);
    }


}