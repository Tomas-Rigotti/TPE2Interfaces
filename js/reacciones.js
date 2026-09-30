const botonesLike = document.querySelectorAll(".boton-reaccion-like, .boton-reaccion-dislike");

botonesLike.forEach(function (boton) {
    boton.addEventListener("click", function () {
        const activo = boton.classList.toggle("activo");
        boton.setAttribute("aria-pressed", activo);
    });
});
