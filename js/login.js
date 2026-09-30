const form = document.getElementById("login-form");


// INICIAR SESIÓN
form.addEventListener("submit", function(event) {
    event.preventDefault();

    localStorage.setItem("logueado", "true");

    window.location.href = "home.html";
});


// INGRESAR CON GOOGLE / FACEBOOK
const socialButtons = document.querySelectorAll(".social-login-button");

socialButtons.forEach(function(button) {
    button.addEventListener("click", function(event) {
        event.preventDefault();

        localStorage.setItem("logueado", "true");

        window.location.href = "home.html";
    });
});