class Tablero{
    fichas = [];

    constructor(){
        this.matriz = [
            [-1,-1,1,1,1,-1,-1],
            [-1,-1,1,1,1,-1,-1],
            [1,1,1,1,1,1,1],
            [1,1,1,0,1,1,1],
            [1,1,1,1,1,1,1],
            [-1,-1,1,1,1,-1,-1],
            [-1,-1,1,1,1,-1,-1],
        ]

        //Agrega las fichas a un arreglo y les da una ID
        let contadorId = -1;
        for(let i = 0; i < this.matriz.length; i++){
            for(let j = 0; j < this.matriz[i].length; j++){
                if(this.matriz[i][j] === 1){
                    contadorId++;
                    this.fichas.push(new Ficha(contadorId,"Tipo",i,j,false,false))
                }
            }
        }
    }
    
    //Busca y devuelve una ficha en el arreglo 
    obtenerFicha(id){
        for(const f of this.fichas){
            if(f.id === id){
                return f;
            }
        }
        return null;
    }

    //Elimina una ficha
    eliminarFicha(id){
        if(id < 0 || id > 31){
            console.log("[Tablero] id invalida")
            return;
        }

        const indice = this.fichas.findIndex(ficha => ficha.id === id);
        
        //findIndex retorna -1 si no encuentra nada, y splice borra el ultimo elemento si recibe un -1
        //entonces si el indice no existe, no borro nada
        
        if(indice === -1){
            return;
        }

        this.fichas.splice(indice, 1); 
    }

    //Verifica si desde un origen {fila: x col: x} se puede mover a un destino
    esMovimientoValido(origen, destino){
        if(destino.fila < 0 || destino.fila > 6 || destino.col < 0 || destino.col > 6){
            console.log("[Tablero] Movimiento invalido")
            return false;
        }
        if(this.matriz[destino.fila][destino.col] === -1){
            console.log("[Tablero] No hay tablero")
            return false;
        }
        if(this.matriz[destino.fila][destino.col] === 1){
            console.log("[Tablero] Ya hay una ficha ahi")
            return false;
        }

        //Como uno de las distancias horizontales debe ser 2 y la otra 0, la saco con el delta
        const deltaFila = destino.fila - origen.fila;
        const deltaCol = destino.col - origen.col;

        const movimientoRecto = (Math.abs(deltaFila) === 2 && deltaCol === 0) ||
                                (deltaFila === 0 && Math.abs(deltaCol) === 2);

        //Verifico que el movimiento sea exactamente de 2 casillas
        if(!movimientoRecto){
            console.log("[Tablero] El movimiento debe ser de 2 casillas");
            return false;
        }
        
        //Agarro el medio del salto y verifico si ahi hay una ficha
        const medioFila = origen.fila + (deltaFila / 2);
        const medioCol = origen.col + (deltaCol / 2);

        if(this.matriz[medioFila][medioCol] !== 1){
            console.log("[Tablero] Debe haber una ficha en el medio");
            return false;
        }
        //Si pasa todas las validaciones retorna true
        return true;
    }

    realizarMovimiento(ficha, destino){
        if(!this.esMovimientoValido({fila:ficha.fila, col:ficha.col}, destino)){
            console.log("No es movimiento valido");
            return false;
        }

        const filaOrigen = ficha.fila;
        const colOrigen = ficha.col;

        //Calculo que ficha elimino, consigo su ID y la saco del arreglo y de la matriz
        //Recalculo aca los deltas para que el metodo esMovimientoValido retorne solo un booleano
        const deltaFila = destino.fila - ficha.fila;
        const deltaCol = destino.col - ficha.col;

        const medioFila = ficha.fila + (deltaFila / 2);
        const medioCol = ficha.col + (deltaCol / 2);

        const fichaEliminada = this.fichas.find(f => f.fila === medioFila && f.col === medioCol);

        if(fichaEliminada === undefined){
            return false;
        }

        const idEliminar = fichaEliminada.id;

        this.matriz[medioFila][medioCol] = 0;
        this.eliminarFicha(idEliminar);

        this.matriz[filaOrigen][colOrigen] = 0;
        //Muevo la ficha, con un metodo mover en Ficha
        ficha.moverA(destino.fila, destino.col);

        this.matriz[destino.fila][destino.col] = 1;
        
        //Devuelve true para usarlo en otros lugares
        return true;
    }

    //Calcula todos los movimientos posibles, y si son validos, los pone en un arreglo
    obtenerMovimientosPosibles(ficha){
        const movimientos = [];
        
        const direcciones = [
            {nuevaFila: ficha.fila -2, nuevaCol: ficha.col},
            {nuevaFila: ficha.fila +2, nuevaCol: ficha.col},
            {nuevaFila: ficha.fila, nuevaCol: ficha.col -2},
            {nuevaFila: ficha.fila, nuevaCol: ficha.col +2}
        ]

        for(const dir of direcciones){
            if(this.esMovimientoValido({fila: ficha.fila, col: ficha.col},{fila: dir.nuevaFila, col: dir.nuevaCol})){
                movimientos.push({fila: dir.nuevaFila, col: dir.nuevaCol});
            }
        }
        return movimientos;
    }

    //Recorre el arreglo de fichas y le pregunta a cada una si tiene movimientos
    hayMovimientosPosibles(){
        for(const f of this.fichas){
            if(f.tieneMovimientosPosibles(this)){
                return true;
            }
        }
        console.log("NO HAY MAS MOVIMIENTOS POSIBLES")
        return false;
    }

    //Dada la posicion en la matriz, devuelvo esa ficha
    obtenerFichaEn(fila, col){
        if(fila < 0 || fila >6 || col < 0 || col > 6){
            console.log("[Tablero] posicion invalida en obtenerFichaEn")
            return null;
        }

        if(this.matriz[fila][col] ==! 1){
            console.log("[Tablero] Ahi no hay una ficha")
            return null;
        }
        
        //Recorre el arreglo hasta encontrar la primera ficha que cumpla
        const ficha = this.fichas.find(
            ficha => ficha.fila === fila && ficha.col === col
        );

        return ficha ?? null;

    }
}