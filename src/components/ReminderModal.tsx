import React, { useState } from 'react';
import { Bell, Calendar, Clock, X, Droplets, Sprout, Scissors, Settings2, Check, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavedPlant, Reminder, Language } from '../types';
import { cn } from '../lib/utils';

interface ReminderModalProps {
  plants: SavedPlant[];
  onSave: (reminder: Reminder) => void;
  onClose: () => void;
  lang: Language;
  initialType?: Reminder['type'];
}

const translations = {
  en: {
    title: "Set Reminder",
    selectPlant: "Select Plant",
    type: "Reminder Type",
    frequency: "Frequency",
    time: "Time",
    save: "Save Reminder",
    cancel: "Cancel",
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
    title: "یاد دہانی سیٹ کریں",
    selectPlant: "پودا منتخب کریں",
    type: "یاد دہانی کی قسم",
    frequency: "تعدد",
    time: "وقت",
    save: "یاد دہانی محفوظ کریں",
    cancel: "منسوخ کریں",
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

export default function ReminderModal({ plants, onSave, onClose, lang, initialType = 'watering' }: ReminderModalProps) {
  const t = translations[lang];
  const [selectedPlantId, setSelectedPlantId] = useState(plants[0]?.id || '');
  const [type, setType] = useState<Reminder['type']>(initialType);
  const [frequency, setFrequency] = useState<Reminder['frequency']>('weekly');
  const [time, setTime] = useState('09:00');

  const handleSave = () => {
    const plant = plants.find(p => p.id === selectedPlantId);
    if (!plant) return;

    const newReminder: Reminder = {
      id: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plantId: plant.id,
      plantName: plant.common_name,
      type,
      frequency,
      time,
      enabled: true
    };

    onSave(newReminder);
    onClose();
  };

  const types = [
    { id: 'watering', icon: Droplets, label: t.watering, color: 'text-blue-600 bg-blue-50' },
    { id: 'fertilizer', icon: Sprout, label: t.fertilizer, color: 'text-green-600 bg-green-50' },
    { id: 'pruning', icon: Scissors, label: t.pruning, color: 'text-orange-600 bg-orange-50' },
    { id: 'maintenance', icon: Settings2, label: t.maintenance, color: 'text-purple-600 bg-purple-50' },
  ];

  const frequencies = [
    { id: 'daily', label: t.daily },
    { id: 'weekly', label: t.weekly },
    { id: 'bi-weekly', label: t.biWeekly },
    { id: 'monthly', label: t.monthly },
  ];

  const isFormValid = selectedPlantId && type && frequency && time;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <motion.div 
        initial={{ y: 100, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 100, scale: 0.95 }}
        className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={onClose}
              className="p-3 bg-gray-100 rounded-2xl text-gray-700 hover:bg-gray-200 transition-colors active:scale-95"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                <Bell size={28} />
              </div>
              <h2 className="text-2xl font-black text-gray-900">{t.title}</h2>
            </div>
            <div className="w-12" />
          </div>

          <div className="space-y-8">
            {/* Plant Selection */}
            <section>
              <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                {t.selectPlant}
              </label>
              {plants.length === 0 ? (
                <div className="p-6 bg-orange-50 rounded-2xl border-2 border-orange-100 text-orange-700 font-bold text-center">
                  {lang === 'en' ? "Please add a plant to your garden first!" : "براہ کرم پہلے اپنے باغ میں ایک پودا شامل کریں!"}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                  {plants.map(plant => (
                    <button
                      key={`modal-plant-${plant.id}`}
                      onClick={() => setSelectedPlantId(plant.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left",
                        selectedPlantId === plant.id 
                          ? "border-green-500 bg-green-50" 
                          : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <img src={plant.image} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <span className="font-bold text-gray-700 truncate">{plant.common_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Type Selection */}
            <section>
              <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                {t.type}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {types.map(item => (
                  <button
                    key={`modal-type-${item.id}`}
                    onClick={() => setType(item.id as any)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                      type === item.id 
                        ? "border-green-500 bg-green-50" 
                        : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.color)}>
                      <item.icon size={20} />
                    </div>
                    <span className="font-bold text-gray-700">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-6">
              {/* Frequency */}
              <section>
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                  {t.frequency}
                </label>
                <select 
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-green-500 outline-none appearance-none"
                >
                  {frequencies.map(f => (
                    <option key={`modal-freq-${f.id}`} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </section>

              {/* Time */}
              <section>
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                  {t.time}
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-green-500 outline-none"
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3">
            <button 
              onClick={handleSave}
              disabled={!isFormValid}
              className={cn(
                "w-full py-6 rounded-3xl font-black text-2xl text-white shadow-xl transition-all flex items-center justify-center gap-3",
                isFormValid 
                  ? "bg-green-600 shadow-green-100 hover:bg-green-700 active:scale-[0.98]" 
                  : "bg-gray-300 shadow-none cursor-not-allowed opacity-50"
              )}
            >
              <Check size={32} />
              {t.save}
            </button>
            <button 
              onClick={onClose}
              className="w-full py-5 bg-gray-100 rounded-3xl font-black text-xl text-gray-500 hover:bg-gray-200 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ArrowLeft size={24} />
              {t.cancel}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
