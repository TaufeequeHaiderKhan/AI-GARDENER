import React from 'react';
import { Bell, Droplets, Sprout, Scissors, Settings2, Trash2, ArrowLeft, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Reminder, Language } from '../types';
import { cn } from '../lib/utils';

interface RemindersViewProps {
  reminders: Reminder[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onAdd: () => void;
  onClose: () => void;
  lang: Language;
}

const translations = {
  en: {
    title: "My Reminders",
    noReminders: "No reminders set yet.",
    addReminder: "Add New Reminder",
    back: "Back",
    watering: "Watering",
    fertilizer: "Fertilizer",
    pruning: "Pruning",
    maintenance: "Maintenance",
    daily: "Daily",
    weekly: "Weekly",
    biWeekly: "Every 2 Weeks",
    monthly: "Monthly"
  },
  ur: {
    title: "میری یاد دہانیاں",
    noReminders: "ابھی تک کوئی یاد دہانی سیٹ نہیں کی گئی۔",
    addReminder: "نئی یاد دہانی شامل کریں",
    back: "پیچھے",
    watering: "پانی دینا",
    fertilizer: "کھاد",
    pruning: "کٹائی",
    maintenance: "دیکھ بھال",
    daily: "روزانہ",
    weekly: "ہفتہ وار",
    biWeekly: "ہر 2 ہفتے بعد",
    monthly: "ماہانہ"
  }
};

export default function RemindersView({ reminders, onDelete, onToggle, onAdd, onClose, lang }: RemindersViewProps) {
  const t = translations[lang];

  const getIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'watering': return Droplets;
      case 'fertilizer': return Sprout;
      case 'pruning': return Scissors;
      default: return Settings2;
    }
  };

  const getColor = (type: Reminder['type']) => {
    switch (type) {
      case 'watering': return 'bg-blue-100 text-blue-600';
      case 'fertilizer': return 'bg-green-100 text-green-600';
      case 'pruning': return 'bg-orange-100 text-orange-600';
      default: return 'bg-purple-100 text-purple-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={onClose}
          className="px-6 py-3 bg-gray-100 rounded-2xl text-gray-700 flex items-center gap-2 font-bold text-lg active:scale-95 transition-transform"
        >
          <ArrowLeft size={24} />
          {t.back}
        </button>
        <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
        <button 
          onClick={onAdd}
          className="p-3 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-100 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="flex-1 p-6 space-y-4">
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <Bell size={64} className="mb-4 text-gray-400" />
            <p className="text-xl font-bold text-gray-500">{t.noReminders}</p>
          </div>
        ) : (
          <AnimatePresence>
            {reminders.map((reminder) => {
              const Icon = getIcon(reminder.type);
              return (
                <motion.div 
                  key={reminder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "bg-white p-6 rounded-[32px] border-2 transition-all flex items-center gap-4",
                    reminder.enabled ? "border-gray-100 shadow-sm" : "border-gray-50 opacity-60"
                  )}
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", getColor(reminder.type))}>
                    <Icon size={28} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-gray-900 leading-tight">
                      {reminder.plantName}
                    </h3>
                    <p className="text-gray-500 font-bold">
                      {t[reminder.type]} • {t[reminder.frequency]} • {reminder.time}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onToggle(reminder.id)}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                        reminder.enabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                      )}
                    >
                      <Bell size={24} />
                    </button>
                    <button 
                      onClick={() => onDelete(reminder.id)}
                      className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
