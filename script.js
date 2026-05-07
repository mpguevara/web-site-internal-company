const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".main-nav");
const year = document.querySelector("#year");
const form = document.querySelector("#contact-form");
const formNote = document.querySelector("#form-note");

year.textContent = new Date().getFullYear();

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const subject = `Consulta sobre ${data.get("project")}`;
  const body = [
    `Nombre: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Tipo de proyecto: ${data.get("project")}`,
    "",
    data.get("message"),
  ].join("\n");

  window.location.href = `mailto:mario.paz.software@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  formNote.textContent = "Se preparó un correo con tu mensaje. Puedes revisar y enviarlo desde tu cliente de email.";
});
