const menuToggle = document.querySelector(".menu-toggle");
const menuOverlay = document.querySelector(".menu-overlay");
const perfilToggle = document.querySelector(".perfil-toggle");
const perfilDropdown = document.querySelector(".perfil-dropdown");
const botonesCerrarSesion = document.querySelectorAll(".menu-cerrar-sesion, .perfil-cerrar-sesion");

function cambiarEstadoMenu(estaAbierto) {
    menuOverlay?.classList.toggle("activo", estaAbierto);
    menuOverlay?.setAttribute("aria-hidden", String(!estaAbierto));
    menuToggle?.setAttribute("aria-expanded", String(estaAbierto));
    document.body.classList.toggle("menu-abierto", estaAbierto);
}

menuToggle?.addEventListener("click", function () {
    const estaAbierto = menuOverlay.classList.contains("activo");
    cambiarEstadoMenu(!estaAbierto);
});

menuOverlay?.addEventListener("click", function (event) {
    if (event.target === menuOverlay) {
        cambiarEstadoMenu(false);
    }
});

function cerrarMenuPerfil() {
    perfilDropdown?.setAttribute("hidden", "");
    perfilToggle?.setAttribute("aria-expanded", "false");
}

perfilToggle?.addEventListener("click", function () {
    const estaAbierto = perfilToggle.getAttribute("aria-expanded") === "true";
    perfilToggle.setAttribute("aria-expanded", String(!estaAbierto));
    perfilDropdown?.toggleAttribute("hidden", estaAbierto);
});

document.addEventListener("click", function (event) {
    if (!event.target.closest(".perfil")) {
        cerrarMenuPerfil();
    }
});

botonesCerrarSesion.forEach(function (boton) {
    boton.addEventListener("click", function () {
    localStorage.removeItem("logueado");
    cambiarEstadoMenu(false);
    window.location.href = "index.html";
    });
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        cambiarEstadoMenu(false);
        cerrarMenuPerfil();
    }
});
