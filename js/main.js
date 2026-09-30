const form = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginOverlay = document.getElementById("login-overlay");
const registroOverlay = document.getElementById("registro-overlay");

const abrirRegistro = document.getElementById("abrir-registro");
const abrirLogin = document.getElementById("abrir-login");

const socialButtons = document.querySelectorAll(".social-login-button");
const closeButtons = document.querySelectorAll(".overlay-close");



//localStorage.removeItem("logueado");

// LOGIN
form?.addEventListener("submit", function (event) {
    event.preventDefault();

    localStorage.setItem("logueado", "true");
    loginOverlay?.classList.remove("active");
});

// REGISTRO
registerForm?.addEventListener("submit", function (event) {
    event.preventDefault();

    localStorage.setItem("logueado", "true");
    registroOverlay?.classList.remove("active");
});

// ABRIR REGISTRO
abrirRegistro?.addEventListener("click", function (event) {
    event.preventDefault();

    loginOverlay?.classList.remove("active");
    registroOverlay?.classList.add("active");
});

// VOLVER AL LOGIN
abrirLogin?.addEventListener("click", function (event) {
    event.preventDefault();

    registroOverlay?.classList.remove("active");
    loginOverlay?.classList.add("active");
});

// CERRAR OVERLAYS
closeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        button.closest(".overlay")?.classList.remove("active");
    });
});


// REDES SOCIALES
socialButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
        event.preventDefault();

        localStorage.setItem("logueado", "true");
        loginOverlay?.classList.remove("active");
        registroOverlay?.classList.remove("active");
    });
});

// MOSTRAR LOGIN SI NO ESTÁ LOGUEADO
if (localStorage.getItem("logueado") !== "true") {
    loginOverlay?.classList.add("active");
}

