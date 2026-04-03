import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askQuestion } from '../lib/gemini';
import { speak } from '../lib/speech';

import { AppSettings } from '../types';

interface VoiceInterfaceProps {
  plantContext: string;
  settings: AppSettings;
  onClose: () => void;
}

export default function VoiceInterface({ plantContext, settings, onClose }: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    const lang = settings.general.language;
    recognition.lang = lang === 'en' ? 'en-US' : 'ur-PK';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleQuestion(text);
    };

    recognition.start();
  };

  const handleQuestion = async (text: string) => {
    setIsLoading(true);
    try {
      const lang = settings.general.language;
      const res = await askQuestion(text, plantContext, lang);
      setResponse(res);
      
      const speechLang = settings.voice.language === 'match' 
        ? (lang === 'en' ? 'en-US' : 'ur-PK') 
        : (settings.voice.language === 'en' ? 'en-US' : 'ur-PK');

      speak(res, settings.voice.speechRate, speechLang);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
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
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <button 
          onClick={onClose}
          className="px-6 py-3 bg-gray-100 rounded-2xl text-gray-700 flex items-center gap-2 font-bold text-lg active:scale-95 transition-transform"
        >
          <ArrowLeft size={24} />
          Back
        </button>
        <h2 className="text-xl font-bold text-gray-900">Voice Assistant</h2>
        <div className="w-24" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center gap-12">
        <div className="text-center max-w-xs">
          <h2 className="text-3xl font-black text-gray-900 mb-4 leading-tight">
            How can I help you today?
          </h2>
          <p className="text-xl text-gray-500 font-medium">
            Tap the microphone and ask about your plants.
          </p>
        </div>

        <div className="relative flex flex-col items-center gap-8">
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div 
                key="listening"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                <button 
                  onClick={() => setIsListening(false)}
                  className="relative w-48 h-48 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-200"
                >
                  <Mic size={64} />
                </button>
              </motion.div>
            ) : (
              <motion.button 
                key="idle"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={startListening}
                className="w-48 h-48 bg-gray-50 rounded-full flex items-center justify-center text-green-600 shadow-inner border-8 border-white active:scale-95 transition-transform"
              >
                <Mic size={64} />
              </motion.button>
            )}
          </AnimatePresence>
          
          {isListening && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-600 font-bold text-xl animate-pulse"
            >
              Listening...
            </motion.p>
          )}
        </div>

        <div className="w-full max-w-md space-y-6">
          {transcript && (
            <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">
                You asked
              </p>
              <p className="text-2xl font-bold text-gray-800 leading-tight">{transcript}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-bold">Thinking...</p>
            </div>
          ) : response && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-600 p-8 rounded-[40px] text-white shadow-xl shadow-green-100"
            >
              <div className="flex items-start gap-4">
                <Volume2 className="shrink-0 mt-1" size={32} />
                <p className="text-2xl font-bold leading-snug">{response}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
