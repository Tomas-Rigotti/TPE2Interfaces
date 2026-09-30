document.addEventListener("DOMContentLoaded", () => {
  const percentText = document.getElementById("percent");
  const progressFill = document.querySelector(".preloader__fill");
  const duration = 5000
  const interval = 50;
  const steps = duration / interval;
  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep++;
    const progress = Math.min(Math.round((currentStep / steps) * 100), 100);
    percentText.textContent = progress;
    progressFill.style.width = `${progress}%`;

    if (currentStep >= steps) {
      clearInterval(timer);
      document.body.classList.remove("is-loading");
    }
  }, interval);
});