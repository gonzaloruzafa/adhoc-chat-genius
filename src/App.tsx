import { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { sendMessage } from './services/chat';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '👋 ¡Hola! Soy Chat Genius, tu asistente conversacional impulsado por IA. Puedo ayudarte con información, responder preguntas, y conversar sobre diversos temas. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }]
      }));

      const response = await sendMessage(input, history);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Disculpá, hubo un error al procesar tu mensaje. Por favor, intentá de nuevo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white border-b border-adhoc-lavender py-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/adhoc-logo.png" alt="Adhoc" className="h-10 w-auto" />
          </div>
          <div className="hidden md:block">
            <span className="px-3 py-1 bg-adhoc-lavender/30 text-adhoc-violet rounded-full text-sm font-medium">
              Chat Genius
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Chat Container */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-[calc(100vh-250px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(message => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                      message.role === 'user' 
                        ? 'bg-adhoc-violet text-white' 
                        : 'bg-adhoc-lavender/50'
                    }`}>
                      {message.role === 'user' ? '👤' : '🤖'}
                    </div>
                  </div>
                  <div className={`flex flex-col max-w-[70%] ${message.role === 'user' ? 'items-end' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-adhoc-violet text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 px-2">
                      {message.timestamp.toLocaleTimeString('es-AR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-adhoc-lavender/50">
                      🤖
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="rounded-2xl px-4 py-3 bg-gray-100">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribí tu mensaje..."
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-adhoc-violet focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-sans text-sm"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-6 py-3 bg-adhoc-violet hover:bg-adhoc-violet/90 text-white rounded-xl font-sans font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>➤</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="font-sans text-sm text-gray-500">
            <a 
              href="https://www.adhoc.inc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-adhoc-violet hover:text-adhoc-coral transition-colors font-medium"
            >
              Conocé más sobre la tecnología de Adhoc →
            </a>
          </p>
          <p className="font-sans text-sm text-gray-400">
            © {new Date().getFullYear()} Adhoc S.A. - Soluciones Tecnológicas. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
