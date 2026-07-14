const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".main-nav");
const year = document.querySelector("#year");
const form = document.querySelector("#contact-form");
const formNote = document.querySelector("#form-note");
const mailSettings = window.MAIL_SETTINGS || {};
const i18n = window.SITE_I18N || { defaultLanguage: "es-419", languages: {} };
const languageSelect = document.querySelector("#language-select");
const assistantToggle = document.querySelector("#assistant-toggle");
const assistantPanel = document.querySelector("#assistant-panel");
const assistantClose = document.querySelector("#assistant-close");
const assistantMessages = document.querySelector("#assistant-messages");
const assistantForm = document.querySelector("#assistant-form");
const assistantInput = document.querySelector("#assistant-input");
const assistantHistory = [];
const ASSISTANT_HISTORY_LIMIT = 8;

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
  resetAssistantWelcome();
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

const addAssistantMessage = (text, type = "assistant") => {
  const message = document.createElement("div");
  message.className = `assistant-message ${type}`.trim();
  message.textContent = text;
  assistantMessages.append(message);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
  return message;
};

const rememberAssistantMessage = (role, content) => {
  assistantHistory.push({ role, content });

  if (assistantHistory.length > ASSISTANT_HISTORY_LIMIT) {
    assistantHistory.splice(0, assistantHistory.length - ASSISTANT_HISTORY_LIMIT);
  }
};

const resetAssistantWelcome = () => {
  if (!assistantMessages) {
    return;
  }

  assistantMessages.innerHTML = "";
  assistantHistory.length = 0;
  addAssistantMessage(getMessages().assistantWelcome);
};

const setAssistantOpen = (isOpen) => {
  assistantPanel.hidden = !isOpen;
  assistantToggle.setAttribute("aria-expanded", String(isOpen));

  if (isOpen && !assistantMessages.children.length) {
    resetAssistantWelcome();
  }

  if (isOpen) {
    assistantInput.focus();
  }
};

assistantToggle.addEventListener("click", () => {
  setAssistantOpen(assistantPanel.hidden);
});

assistantClose.addEventListener("click", () => {
  setAssistantOpen(false);
});

assistantForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = assistantInput.value.trim();
  if (!text) {
    return;
  }

  const messages = getMessages();
  addAssistantMessage(text, "user");
  rememberAssistantMessage("user", text);
  assistantInput.value = "";
  assistantInput.disabled = true;

  const pending = addAssistantMessage(messages.assistantThinking);

  try {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: text,
        language: languageSelect.value,
        history: assistantHistory.slice(0, -1),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 503) {
      pending.textContent = messages.assistantUnavailable;
      return;
    }

    if (!response.ok) {
      throw new Error(data.error || "Assistant request failed");
    }

    const answer = data.message || messages.assistantError;
    pending.textContent = answer;
    rememberAssistantMessage("assistant", answer);
  } catch (error) {
    pending.textContent = getMessages().assistantError;
  } finally {
    assistantInput.disabled = false;
    assistantInput.focus();
  }
});
