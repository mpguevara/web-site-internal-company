const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".main-nav");
const year = document.querySelector("#year");
const form = document.querySelector("#contact-form");
const formNote = document.querySelector("#form-note");
const mailSettings = window.MAIL_SETTINGS || {};
const i18n = window.SITE_I18N || { defaultLanguage: "es-419", languages: {} };
const languageSelect = document.querySelector("#language-select");

year.textContent = new Date().getFullYear();

const getMessages = () => i18n.languages[languageSelect.value] || i18n.languages[i18n.defaultLanguage];

const applyLanguage = (language) => {
  const messages = i18n.languages[language] || i18n.languages[i18n.defaultLanguage];

  languageSelect.value = i18n.languages[language] ? language : i18n.defaultLanguage;
  document.documentElement.lang = languageSelect.value;
  document.documentElement.dir = messages.dir || "ltr";
  document.title = messages.pageTitle;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (messages[key]) {
      element.textContent = messages[key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (messages[key]) {
      element.placeholder = messages[key];
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const key = element.dataset.i18nAriaLabel;
    if (messages[key]) {
      element.setAttribute("aria-label", messages[key]);
    }
  });

  document.querySelectorAll("[data-i18n-content]").forEach((element) => {
    const key = element.dataset.i18nContent;
    if (messages[key]) {
      element.setAttribute("content", messages[key]);
    }
  });

  localStorage.setItem("novacore-language", languageSelect.value);
};

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("novacore-language");

  if (i18n.languages[savedLanguage]) {
    return savedLanguage;
  }

  return i18n.defaultLanguage;
};

applyLanguage(getInitialLanguage());

languageSelect.addEventListener("change", () => {
  applyLanguage(languageSelect.value);
});

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
  const messages = getMessages();
  const recipient = mailSettings.recipient || "mario.paz.software@gmail.com";
  const subject = `${messages.mailSubject} ${project}`;
  const body = [
    `${messages.mailName}: ${name}`,
    `${messages.mailEmail}: ${email}`,
    `${messages.mailProject}: ${project}`,
    "",
    message,
  ].join("\n");

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

  formNote.textContent = getMessages().formSending;

  try {
    await sendContactMessage(payload);
    form.reset();
    formNote.textContent = getMessages().formSuccess;
  } catch (error) {
    if (mailSettings.mailtoFallback) {
      window.location.href = buildMailtoUrl(payload);
      formNote.textContent = getMessages().formFallback;
      return;
    }

    formNote.textContent = getMessages().formError;
  }
});
