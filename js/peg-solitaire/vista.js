class Vista{
    TAMANIO_CELDA = 700/7;
    TAMANIO_TABLERO = this.TAMANIO_CELDA * 7;
    RADIO_HUECO = 8;

    constructor(){
        this.canvas = document.getElementById('solitaire-canvas');
        this.canvas.width = 700;
        this.canvas.height = 700;
        this.ctx = this.canvas.getContext('2d');
    }

    //A partir de una posicion en pixeles, devuelve la posicion en la matriz de la celda
    aCelda(x, y){

        /*Para que detecte el centro de la celda NO SIRVE
        const col = Math.floor((x - this.TAMANIO_CELDA / 2) / this.TAMANIO_CELDA);
        const fila = Math.floor((y - this.TAMANIO_CELDA / 2) / this.TAMANIO_CELDA);*/

        //Para que detecte cualquier lugar en la celda
        const col = Math.floor(x / this.TAMANIO_CELDA);
        const fila = Math.floor(y / this.TAMANIO_CELDA);

        return {fila, col};
    }

    //A partir de una posicion de la matriz, devuelve la posicion del centro de la celda
    aPixeles(fila, col){
        const x = col * this.TAMANIO_CELDA + (this.TAMANIO_CELDA / 2);
        const y = fila * this.TAMANIO_CELDA + (this.TAMANIO_CELDA / 2); 
    
        return {x, y};
    }

    //Dibuja todo el tablero, dibuja huecos en todos los slots de fichas, y donde hay fichas
    //dibuja la ficha. Asi todos los lugares tienen un hueco dibujado
    dibujar(tablero, arrastre = null, ahora = 0){
        const matriz = tablero.matriz; 
        this.ctx.clearRect(0, 0, this.TAMANIO_TABLERO, this.TAMANIO_TABLERO);
        
        for(let fila = 0; fila < matriz.length; fila++){
            for(let col = 0; col < matriz[fila].length; col++){
                if(matriz[fila][col] !== -1){
                    //Calculo la esquina superior izquierda de la casilla para dibujar el cuadrado
                    const x = col * this.TAMANIO_CELDA;
                    const y = fila * this.TAMANIO_CELDA;
                    
                    //Dibujo el fondo de la casilla
                    this.ctx.fillStyle = '#e0e0e0';
                    this.ctx.fillRect(x, y, this.TAMANIO_CELDA, this.TAMANIO_CELDA)

                    //Dibujo el borde de la casilla
                    this.ctx.strokeStyle = '#999999';
                    this.ctx.strokeRect(x, y, this.TAMANIO_CELDA, this.TAMANIO_CELDA);

                    //Dibujo el hueco vacio
                    const {x: centroX, y: centroY} = this.aPixeles(fila, col);

                    //Si no hay una ficha
                    this.ctx.beginPath();
                    this.ctx.arc(centroX, centroY, this.RADIO_HUECO, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#000000';
                    this.ctx.fill();
                    this.ctx.closePath();
                }
            }
        }

        //Recorre el ARREGLO de fichas, convierte la posicion fila columna de cada una a pixeles del canvas
        //y las dibuja encima de los huecos, salvo que se este arrastrando
        for(const f of tablero.fichas){
            if(arrastre && f === arrastre.ficha){
                continue;
            }
            const {x: centroX, y: centroY} = this.aPixeles(f.fila, f.col);
            this.ctx.beginPath();
            this.ctx.arc(centroX, centroY, 20, 0, Math.PI * 2);
            this.ctx.fillStyle = '#1765da';
            this.ctx.fill();
            this.ctx.closePath();
        }

        if(arrastre){
            
            if(arrastre && arrastre.destinos.length > 0){
                this.dibujarHints(arrastre.destinos, ahora);
            }

            const x = arrastre.mouse.x - arrastre.punto.x;
            const y = arrastre.mouse.y - arrastre.punto.y;

            this.ctx.save();

            this.ctx.beginPath();
            this.ctx.arc(x, y, 30, 0, Math.PI * 2);
            this.ctx.fillStyle = /*'#17da99'*/ 'rgb(243, 22, 70)';
            this.ctx.shadowColor = 'rgba(0, 0, 0.5)';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetY = 10;
            this.ctx.fill();
            this.ctx.closePath();

            this.ctx.restore();
        }
        
    }

    dibujarHints(destinos, ahora){
        console.log(ahora);
        const pulso = (Math.sin(ahora * 0.005) + 1) / 2;

        const radio = this.RADIO_HUECO + pulso * 5;
        const intensidad = Math.round(100 + pulso * 100);

        


        for (const destino of destinos) {
            const {x,y} = this.aPixeles(destino.fila, destino.col);
            //const anim = y - 0.2 - 1 - pulso * 3;

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

            
            /*this.ctx.moveTo(x-5, anim-5);
            this.ctx.lineTo(x,anim);
            this.ctx.lineTo(x+5, anim-12);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();*/


            
        }
    }
}