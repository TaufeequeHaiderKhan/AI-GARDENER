import React, { useState } from 'react';
import { ArrowLeft, Globe, Volume2, Cpu, Bell, Shield, Accessibility, LogOut, Trash2, HelpCircle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppSettings, Language } from '../types';
import { cn } from '../lib/utils';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onClose: () => void;
}

export default function Settings({ settings, onUpdate, onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<keyof AppSettings>('general');

  const updateSection = <K extends keyof AppSettings>(section: K, data: Partial<AppSettings[K]>) => {
    onUpdate({
      ...settings,
      [section]: { ...settings[section], ...data }
    });
  };

  const tabs: { id: keyof AppSettings; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Globe size={20} /> },
    { id: 'voice', label: 'Voice', icon: <Volume2 size={20} /> },
    { id: 'model', label: 'AI Model', icon: <Cpu size={20} /> },
    { id: 'notifications', label: 'Reminders', icon: <Bell size={20} /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield size={20} /> },
    { id: 'accessibility', label: 'Accessibility', icon: <Accessibility size={20} /> },
  ];

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <button 
          onClick={onClose}
          className="px-6 py-3 bg-gray-100 rounded-2xl text-gray-700 flex items-center gap-2 font-bold text-lg active:scale-95 transition-transform"
        >
          <ArrowLeft size={24} />
          Back
        </button>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <div className="w-24" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-24 md:w-64 bg-gray-50 border-r border-gray-100 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full p-6 flex flex-col md:flex-row items-center gap-3 transition-colors text-center md:text-left",
                activeTab === tab.id 
                  ? "bg-white text-green-700 border-r-4 border-green-600" 
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl",
                activeTab === tab.id ? "bg-green-50" : "bg-transparent"
              )}>
                {tab.icon}
              </div>
              <span className="text-xs md:text-lg font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto space-y-10"
            >
              {activeTab === 'general' && (
                <div className="space-y-8">
                  <SectionHeader title="General Settings" description="Basic app preferences for language and look." />
                  
                  <SettingItem 
                    label="App Language" 
                    description="Choose English or Urdu for UI text."
                  >
                    <Selector 
                      options={[{ value: 'en', label: 'English' }, { value: 'ur', label: 'اردو' }]}
                      value={settings.general.language}
                      onChange={(v) => updateSection('general', { language: v as Language })}
                    />
                  </SettingItem>

                  <SettingItem 
                    label="Start Screen" 
                    description="Choose which screen opens on launch."
                  >
                    <Selector 
                      options={[
                        { value: 'camera', label: 'Camera' }, 
                        { value: 'portfolio', label: 'Garden' },
                        { value: 'reminders', label: 'Reminders' }
                      ]}
                      value={settings.general.startScreen}
                      onChange={(v) => updateSection('general', { startScreen: v as any })}
                    />
                  </SettingItem>

                  <SettingItem 
                    label="Theme" 
                    description="Choose readability mode."
                  >
                    <Selector 
                      options={[
                        { value: 'high-contrast', label: 'High Contrast' }, 
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' }
                      ]}
                      value={settings.general.theme}
                      onChange={(v) => updateSection('general', { theme: v as any })}
                    />
                  </SettingItem>
                </div>
              )}

              {activeTab === 'voice' && (
                <div className="space-y-8">
                  <SectionHeader title="Voice and Conversation" description="Adjust how the app speaks and listens to you." />
                  
                  <SettingItem label="Voice Language" description="Choose voice for text-to-speech.">
                    <Selector 
                      options={[
                        { value: 'match', label: 'Match App' },
                        { value: 'en', label: 'English' }, 
                        { value: 'ur', label: 'Urdu' }
                      ]}
                      value={settings.voice.language}
                      onChange={(v) => updateSection('voice', { language: v as any })}
                    />
                  </SettingItem>

                  <SettingItem label="Speech Rate" description="Adjust how fast the app speaks.">
                    <Slider 
                      min={0.5} max={1.5} step={0.1}
                      value={settings.voice.speechRate}
                      onChange={(v) => updateSection('voice', { speechRate: v })}
                      labels={{ min: 'Slow', max: 'Fast' }}
                    />
                  </SettingItem>

                  <SettingItem label="Mic Sensitivity" description="Adjust for noisy environments.">
                    <Selector 
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' }, 
                        { value: 'high', label: 'High' }
                      ]}
                      value={settings.voice.micSensitivity}
                      onChange={(v) => updateSection('voice', { micSensitivity: v as any })}
                    />
                  </SettingItem>

                  <SettingItem label="Confirm before action" description="App reads back before saving or uploading.">
                    <Toggle 
                      enabled={settings.voice.confirmBeforeAction}
                      onChange={(v) => updateSection('voice', { confirmBeforeAction: v })}
                    />
                  </SettingItem>
                </div>
              )}

              {activeTab === 'model' && (
                <div className="space-y-8">
                  <SectionHeader title="Identification and Model" description="Control how the AI identifies your plants." />
                  
                  <SettingItem label="On-device model" description="Use local model for privacy and offline ID.">
                    <Toggle 
                      enabled={settings.model.onDevice}
                      onChange={(v) => updateSection('model', { onDevice: v })}
                    />
                  </SettingItem>

                  <SettingItem label="Cloud fallback" description="Send low-confidence IDs to cloud for second opinion.">
                    <Toggle 
                      enabled={settings.model.cloudFallback}
                      onChange={(v) => updateSection('model', { cloudFallback: v })}
                    />
                  </SettingItem>

                  <SettingItem label="Model update" description="Choose how to update the local model.">
                    <Selector 
                      options={[
                        { value: 'automatic', label: 'Automatic' },
                        { value: 'manual', label: 'Manual' }
                      ]}
                      value={settings.model.updateMode}
                      onChange={(v) => updateSection('model', { updateMode: v as any })}
                    />
                  </SettingItem>

                  <SettingItem label="Confidence threshold" description="Set required certainty for results.">
                    <Slider 
                      min={0.3} max={0.9} step={0.1}
                      value={settings.model.confidenceThreshold}
                      onChange={(v) => updateSection('model', { confidenceThreshold: v })}
                      labels={{ min: 'Low', max: 'High' }}
                    />
                  </SettingItem>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <SectionHeader title="Care and Reminders" description="Manage watering and care schedules." />
                  
                  <SettingItem label="Default reminder times" description="Set schedules for plant care.">
                    <button className="w-full bg-gray-100 py-4 rounded-2xl font-bold text-gray-700 active:scale-95 transition-transform">
                      Set Schedules
                    </button>
                  </SettingItem>

                  <SettingItem label="Notification type" description="Choose how you want to be alerted.">
                    <Selector 
                      options={[
                        { value: 'popup-sound', label: 'Popup + Sound' },
                        { value: 'popup', label: 'Popup Only' },
                        { value: 'silent', label: 'Silent' }
                      ]}
                      value={settings.notifications.type}
                      onChange={(v) => updateSection('notifications', { type: v as any })}
                    />
                  </SettingItem>

                  <SettingItem label="Snooze options" description="Quick choices when snoozing reminders.">
                    <Selector 
                      options={[
                        { value: '1-day', label: '1 Day' },
                        { value: '3-days', label: '3 Days' }
                      ]}
                      value={settings.notifications.snoozeOptions}
                      onChange={(v) => updateSection('notifications', { snoozeOptions: v as any })}
                    />
                  </SettingItem>

                  <SettingItem label="Share suggestions" description="Suggest sharing species cards with family.">
                    <Toggle 
                      enabled={settings.notifications.shareSuggestions}
                      onChange={(v) => updateSection('notifications', { shareSuggestions: v })}
                    />
                  </SettingItem>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-8">
                  <SectionHeader title="Privacy and Data" description="Manage your photos and usage data." />
                  
                  <SettingItem label="Process images locally" description="Keep photos on device unless you opt in.">
                    <Toggle 
                      enabled={settings.privacy.processLocally}
                      onChange={(v) => updateSection('privacy', { processLocally: v })}
                    />
                  </SettingItem>

                  <SettingItem label="Upload consent" description="Manage photo upload permissions.">
                    <button className="w-full bg-gray-100 py-4 rounded-2xl font-bold text-gray-700 active:scale-95 transition-transform">
                      Manage Permissions
                    </button>
                  </SettingItem>

                  <SettingItem label="Anonymous analytics" description="Allow reports to improve the app.">
                    <Toggle 
                      enabled={settings.privacy.analytics}
                      onChange={(v) => updateSection('privacy', { analytics: v })}
                    />
                  </SettingItem>

                  <SettingItem label="Account sync" description="Sign in to enable optional cloud sync.">
                    <button className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform">
                      Sign In
                    </button>
                  </SettingItem>

                  <div className="pt-8 border-t border-gray-100">
                    <button className="w-full flex items-center justify-center gap-2 text-red-600 font-bold py-4 rounded-2xl bg-red-50 active:scale-95 transition-transform">
                      <Trash2 size={20} />
                      Clear Local Data
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'accessibility' && (
                <div className="space-y-8">
                  <SectionHeader title="Accessibility and Support" description="Make the app easier to use." />
                  
                  <SettingItem label="Font Size" description="Adjust text size for readability.">
                    <Selector 
                      options={[
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'large', label: 'Large' },
                        { value: 'extra-large', label: 'Extra' }
                      ]}
                      value={settings.accessibility.fontSize}
                      onChange={(v) => updateSection('accessibility', { fontSize: v as any })}
                    />
                  </SettingItem>

                  <SettingItem label="Roman Urdu labels" description="Show Urdu in native and Roman script.">
                    <Toggle 
                      enabled={settings.accessibility.romanUrdu}
                      onChange={(v) => updateSection('accessibility', { romanUrdu: v })}
                    />
                  </SettingItem>

                  <SettingItem label="Help voice guide" description="Play a spoken tour of the app.">
                    <button className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-4 rounded-2xl font-bold active:scale-95 transition-transform">
                      <HelpCircle size={20} />
                      Start Voice Tour
                    </button>
                  </SettingItem>

                  <div className="pt-8 border-t border-gray-100">
                    <button className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold active:scale-95 transition-transform">
                      <MessageSquare size={20} />
                      Contact Support
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
      <p className="text-lg text-gray-500 font-medium">{description}</p>
    </div>
  );
}

function SettingItem({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex-1">
        <h4 className="text-xl font-bold text-gray-900 mb-1">{label}</h4>
        <p className="text-gray-500 font-medium">{description}</p>
      </div>
      <div className="min-w-[200px]">
        {children}
      </div>
    </div>
  );
}

function Selector({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-colors",
            value === opt.value 
              ? "bg-green-600 text-white shadow-md" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative w-16 h-8 rounded-full transition-colors duration-200 ease-in-out",
        enabled ? "bg-green-600" : "bg-gray-200"
      )}
    >
      <div className={cn(
        "absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ease-in-out",
        enabled ? "translate-x-8" : "translate-x-0"
      )} />
    </button>
  );
}

function Slider({ min, max, step, value, onChange, labels }: { min: number; max: number; step: number; value: number; onChange: (v: number) => void; labels: { min: string; max: string } }) {
  return (
    <div className="space-y-2">
      <input 
        type="range" 
        min={min} max={max} step={step} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
      />
      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
        <span>{labels.min}</span>
        <span>{labels.max}</span>
      </div>
    </div>
  );
}
