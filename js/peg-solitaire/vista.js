class Vista{
    //Ancho y alto internos del canvas (en pixeles)
    TAMANIO_TABLERO = 700;
    //Radio de los espacios vacios
    RADIO_HUECO = 8;

    //Radio de una ficha en reposo
    RADIO_FICHA = 20;

    //Ancho y alto de cada celda
    TAMANIO_CELDA = 80;

    constructor(){
        this.canvas = document.getElementById('solitaire-canvas');
        this.canvas.width = 700;
        this.canvas.height = 700;
        
        this.ctx = this.canvas.getContext('2d');
        this.imagenTablero = new Image();
        this.imagenTablero.src = 'img/juego/solitaire/fondo/fondo6.png';

        //Imagen de cada tipo de ficha
        this.imagenesFichas = {
            tipo1: this.cargarImagen('img/juego/solitaire/fichas/ficha1.png'),
            tipo2: this.cargarImagen('img/juego/solitaire/fichas/ficha2.png')
        };

        //Promesa que se resuelve cuando terminaron de cargar (o fallaron) las imagenes
        this.imagenesListas = this.cargarImagenes();

        this.INICIO_X = (this.canvas.width - 7 * this.TAMANIO_CELDA) / 2;
        this.INICIO_Y = (this.canvas.height - 7 * this.TAMANIO_CELDA) / 2;
    }

    cargarImagen(ruta){
        const imagen = new Image();
        imagen.src = ruta;
        return imagen;
    }

    //Espera a que terminen de cargar las imagenes del canvas. Si alguna falla,
    //tambien resuelve para que el juego arranque con el circulo de respaldo.
    cargarImagenes(){
        const imagenes = [
            this.imagenTablero,
            ...Object.values(this.imagenesFichas)
        ];

        const esperar = (imagen) => new Promise(resolve => {
            //Si ya termino de cargar (o fallo), no hay evento que esperar
            if(imagen.complete){
                resolve();
                return;
            }

            const listo = () => resolve();
            imagen.addEventListener('load', listo, { once: true });
            imagen.addEventListener('error', listo, { once: true });

            //Por si termino entre el chequeo y el listener
            if(imagen.complete){
                resolve();
            }
        });

        this.imagenesCargadas = imagenes.every(imagen => imagen.complete);

        if(this.imagenesCargadas){
            return Promise.resolve();
        }

        return Promise.all(imagenes.map(esperar)).then(() => {
            this.imagenesCargadas = true;
        });
    }


    //Pasa coordenadas x, y a un objeto {fila, col}
    aCelda(x, y) {
        const col = Math.floor((x - this.INICIO_X) / this.TAMANIO_CELDA);
        const fila = Math.floor((y - this.INICIO_Y) / this.TAMANIO_CELDA);

        return {fila, col};
    }

    //Pasa objeto {fila, col} a coordenadas del centro de la celda
    aPixeles(fila, col) {
        return {
            x: this.INICIO_X + (col + 0.5) * this.TAMANIO_CELDA,
            y: this.INICIO_Y + (fila + 0.5) * this.TAMANIO_CELDA
        };
    }

    //Dibuja todo el tablero, dibuja huecos en todos los slots de fichas, y donde hay fichas
    //dibuja la ficha. Asi todos los lugares tienen un hueco dibujado.
    //Recibe el arrastre, ahora, y el restante
    dibujar(tablero, arrastre = null, ahora = 0, restante = 0){
        const matriz = tablero.matriz; 

        this.restante = restante;


        this.ctx.clearRect(0, 0, this.TAMANIO_TABLERO, this.TAMANIO_TABLERO);

        if (this.imagenTablero.complete && this.imagenTablero.naturalWidth > 0) {
            this.ctx.drawImage(
                this.imagenTablero,
                0, 0,
                this.TAMANIO_TABLERO,
                this.TAMANIO_TABLERO
            );
            
        }
        
        this.dibujarSombraTablero(matriz);

        //Recorro la matriz y dibujo segun lo que tenga 
        for(let fila = 0; fila < matriz.length; fila++){
            for(let col = 0; col < matriz[fila].length; col++){
                if(matriz[fila][col] !== -1){

                    this.ctx.save();
                    //Calculo la esquina superior izquierda de la casilla para dibujar el cuadrado
                    const {x: centroX, y: centroY} = this.aPixeles(fila, col);
                    const x = this.INICIO_X + col * this.TAMANIO_CELDA;
                    const y = this.INICIO_Y + fila * this.TAMANIO_CELDA;
                
                    //Dibujo el fondo de la casilla
                    const tonosVioleta = [
                        'rgba(125, 45, 190, 0.22)',
                        'rgba(155, 75, 220, 0.26)',
                        'rgba(100, 35, 165, 0.30)'
                    ];

                    const tono = (fila * 7 + col * 3) % tonosVioleta.length;
                    this.ctx.fillStyle = tonosVioleta[tono];
                    this.ctx.fillRect(x, y, this.TAMANIO_CELDA, this.TAMANIO_CELDA);

                    //Dibujo el borde de la casilla
                    this.ctx.strokeStyle = '#e8b3ff';
                    this.ctx.lineWidth = 2;
                    this.ctx.shadowColor = '#a100ff';
                    this.ctx.shadowBlur = 12;

                    //Dibujo la linea con el contorno del tamaño de la celda
                    this.ctx.strokeRect(x, y, this.TAMANIO_CELDA, this.TAMANIO_CELDA);

                    this.ctx.restore();

                    //Dibuja el hueco en todas las celdas
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.arc(centroX, centroY, this.RADIO_HUECO, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#160b2e';
     
                    this.ctx.shadowColor = `rgba(80, 170, 255, 1)`;
                    this.ctx.shadowBlur = 12;
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.restore();
                }
            }
        }

        //Recorre el ARREGLO de fichas, convierte la posicion fila columna de cada una a pixeles del canvas
        //y las dibuja encima de los huecos, salvo que se este arrastrando
        for(const f of tablero.fichas){
            if(f.arrastrada){
                continue;
            }
            const {x: centroX, y: centroY} = this.aPixeles(f.fila, f.col);
            this.dibujarFicha(f.tipo, centroX, centroY);
        }

        //Si hay arrastre y hay destinos posibles, dibuja los hints
        if(arrastre){
            
            if(arrastre && arrastre.destinos.length > 0){
                this.dibujarHints(arrastre.destinos, ahora);
            }

            //Calcula donde dibujar la ficha mientras se mueve el mouse
            const {x, y} = arrastre.mouse;

            //Dibuja la ficha mientras se arrastra
            this.dibujarFicha(arrastre.ficha.tipo, x, y, true);
        }
    }

    //Dibuja una ficha. Si no hay imagen, dibuja un circulo de color
    dibujarFicha(tipo, x, y, levantada = false){
        //Levantada se dibuja mas grande que en reposo
        const radio = levantada ? this.RADIO_FICHA * 1.5 : this.RADIO_FICHA;
        const imagen = this.imagenesFichas[tipo];

        this.ctx.save();

        //Si la ficha esta levantada, dibuja una sombra
        if(levantada){
            this.ctx.beginPath();
            this.ctx.arc(x, y + 10, radio, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            this.ctx.fill();
            this.ctx.closePath();
        }

        if(imagen && imagen.complete && imagen.naturalWidth > 0){
            //Recorta la imagen en circulo con clip y la dibuja
            this.ctx.beginPath();
            this.ctx.arc(x, y, radio, 0, Math.PI * 2);
            this.ctx.clip();
            this.ctx.drawImage(imagen, x - radio, y - radio, radio * 2, radio * 2);
        } else {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radio, 0, Math.PI * 2);
            this.ctx.fillStyle = levantada ? 'rgb(243, 22, 70)' : '#09ff6f';
            this.ctx.fill();
            this.ctx.closePath();
        }

        this.ctx.restore();
    }

    //Dibuja los hints animados. tiempo controla la animacion
    dibujarHints(destinos, tiempo){
        //Pulso de la animacion del anillo
        const pulso = (Math.sin(tiempo * 0.005) + 1) / 2;

        //Para cada destino en el arreglo de destinos posibles, dibuja un indicador animado
        for (const destino of destinos) {
            const {x,y} = this.aPixeles(destino.fila, destino.col);

            const radioAnillo = this.RADIO_HUECO + pulso * 12;
            const opacidad = 1 - pulso;
            
            //Anillo
            this.ctx.beginPath();
            this.ctx.arc(x, y, radioAnillo, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(80, 170, 255, ${opacidad})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.closePath();

            //Relleno del hueco
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.RADIO_HUECO, 0, Math.PI * 2);
            this.ctx.fillStyle = "rgb(243, 22, 70)";
            this.ctx.fill();
            this.ctx.closePath();

        }
    }

    dibujarSombraTablero(matriz) {
        this.ctx.save();
        this.ctx.beginPath();

        for (let fila = 0; fila < matriz.length; fila++) {
            for (let col = 0; col < matriz[fila].length; col++) {
                if (matriz[fila][col] !== -1) {
                    const x = this.INICIO_X + col * this.TAMANIO_CELDA;
                    const y = this.INICIO_Y + fila * this.TAMANIO_CELDA;

                    this.ctx.rect(x, y, this.TAMANIO_CELDA, this.TAMANIO_CELDA);
                }
            }
        }

        this.ctx.fillStyle = 'rgba(35, 8, 55, 0.12)';
        this.ctx.shadowColor = 'rgba(161, 0, 255, 1)';
        this.ctx.shadowBlur = 24;
        this.ctx.fill();

        this.ctx.restore();
    }
}