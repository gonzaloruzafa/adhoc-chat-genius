import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Rate limiting
const requestCounts = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 20; // 20 mensajes por minuto

interface ChatRequest {
  message: string;
  history: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestCounts.get(ip) || [];
  const recentRequests = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  return true;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || 
             req.headers['x-real-ip']?.toString() || 
             'unknown';

  if (!checkRateLimit(ip)) {
    return res.status(429).json({ 
      error: 'Demasiadas solicitudes. Por favor, esperá un momento.' 
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    return res.status(500).json({ error: 'API Key no configurada en el servidor' });
  }

  const { message, history } = req.body as ChatRequest;
  
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ 
      error: 'Se requiere el campo "message" como string' 
    });
  }

  if (message.length > 2000) {
    return res.status(400).json({ 
      error: 'El mensaje es demasiado largo (máximo 2000 caracteres)' 
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `Sos un asistente conversacional inteligente y amigable.

TU PERSONALIDAD:
- Sos profesional pero cercano y amable
- Usás lenguaje natural y claro
- Respondés con precisión y utilidad
- Si no sabés algo, lo admitís honestamente
- Sos conciso pero completo en tus respuestas

CAPACIDADES:
- Podés conversar sobre diversos temas
- Ayudás con información general, explicaciones, consejos
- Respondés preguntas y mantenés conversaciones naturales
- Te adaptás al tono y necesidades del usuario

INSTRUCCIONES:
- Respondé de forma natural y conversacional
- Sé útil y preciso en tus respuestas
- Mantené un tono amigable y profesional
- Si algo no está claro, pedí aclaraciones`;

    const chatHistory = [
      {
        role: 'user' as const,
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model' as const,
        parts: [{ text: 'Entendido. Estoy listo para ayudarte con lo que necesites.' }]
      },
      ...(history || [])
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        ...chatHistory,
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ]
    });

    const responseText = response.text || 'Disculpá, no pude generar una respuesta.';

    console.log(`Chat message processed for IP: ${ip}, message length: ${message.length}`);

    return res.status(200).json({ response: responseText });

  } catch (error: any) {
    console.error('Error in chat:', {
      message: error.message,
      name: error.name,
      status: error.status
    });
    
    return res.status(500).json({ 
      error: 'Error al procesar el mensaje. Por favor, intentá de nuevo.'
    });
  }
}
