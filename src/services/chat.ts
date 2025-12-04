import { ChatRequest, ChatResponse } from '../types';

export async function sendMessage(
  message: string,
  history: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>
): Promise<string> {
  const apiUrl = import.meta.env.VITE_API_URL || '/api/chat';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history,
    } as ChatRequest),
  });

  if (!response.ok) {
    throw new Error('Error al enviar el mensaje');
  }

  const data: ChatResponse = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.response;
}
