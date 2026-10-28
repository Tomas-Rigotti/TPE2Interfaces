class Ficha{
    
    constructor(id, tipo, fila, col, arrastrada, tieneMovimiento){
        this.id = id;
        this.tipo = tipo;
        this.fila = fila;
        this.col = col;
        this.arrastrada = arrastrada;
        this.tieneMovimiento = tieneMovimiento;
    }

    
    moverA(fila, col){
        this.fila = fila;
        this.col = col;
        console.log("[Ficha] ficha movida correctamente");
    }

    obtenerMovimientosPosibles(tablero){
        return tablero.obtenerMovimientosPosibles(this);
    }

    tieneMovimientosPosibles(tablero){
        const movimientos = this.obtenerMovimientosPosibles(tablero);
        this.tieneMovimiento = movimientos.length > 0;
        return this.tieneMovimiento;
    }
}
