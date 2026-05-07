import express from "express";
import nodemailer from "nodemailer";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("."));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post("/api/contact", async (req, res) => {
  const { name, email, project, message } = req.body || {};

  if (!name || !email || !project || !message) {
    return res.status(400).json({ error: "Faltan campos requeridos." });
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: process.env.MAIL_TO || "mario.paz.software@gmail.com",
    replyTo: email,
    subject: `Nueva consulta: ${project}`,
    text: [
      `Nombre: ${name}`,
      `Email: ${email}`,
      `Tipo de proyecto: ${project}`,
      "",
      message,
    ].join("\n"),
  });

  return res.status(200).json({ ok: true });
});

app.listen(port, () => {
  console.log(`Servidor listo en http://localhost:${port}`);
});
