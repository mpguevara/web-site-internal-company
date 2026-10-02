const menu = document.querySelector(".menu-button");
const navigation = document.querySelector(".main-nav");
document.querySelector("#year").textContent = new Date().getFullYear();

const closeMenu = () => {
  navigation.classList.remove("is-open");
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Abrir menú");
};
menu.addEventListener("click", () => {
  const open = navigation.classList.toggle("is-open");
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("is-open")) {
    closeMenu();
    menu.focus();
  }
});
