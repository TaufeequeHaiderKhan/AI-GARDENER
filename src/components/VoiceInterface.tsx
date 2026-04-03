import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, X, ArrowLeft, Trash2, User, Bot, Clock, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askQuestion } from '../lib/gemini';
import { speak } from '../lib/speech';
import { AppSettings, ChatMessage, Language } from '../types';
import { cn } from '../lib/utils';

interface VoiceInterfaceProps {
  plantContext: string;
  settings: AppSettings;
  onClose: () => void;
}

const translations = {
  en: {
    title: "Chat & Voice Assistant",
    placeholder: "Type your question...",
    listening: "Listening...",
    howCanIHelp: "How can I help you today?",
    tapMic: "Tap the microphone or type below.",
    thinking: "Thinking...",
    clearHistory: "Clear History",
    you: "You",
    assistant: "Assistant",
    back: "Back",
    speechOn: "Speech On",
    speechOff: "Speech Off"
  },
  ur: {
    title: "چیٹ اور صوتی معاون",
    placeholder: "اپنا سوال لکھیں...",
    listening: "سن رہا ہے...",
    howCanIHelp: "میں آج آپ کی کیسے مدد کر سکتا ہوں؟",
    tapMic: "مائیکروفون پر ٹیپ کریں یا نیچے ٹائپ کریں۔",
    thinking: "سوچ رہا ہے...",
    clearHistory: "تاریخ صاف کریں",
    you: "آپ",
    assistant: "معاون",
    back: "پیچھے",
    speechOn: "آواز آن",
    speechOff: "آواز آف"
  }
};

export default function VoiceInterface({ plantContext, settings, onClose }: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lang = settings.general.language;
  const t = translations[lang];

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('ai_gardener_chat_history');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('ai_gardener_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'en' ? 'en-US' : 'ur-PK';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      handleNewMessage(text, 'voice');
    };

    recognition.start();
  };

  const cleanText = (text: string) => {
    return text.replace(/\*/g, '').trim();
  };

  const handleNewMessage = async (text: string, type: 'text' | 'voice') => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await askQuestion(text, plantContext, lang);
      const cleanedRes = cleanText(res);
      
      const aiMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: cleanedRes,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Only speak if it was a voice input OR if speech is explicitly enabled
      if (type === 'voice' || isSpeechEnabled) {
        const speechLang = settings.voice.language === 'match' 
          ? (lang === 'en' ? 'en-US' : 'ur-PK') 
          : (settings.voice.language === 'en' ? 'en-US' : 'ur-PK');

        speak(cleanedRes, settings.voice.speechRate, speechLang);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm(t.clearHistory + "?")) {
      setMessages([]);
      localStorage.removeItem('ai_gardener_chat_history');
    }
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
        <button 
          onClick={onClose}
          className="px-6 py-3 bg-gray-100 rounded-2xl text-gray-700 flex items-center gap-2 font-bold text-lg active:scale-95 transition-transform"
        >
          <ArrowLeft size={24} />
          {t.back}
        </button>
        <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
            className={cn(
              "p-3 rounded-2xl active:scale-95 transition-transform flex items-center gap-2 font-bold",
              isSpeechEnabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
            )}
            title={isSpeechEnabled ? t.speechOn : t.speechOff}
          >
            {isSpeechEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
          <button 
            onClick={clearHistory}
            className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-95 transition-transform"
            title={t.clearHistory}
          >
            <Trash2 size={24} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
              <Bot size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.howCanIHelp}</h3>
            <p className="text-lg text-gray-500 font-medium">{t.tapMic}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "p-6 rounded-[32px] shadow-sm relative",
                msg.sender === 'user' 
                  ? "bg-green-600 text-white rounded-tr-none" 
                  : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
              )}>
                <div className="flex items-center gap-2 mb-2 opacity-70">
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  <span className="text-xs font-black uppercase tracking-widest">
                    {msg.sender === 'user' ? t.you : t.assistant}
                  </span>
                  {msg.type === 'voice' && <Mic size={14} />}
                </div>
                <p className="text-xl font-bold leading-tight">{msg.text}</p>
              </div>
              <div className="flex items-center gap-1 mt-2 px-2 text-gray-400">
                <Clock size={12} />
                <span className="text-[10px] font-bold">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))
        )}
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-gray-400 font-bold px-4"
          >
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <span>{t.thinking}</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-100 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNewMessage(inputText, 'text')}
              placeholder={t.placeholder}
              className="w-full p-5 pr-16 bg-gray-50 border-2 border-gray-100 rounded-3xl font-bold text-lg focus:border-green-500 outline-none transition-all"
            />
            <button 
              onClick={() => handleNewMessage(inputText, 'text')}
              disabled={!inputText.trim() || isLoading}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all",
                inputText.trim() ? "bg-green-600 text-white shadow-lg" : "bg-gray-100 text-gray-300"
              )}
            >
              <Send size={24} />
            </button>
          </div>

          <button 
            onClick={startListening}
            disabled={isLoading}
            className={cn(
              "p-5 rounded-3xl transition-all relative overflow-hidden",
              isListening ? "bg-red-500 text-white animate-pulse" : "bg-green-50 text-green-600"
            )}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            {isListening && (
              <div className="absolute inset-0 bg-white/20 animate-ping" />
            )}
          </button>
        </div>
        {isListening && (
          <p className="text-center mt-3 text-red-500 font-black text-sm uppercase tracking-widest animate-pulse">
            {t.listening}
          </p>
        )}
      </div>
    </motion.div>
  );
}
