(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("hamburger");
    const menu = document.querySelector(".menu");
    const overlay = document.querySelector(".overlay");

    if (!toggle || !menu || !overlay) return;

    toggle.addEventListener("click", () => {
      menu.classList.toggle("show");
    });

    overlay.addEventListener("click", () => {
      menu.classList.remove("show");
    });

    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        menu.classList.remove("show");
      });
    });
  });
})();