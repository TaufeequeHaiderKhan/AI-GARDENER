/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Settings, Mic, LayoutGrid, Plus, Languages, Volume2, Info, Upload, Droplets, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CameraView from './components/CameraView';
import PlantResult from './components/PlantResult';
import VoiceInterface from './components/VoiceInterface';
import Portfolio from './components/Portfolio';
import SettingsView from './components/Settings';
import ReminderModal from './components/ReminderModal';
import RemindersView from './components/RemindersView';
import { PlantInfo, SavedPlant, AppSettings, Reminder } from './types';
import { speak } from './lib/speech';

const DEFAULT_SETTINGS: AppSettings = {
  general: {
    language: 'en',
    startScreen: 'camera',
    theme: 'high-contrast',
  },
  voice: {
    language: 'match',
    speechRate: 0.85,
    micSensitivity: 'medium',
    confirmBeforeAction: true,
  },
  model: {
    onDevice: true,
    cloudFallback: false,
    updateMode: 'manual',
    confidenceThreshold: 0.6,
  },
  notifications: {
    reminderTimes: {
      watering: 'Weekly',
      fertilizing: 'Monthly',
      pruning: 'Seasonal',
    },
    type: 'popup-sound',
    snoozeOptions: '1-day',
    shareSuggestions: true,
  },
  privacy: {
    processLocally: true,
    uploadConsent: false,
    analytics: false,
    cloudSync: false,
  },
  accessibility: {
    fontSize: 'large',
    romanUrdu: true,
    voiceGuide: false,
  },
};
import { identifyPlant } from './lib/gemini';
import { cn } from './lib/utils';

