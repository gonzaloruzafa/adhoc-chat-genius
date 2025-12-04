# 🤖 Smart Agent

Chatbot conversacional en tiempo real con IA, construido con React, Vite, TypeScript y Google Gemini AI.

## 🚀 Características

- ✅ Chat en tiempo real con historial de conversación
- ✅ Asistente conversacional general con IA
- ✅ Rate limiting (20 mensajes/minuto por IP)
- ✅ API key protegida en serverless functions
- ✅ Interfaz moderna y responsive
- ✅ Diseño tipo messenger con animaciones

## 🛠️ Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Vercel Serverless Functions
- **IA**: Google Gemini 2.0 Flash
- **Deployment**: Vercel

## 📦 Instalación

```bash
npm install
cp .env.example .env
# Editar .env y agregar GEMINI_API_KEY
npm run dev
```

## 🔐 Seguridad

- ✅ API Key protegida (nunca expuesta en frontend)
- ✅ Rate limiting por IP (20 req/min)
- ✅ Validación de entrada
- ✅ Límite de 2000 caracteres por mensaje

## 🚀 Deployment

1. Push a GitHub
2. Importar en Vercel
3. **Agregar variable**: `GEMINI_API_KEY` en Settings → Environment Variables
4. Deploy

---

Desarrollado con ❤️ por Adhoc
