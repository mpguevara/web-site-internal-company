import OpenAI from "openai";
import { readFile } from "node:fs/promises";
import path from "node:path";

const MAX_MESSAGE_LENGTH = 1200;
const KNOWLEDGE_MAX_LENGTH = 12000;

const normalizeMessage = (value) => String(value || "").trim().slice(0, MAX_MESSAGE_LENGTH);
const knowledgePath = path.join(process.cwd(), "knowledge", "novacore.md");
const getModel = () => {
  const configuredModel = process.env.OPENAI_MODEL || "gpt-5-mini";

  if (configuredModel === "gpt-5.1-mini") {
    return "gpt-5-mini";
  }

  return configuredModel;
};

const loadKnowledge = async () => {
  try {
    const content = await readFile(knowledgePath, "utf8");
    return content.slice(0, KNOWLEDGE_MAX_LENGTH);
  } catch (error) {
    console.error("Knowledge base unavailable", error);
    return "";
  }
};

const systemInstructions = `
Eres el asistente virtual de Novacore Labs, nombre comercial de Novacore Systems S.A. de C.V.
Responde con tono profesional, cálido, breve y útil.
Puedes ayudar a visitantes interesados en:
- ERP empresarial
- CRM comercial
- Sistema de control para talleres automotrices
- Sitios web corporativos
- Facturación electrónica
- Control de inventario
- Contabilidad
- Soluciones a medida
- Servicios en la nube, hosting, dominios y despliegues
- Servicios digitales para sitios web, mantenimiento, analítica, formularios, SEO técnico e integraciones

Objetivo:
1. Orientar al visitante.
2. Resolver dudas generales.
3. Identificar necesidades del proyecto.
4. Invitar a dejar datos de contacto o usar el formulario del sitio.

Reglas:
- No inventes precios, tiempos exactos ni compromisos legales.
- Si una pregunta requiere diagnóstico, pide 2 o 3 datos concretos.
- Si el visitante pregunta por contratación, sugiere escribir a mario.paz.software@gmail.com o completar el formulario.
- Responde en el idioma del visitante si es claro; si no, usa español LATAM.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: "Asistente no configurado. Falta OPENAI_API_KEY.",
    });
  }

  const message = normalizeMessage(req.body?.message);
  const language = normalizeMessage(req.body?.language || "es-419");

  if (!message) {
    return res.status(400).json({ error: "El mensaje es requerido." });
  }

  try {
    const knowledge = await loadKnowledge();
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: getModel(),
      instructions: [
        systemInstructions,
        `Idioma de interfaz actual: ${language}.`,
        knowledge ? `Base de conocimiento de Novacore Labs:\n${knowledge}` : "",
      ].join("\n\n"),
      input: message,
      max_output_tokens: 420,
    });

    return res.status(200).json({
      message: response.output_text,
    });
  } catch (error) {
    console.error("Assistant error", error);
    return res.status(500).json({
      error: "No se pudo generar una respuesta en este momento.",
      detail: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