export default function App() {
  const [view, setView] = useState<'home' | 'camera' | 'portfolio' | 'settings' | 'reminders'>('home');
  const [activePlant, setActivePlant] = useState<{ info: PlantInfo; image: string } | null>(null);
  const [savedPlants, setSavedPlants] = useState<SavedPlant[]>([]);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderModalConfig, setReminderModalConfig] = useState<{ isOpen: boolean; initialType: Reminder['type'] }>({
    isOpen: false,
    initialType: 'watering'
  });
  const [activeNotification, setActiveNotification] = useState<Reminder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved plants, settings, and reminders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai_gardener_plants');
    if (saved) setSavedPlants(JSON.parse(saved));

    const savedSettings = localStorage.getItem('ai_gardener_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    const savedReminders = localStorage.getItem('ai_gardener_reminders');
    if (savedReminders) setReminders(JSON.parse(savedReminders));

    // Initialize audio for notifications
    notificationAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ai_gardener_settings', JSON.stringify(newSettings));
  };

  const handleSaveReminder = (reminder: Reminder) => {
    // Ensure ID is truly unique even if generated quickly
    const uniqueReminder = {
      ...reminder,
      id: reminder.id || `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    const updated = [...reminders, uniqueReminder];
    setReminders(updated);
    localStorage.setItem('ai_gardener_reminders', JSON.stringify(updated));
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem('ai_gardener_reminders', JSON.stringify(updated));
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setReminders(updated);
    localStorage.setItem('ai_gardener_reminders', JSON.stringify(updated));
  };

  // Check for reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const today = now.toISOString().split('T')[0];

      reminders.forEach(reminder => {
        if (reminder.enabled && reminder.time === currentTime && reminder.lastTriggered !== today) {
          // Trigger notification
          setActiveNotification(reminder);
          if (settings.notifications.type === 'popup-sound') {
            notificationAudioRef.current?.play().catch(e => console.error("Audio play failed", e));
          }
          
          // Speak the reminder
          const msg = settings.general.language === 'en' 
            ? `Reminder: Time for ${reminder.type} for your ${reminder.plantName}`
            : `یاد دہانی: آپ کے ${reminder.plantName} کے لیے ${reminder.type} کا وقت ہو گیا ہے`;
          
          speak(msg, settings.voice.speechRate, settings.general.language === 'en' ? 'en-US' : 'ur-PK');

          // Update last triggered
          const updatedReminders = reminders.map(r => 
            r.id === reminder.id ? { ...r, lastTriggered: today } : r
          );
          setReminders(updatedReminders);
          localStorage.setItem('ai_gardener_reminders', JSON.stringify(updatedReminders));
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    checkReminders(); // Initial check
    return () => clearInterval(interval);
  }, [reminders, settings]);

  const handleCapture = async (base64: string) => {
    setIsIdentifying(true);
    setView('home');
    try {
      const info = await identifyPlant(base64, settings.general.language);
      const imageData = `data:image/jpeg;base64,${base64}`;
      
      // Automatically save to garden
      const newPlant: SavedPlant = {
        ...info,
        id: `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        image: imageData,
        date: new Date().toISOString()
      };
      
      const updated = [newPlant, ...savedPlants];
      setSavedPlants(updated);
      localStorage.setItem('ai_gardener_plants', JSON.stringify(updated));
      
      setActivePlant({ info, image: imageData });
    } catch (err) {
      console.error(err);
      alert("Failed to identify plant. Please try again.");
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        handleCapture(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-green-100 transition-colors duration-300",
      settings.general.theme === 'dark' && "bg-gray-900 text-white",
      settings.general.theme === 'high-contrast' && "bg-white text-black",
      settings.accessibility.fontSize === 'small' && "text-sm",
      settings.accessibility.fontSize === 'medium' && "text-base",
      settings.accessibility.fontSize === 'large' && "text-lg",
      settings.accessibility.fontSize === 'extra-large' && "text-xl"
    )}>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload} 
      />
      
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-6 shadow-sm sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-green-700 tracking-tight">
              AI GARDENER
            </h1>
            <p className="text-gray-500 font-medium">
              Your Plant Assistant
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-6 pb-32">
        <AnimatePresence mode="wait">
          {isIdentifying ? (
            <motion.div 
              key="identifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center"
            >
              <div className="w-24 h-24 border-8 border-green-600 border-t-transparent rounded-full animate-spin mb-8" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Identifying Plant...
              </h2>
              <p className="text-xl text-gray-500">
                Please wait a moment
              </p>
            </motion.div>
          ) : view === 'home' && !activePlant ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-6 space-y-8"
            >
              <div className="bg-green-600 rounded-[40px] p-8 text-white shadow-xl shadow-green-200 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold mb-4 leading-tight">
                    Identify any plant instantly
                  </h2>
                  <p className="text-xl text-green-50 opacity-90 mb-8">
                    Take a photo or upload to get care tips.
                  </p>
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => setView('camera')}
                      className="w-full bg-white text-green-700 py-6 rounded-3xl font-black text-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3"
                    >
                      <Camera size={32} />
                      TAKE PHOTO
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-green-700 text-white py-5 rounded-3xl font-bold text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3 border-2 border-green-500"
                    >
                      <Upload size={28} />
                      UPLOAD PHOTO
                    </button>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <MenuCard 
                  icon={<Mic size={32} />} 
                  label={settings.general.language === 'en' ? "Voice Help" : "صوتی مدد"} 
                  onClick={() => setIsVoiceOpen(true)}
                  color="bg-blue-50 text-blue-700"
                />
                <MenuCard 
                  icon={<LayoutGrid size={32} />} 
                  label={settings.general.language === 'en' ? "My Garden" : "میرا باغ"} 
                  onClick={() => setView('portfolio')}
                  color="bg-orange-50 text-orange-700"
                />
                <MenuCard 
                  icon={<Droplets size={32} />} 
                  label={settings.general.language === 'en' ? "Water Reminder" : "پانی کی یاد دہانی"} 
                  onClick={() => setView('reminders')}
                  color="bg-blue-50 text-blue-600"
                />
                <MenuCard 
                  icon={<Settings size={32} />} 
                  label={settings.general.language === 'en' ? "Settings" : "ترتیبات"} 
                  onClick={() => setView('settings')}
                  color="bg-gray-50 text-gray-700"
                />
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="text-green-600" />
                  <h3 className="text-xl font-bold">Daily Tip</h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Water your plants early in the morning to prevent evaporation and fungal growth.
                </p>
              </div>
            </motion.div>
          ) : view === 'portfolio' ? (
            <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Portfolio 
                plants={savedPlants} 
                onSelect={(p) => setActivePlant({ info: p, image: p.image })} 
              />
            </motion.div>
          ) : view === 'reminders' ? (
            <motion.div key="reminders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RemindersView 
                reminders={reminders}
                onDelete={handleDeleteReminder}
                onToggle={handleToggleReminder}
                onAdd={() => setReminderModalConfig({ isOpen: true, initialType: 'watering' })}
                onClose={() => setView('home')}
                lang={settings.general.language}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-4 flex justify-between items-center z-40">
        <NavButton 
          active={view === 'home'} 
          onClick={() => { setView('home'); setActivePlant(null); }}
          icon={<Plus size={28} />}
          label="Identify"
        />
        <NavButton 
          active={view === 'portfolio'} 
          onClick={() => { setView('portfolio'); setActivePlant(null); }}
          icon={<LayoutGrid size={28} />}
          label="Garden"
        />
        <NavButton 
          active={view === 'reminders'} 
          onClick={() => { setView('reminders'); setActivePlant(null); }}
          icon={<Bell size={28} />}
          label="Reminders"
        />
        <NavButton 
          active={isVoiceOpen} 
          onClick={() => setIsVoiceOpen(true)}
          icon={<Mic size={28} />}
          label="Voice"
        />
        <NavButton 
          active={view === 'settings'} 
          onClick={() => setView('settings')}
          icon={<Settings size={28} />}
          label="Settings"
        />
      </nav>

      {/* Overlays */}
      <AnimatePresence>
        {view === 'camera' && (
          <motion.div key="camera-view-wrapper">
            <CameraView 
              onCapture={handleCapture} 
              onClose={() => setView('home')} 
            />
          </motion.div>
        )}
        {activePlant && (
          <motion.div key={`plant-result-wrapper-${activePlant.info.common_name}`}>
            <PlantResult 
              plant={activePlant.info} 
              image={activePlant.image} 
              settings={settings}
              onClose={() => setActivePlant(null)}
              onSetReminder={() => setReminderModalConfig({ isOpen: true, initialType: 'watering' })}
            />
          </motion.div>
        )}
        {isVoiceOpen && (
          <motion.div key="voice-interface-wrapper">
            <VoiceInterface 
              plantContext={activePlant?.info.common_name || "general gardening"}
              settings={settings}
              onClose={() => setIsVoiceOpen(false)}
            />
          </motion.div>
        )}
        {view === 'settings' && (
          <motion.div key="settings-view-wrapper">
            <SettingsView 
              settings={settings}
              onUpdate={handleUpdateSettings}
              onClose={() => setView('home')}
            />
          </motion.div>
        )}
        {reminderModalConfig.isOpen && (
          <motion.div key="reminder-modal-wrapper">
            <ReminderModal 
              plants={savedPlants}
              onSave={handleSaveReminder}
              onClose={() => setReminderModalConfig({ ...reminderModalConfig, isOpen: false })}
              lang={settings.general.language}
              initialType={reminderModalConfig.initialType}
            />
          </motion.div>
        )}
        {activeNotification && (
          <motion.div 
            key={`notification-${activeNotification.id}`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-4 right-4 z-[100] bg-white rounded-[32px] p-6 shadow-2xl border-4 border-green-500 flex items-center gap-6"
          >
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
              <Droplets size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-gray-900">
                {settings.general.language === 'en' ? 'Time to Water!' : 'پانی دینے کا وقت!'}
              </h3>
              <p className="text-lg text-gray-600 font-bold">
                {activeNotification.plantName} - {activeNotification.type}
              </p>
            </div>
            <button 
              onClick={() => setActiveNotification(null)}
              className="p-4 bg-green-600 text-white rounded-2xl font-black active:scale-95 transition-transform"
            >
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuCard({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-8 rounded-[40px] flex flex-col items-center justify-center gap-4 shadow-sm active:scale-95 transition-transform border border-transparent",
        color
      )}
    >
      <div className="p-4 bg-white/50 rounded-3xl">
        {icon}
      </div>
      <span className="text-xl font-bold">{label}</span>
    </button>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors",
        active ? "text-green-600" : "text-gray-400"
      )}
    >
      <div className={cn(
        "p-2 rounded-2xl transition-colors",
        active ? "bg-green-50" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

