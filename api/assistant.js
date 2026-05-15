import OpenAI from "openai";
import { readFile } from "node:fs/promises";
import path from "node:path";

const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_ITEMS = 8;
const KNOWLEDGE_MAX_LENGTH = 12000;

const normalizeMessage = (value) => String(value || "").trim().slice(0, MAX_MESSAGE_LENGTH);
const knowledgePath = path.join(process.cwd(), "knowledge", "novacore.md");
const email = "mario.paz.software@gmail.com";
const getModel = () => {
  const configuredModel = process.env.OPENAI_MODEL || "gpt-5-mini";

  if (configuredModel === "gpt-5.1-mini") {
    return "gpt-5-mini";
  }

  return configuredModel;
};

const getFallbackResponse = (message, language) => {
  const text = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const useEnglish = language.startsWith("en");

  if (useEnglish) {
    if (text.includes("price") || text.includes("quote") || text.includes("cost")) {
      return `I can help you prepare a first estimate, but pricing depends on scope, users, modules, integrations, and urgency. Please share what you need to build, whether you already have a system, and your preferred timeline. You can also use the contact form or write to ${email}.`;
    }

    if (text.includes("workshop") || text.includes("automotive") || text.includes("garage")) {
      return "For automotive workshops, Novacore Labs can help with customers, vehicles, work orders, services, parts, repair history, quotes, invoicing, and operational tracking. What do you mainly need to control: operations, inventory, billing, or customer follow-up?";
    }

    if (text.includes("erp") || text.includes("crm")) {
      return "Novacore Labs is working on modular ERP and CRM solutions. The right scope depends on your processes, users, modules, and integrations. Which area do you want to organize first: sales, inventory, billing, accounting, or operations?";
    }

    if (text.includes("website") || text.includes("hosting") || text.includes("cloud")) {
      return "Yes. Novacore Labs can support corporate websites, hosting, domains, deployments, analytics, forms, technical SEO, and cloud services. Are you starting from zero or improving an existing site?";
    }

    return `Novacore Labs builds business software, websites, integrations, automation, cloud services, and internal systems. Tell me what process you want to improve, and I can guide you on the best next step. You can also contact us at ${email}.`;
  }

  if (text.includes("precio") || text.includes("cotiz") || text.includes("costo") || text.includes("cuanto")) {
    return `Puedo ayudarte a preparar una primera estimación, pero el precio depende del alcance, usuarios, módulos, integraciones y urgencia. Cuéntame qué necesitas construir, si ya tienes un sistema y cuál es tu fecha objetivo. También puedes usar el formulario o escribir a ${email}.`;
  }

  if (text.includes("taller") || text.includes("automotriz") || text.includes("mecanico")) {
    return "Para talleres automotrices, Novacore Labs puede apoyar con clientes, vehículos, órdenes de trabajo, servicios, repuestos, historial, cotizaciones, facturación y seguimiento operativo. ¿Qué necesitas controlar primero: operación, inventario, facturación o seguimiento de clientes?";
  }

  if (text.includes("erp") || text.includes("crm")) {
    return "Novacore Labs está trabajando soluciones ERP y CRM modulares. El alcance ideal depende de tus procesos, usuarios, módulos e integraciones. ¿Qué área quieres ordenar primero: ventas, inventario, facturación, contabilidad u operación?";
  }

  if (text.includes("sitio") || text.includes("web") || text.includes("hosting") || text.includes("nube") || text.includes("dominio")) {
    return "Sí. Novacore Labs puede apoyar con sitios web corporativos, hosting, dominios, despliegues, analítica, formularios, SEO técnico y servicios en la nube. ¿Quieres iniciar desde cero o mejorar un sitio existente?";
  }

  return `Novacore Labs desarrolla software empresarial, sitios web, integraciones, automatización, servicios en la nube y sistemas internos. Cuéntame qué proceso quieres mejorar y te oriento con el siguiente paso. También puedes escribir a ${email}.`;
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

const normalizeHistory = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => {
      const role = item?.role === "assistant" ? "assistant" : "user";
      const content = normalizeMessage(item?.content);
      return content ? `${role === "assistant" ? "Asistente" : "Visitante"}: ${content}` : "";
    })
    .filter(Boolean);
};

const systemInstructions = `
Eres el asistente virtual de Novacore Labs, nombre comercial de Novacore Systems S.A. de C.V.
Tu funcion es atender visitantes del sitio, entender su necesidad y guiarlos hacia el siguiente paso comercial.

Personalidad:
- Profesional, calido, claro y confiable.
- Consultivo: orientas sin sonar insistente.
- Breve: normalmente 2 a 4 frases, salvo que el visitante pida detalle.
- Hablas en primera persona como asistente de Novacore Labs, no como humano independiente.

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
1. Responder la pregunta concreta del visitante.
2. Identificar la intencion: informacion general, necesidad tecnica, solicitud de cotizacion, soporte, alianza o contacto.
3. Hacer una recomendacion practica segun el caso.
4. Pedir solo los datos necesarios para avanzar.
5. Invitar a usar el formulario o escribir a mario.paz.software@gmail.com cuando ya exista interes real.

Reglas:
- No inventes precios, tiempos exactos ni compromisos legales.
- No prometas que una solucion en desarrollo ya esta lista en produccion.
- No des asesoria legal, fiscal o contable definitiva.
- Si una pregunta requiere diagnostico, pide maximo 2 o 3 datos concretos.
- Si el visitante pregunta por contratacion, cotizacion, demo o reunion, pide una breve descripcion del proyecto y su correo o sugiere completar el formulario.
- Si el visitante pregunta algo fuera del alcance de Novacore, responde con honestidad y redirige a lo que Novacore si puede ayudar.
- Si faltan datos, no bloquees la respuesta: da una orientacion inicial y luego pregunta.
- Responde en el idioma del visitante si es claro; si no, usa español LATAM.

Formato:
- No uses markdown complejo.
- Evita listas largas.
- Cuando sea util, usa 2 o 3 viñetas cortas.
- Cierra con una pregunta concreta o una llamada a la accion suave.
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
  const history = normalizeHistory(req.body?.history);

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
        history.length ? `Historial reciente de la conversacion:\n${history.join("\n")}` : "",
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
    return res.status(200).json({
      message: getFallbackResponse(message, language),
      fallback: true,
      detail: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
