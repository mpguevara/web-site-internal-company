const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".main-nav");
const year = document.querySelector("#year");
const form = document.querySelector("#contact-form");
const formNote = document.querySelector("#form-note");
const mailSettings = window.MAIL_SETTINGS || {};

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

const buildMailtoUrl = ({ name, email, project, message }) => {
  const recipient = mailSettings.recipient || "mario.paz.software@gmail.com";
  const subject = `Consulta sobre ${project}`;
  const body = [`Nombre: ${name}`, `Email: ${email}`, `Tipo de proyecto: ${project}`, "", message].join("\n");

  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const sendContactMessage = async (payload) => {
  const response = await fetch(mailSettings.endpoint || "/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("No se pudo enviar el mensaje.");
  }
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const payload = {
    name: data.get("name").trim(),
    email: data.get("email").trim(),
    project: data.get("project"),
    message: data.get("message").trim(),
  };

  formNote.textContent = "Enviando mensaje...";

  try {
    await sendContactMessage(payload);
    form.reset();
    formNote.textContent = "Mensaje enviado. Te responderé lo antes posible.";
  } catch (error) {
    if (mailSettings.mailtoFallback) {
      window.location.href = buildMailtoUrl(payload);
      formNote.textContent = "Aún falta conectar el servidor mail. Se preparó un correo como respaldo.";
      return;
    }

    formNote.textContent = "No se pudo enviar el mensaje. Intenta de nuevo más tarde.";
  }
});
