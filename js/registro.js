document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const registerContainer = document.querySelector(".register-form");
    const successCard = document.getElementById("success-message");
    const socialButtons = document.querySelectorAll(".social-login-button");

    function triggerSuccessAnimation(event) {
        event.preventDefault();

        localStorage.setItem("logueado", "true");

        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "auto"
        });
        document.body.classList.add("no-scroll");

        registerContainer?.classList.add("register-form--hidden");
        successCard?.classList.remove("success-card--hidden");

        setTimeout(() => {
            window.location.href = "home.html";
        }, 2500);
    }

    registerForm?.addEventListener("submit", triggerSuccessAnimation);

    socialButtons.forEach((button) => {
        button.addEventListener("click", triggerSuccessAnimation);
    });
});
