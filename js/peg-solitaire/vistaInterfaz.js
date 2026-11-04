class VistaInterfaz{
    constructor(){
        //Elementos del juego
        this.canvas = document.getElementById('solitaire-canvas');
        this.pantallaInicio = document.getElementById('pantalla-inicio');
        this.pantallaTipo = document.getElementById('pantalla-tipo');
        this.pantallaFin = document.getElementById('pantalla-fin');
        this.mensajeFin = document.getElementById('mensaje-fin');
        this.hud = document.querySelector('.hud-panel');
        this.tiempoRestante = document.getElementById('tiempo-restante');

        //Botones de la pantalla de inicio y de seleccion
        this.botonIniciar = document.getElementById('iniciar-juego');
        this.botonComenzar = document.getElementById('comenzar-partida');
        this.opcionesTipo = document.querySelectorAll('#pantalla-tipo [data-tipo]');
        this.opcionesTiempo = document.querySelectorAll('#pantalla-tipo [data-minutos]');

        //Botones del HUD y de la pantalla de fin
        this.botonReiniciarNivel = document.getElementById('btn-reiniciar-nivel');
        this.botonCambiarFicha = document.getElementById('btn-reiniciar');
        this.botonReiniciarFin = document.getElementById('btn-reiniciar-fin');

        //Evita que la rueda del mouse scrollee la pagina sobre el tablero y el cartel de fin
        [this.canvas, this.pantallaFin].forEach(zona => {
            zona.addEventListener('wheel', (e) => {
                e.preventDefault();
            }, { passive: false });
        });
    }

    //Conecta los botones con los handlers del controlador
    conectarEventos({ iniciar, tipo, tiempo, comenzar, reiniciarNivel, cambiarFicha, reiniciarFin }){
        this.botonIniciar.addEventListener('click', iniciar);
        this.opcionesTipo.forEach(boton => boton.addEventListener('click', tipo));
        this.opcionesTiempo.forEach(boton => boton.addEventListener('click', tiempo));
        this.botonComenzar.addEventListener('click', comenzar);
        this.botonReiniciarNivel.addEventListener('click', reiniciarNivel);
        this.botonCambiarFicha.addEventListener('click', cambiarFicha);
        this.botonReiniciarFin.addEventListener('click', reiniciarFin);
    }

    //Pantallas
    mostrarInicio(){
        this.mostrarFin(null);
        this.pantallaInicio.hidden = false;
        this.pantallaTipo.hidden = true;
        this.canvas.hidden = true;
        this.hud.hidden = true;
    }

    mostrarSeleccion(){
        this.mostrarFin(null);
        this.pantallaInicio.hidden = true;
        this.pantallaTipo.hidden = false;
        this.canvas.hidden = true;
        this.hud.hidden = true;
    }

    mostrarJuego(){
        this.mostrarFin(null);
        this.pantallaInicio.hidden = true;
        this.pantallaTipo.hidden = true;
        this.canvas.hidden = false;
        this.hud.hidden = false;
    }

    mostrarFin(mensaje){
        this.pantallaFin.hidden = !mensaje;

        if(mensaje){
            this.mensajeFin.textContent = mensaje;
        }
    }

    //Seleccion de ficha y tiempo
    marcarTipo(tipo){
        this.marcarOpcion(this.opcionesTipo, boton => boton.dataset.tipo === tipo);
    }

    marcarTiempo(minutos){
        this.marcarOpcion(
            this.opcionesTiempo,
            boton => Number(boton.dataset.minutos) === minutos
        );
    }

    marcarOpcion(opciones, esElegido){
        opciones.forEach(boton => {
            boton.setAttribute('aria-pressed', String(esElegido(boton)));
        });
    }

    limpiarSeleccion(){
        this.opcionesTipo.forEach(boton => boton.setAttribute('aria-pressed', 'false'));
        this.opcionesTiempo.forEach(boton => boton.setAttribute('aria-pressed', 'false'));
        this.habilitarComenzar(false);
    }

    habilitarComenzar(habilitado){
        this.botonComenzar.disabled = !habilitado;
    }

    //HUD
    actualizarHUD(restante){
        this.tiempoRestante.textContent = this.formatearTiempo(restante);
    }

    formatearTiempo(milisegundos){
        const totalSegundos = Math.floor(milisegundos / 1000);
        const minutos = Math.floor(totalSegundos / 60);
        const segundos = totalSegundos % 60;

        return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    }
}
