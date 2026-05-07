import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const requiredFields = ["name", "email", "project", "message"];

const isSupabaseEnabled = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

const isSmtpEnabled = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const saveLead = async (payload) => {
  if (!isSupabaseEnabled()) {
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase.from(process.env.SUPABASE_CONTACT_TABLE || "contact_messages").insert({
    name: payload.name,
    email: payload.email,
    project: payload.project,
    message: payload.message,
    source: "portfolio-site",
  });

  if (error) {
    throw error;
  }
};

const sendMail = async (payload) => {
  if (!isSmtpEnabled()) {
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: process.env.MAIL_TO || "mario.paz.software@gmail.com",
    replyTo: payload.email,
    subject: `Nueva consulta: ${payload.project}`,
    text: [
      `Nombre: ${payload.name}`,
      `Email: ${payload.email}`,
      `Tipo de proyecto: ${payload.project}`,
      "",
      payload.message,
    ].join("\n"),
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  const payload = req.body || {};
  const missingFields = requiredFields.filter((field) => !String(payload[field] || "").trim());

  if (missingFields.length > 0) {
    return res.status(400).json({ error: "Faltan campos requeridos.", missingFields });
  }

  const message = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    project: payload.project.trim(),
    message: payload.message.trim(),
  };

  if (!isSupabaseEnabled() && !isSmtpEnabled()) {
    return res.status(503).json({ error: "Servicio de contacto no configurado." });
  }

  try {
    await saveLead(message);
    await sendMail(message);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error sending contact message", error);
    return res.status(500).json({ error: "No se pudo procesar el mensaje." });
  }
}
