import React from 'react';
import { Droplets, Sun, Sprout, ShieldAlert, HeartPulse, Volume2, Share2, Save, X, Info, ArrowLeft } from 'lucide-react';
import { PlantInfo, Language, AppSettings } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { speak } from '../lib/speech';

interface PlantResultProps {
  plant: PlantInfo;
  image: string;
  settings: AppSettings;
  onClose: () => void;
  onSetReminder?: () => void;
}

const translations = {
  en: {
    watering: "Watering",
    light: "Light",
    soil: "Soil",
    fertilizer: "Fertilizer",
    pruning: "Pruning",
    pests: "Pests & Care",
    edible: "Edible",
    notEdible: "Not Edible",
    safety: "Safety Note",
    nutrition: "Nutrition",
    save: "Save to Garden",
    share: "Share Card",
    readAloud: "Read Aloud",
    close: "Close",
    setReminder: "Set Reminder"
  },
  ur: {
    watering: "پانی دینا",
    light: "روشنی",
    soil: "مٹی",
    fertilizer: "کھاد",
    pruning: "کٹائی",
    pests: "کیڑے اور دیکھ بھال",
    edible: "کھانے کے قابل",
    notEdible: "کھانے کے قابل نہیں",
    safety: "حفاظتی نوٹ",
    nutrition: "غذائیت",
    save: "باغ میں محفوظ کریں",
    share: "کارڈ شیئر کریں",
    readAloud: "اونچی آواز میں پڑھیں",
    close: "بند کریں",
    setReminder: "یاد دہانی سیٹ کریں"
  }
};

export default function PlantResult({ plant, image, settings, onClose, onSetReminder }: PlantResultProps) {
  const lang = settings.general.language;
  const t = translations[lang];

  const handleSpeak = () => {
    const text = lang === 'en' ? `
      Plant Name: ${plant.common_name}. 
      Scientific Name: ${plant.scientific_name}. 
      Watering: ${plant.care.watering}. 
      Light: ${plant.care.light}. 
      Soil: ${plant.care.soil}. 
      Fertilizer: ${plant.care.fertilizer}. 
      Pruning: ${plant.care.pruning}. 
      Pests and Care: ${plant.care.pests}. 
      ${plant.fruit.produced ? `
        Fruit Information: This plant ${plant.fruit.edible ? 'produces edible fruit' : 'produces fruit that is not edible'}. 
        Safety Note: ${plant.fruit.safety_note}. 
        Nutrition: ${plant.fruit.nutrition}.
      ` : 'This plant does not produce fruit.'}
    ` : `
      پودے کا نام: ${plant.common_name}۔
      سائنسی نام: ${plant.scientific_name}۔
      پانی: ${plant.care.watering}۔
      روشنی: ${plant.care.light}۔
      مٹی: ${plant.care.soil}۔
      کھاد: ${plant.care.fertilizer}۔
      کٹائی: ${plant.care.pruning}۔
      کیڑے اور دیکھ بھال: ${plant.care.pests}۔
      ${plant.fruit.produced ? `
        پھل کی معلومات: یہ پودا ${plant.fruit.edible ? 'کھانے کے قابل پھل پیدا کرتا ہے' : 'ایسا پھل پیدا کرتا ہے جو کھانے کے قابل نہیں ہے'}۔
        حفاظتی نوٹ: ${plant.fruit.safety_note}۔
        غذائیت: ${plant.fruit.nutrition}۔
      ` : 'یہ پودا پھل پیدا نہیں کرتا۔'}
    `;
    
    const speechLang = settings.voice.language === 'match' 
      ? (lang === 'en' ? 'en-US' : 'ur-PK') 
      : (settings.voice.language === 'en' ? 'en-US' : 'ur-PK');

    speak(text, settings.voice.speechRate, speechLang);
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-white z-50 overflow-y-auto pb-24"
    >
      <div className="relative h-72">
        <img src={image} className="w-full h-full object-cover" alt={plant.common_name} />
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 px-6 py-3 bg-black/50 backdrop-blur-md rounded-2xl text-white flex items-center gap-2 font-bold text-lg active:scale-95 transition-transform"
        >
          <ArrowLeft size={24} />
          Back
        </button>
      </div>

      <div className="px-6 -mt-8 relative">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {plant.common_name}
              </h1>
              <p className="text-lg text-gray-500 italic">{plant.scientific_name}</p>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">
              {Math.round(plant.confidence * 100)}% Match
            </div>
          </div>

          <div className="flex gap-3 mb-8">
            <button 
              onClick={handleSpeak}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform"
            >
              <Volume2 size={24} />
              {t.readAloud}
            </button>
            <button 
              onClick={onSetReminder}
              className="p-4 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
              title={t.setReminder}
            >
              <Droplets size={24} />
            </button>
            <div className="p-4 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center">
              <Save size={24} className="opacity-50" />
            </div>
          </div>

          {/* Care Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <CareItem icon={<Droplets className="text-blue-500" />} label={t.watering} value={plant.care.watering} />
            <CareItem icon={<Sun className="text-orange-500" />} label={t.light} value={plant.care.light} />
            <CareItem icon={<Sprout className="text-green-500" />} label={t.soil} value={plant.care.soil} />
            <CareItem icon={<HeartPulse className="text-red-500" />} label={t.fertilizer} value={plant.care.fertilizer} />
          </div>

          {/* Fruit Info */}
          {plant.fruit.produced && (
            <div className={cn(
              "p-6 rounded-3xl mb-8 border-2",
              plant.fruit.edible ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center gap-3 mb-3">
                <ShieldAlert className={plant.fruit.edible ? "text-green-600" : "text-red-600"} size={32} />
                <h2 className="text-2xl font-bold">
                  {plant.fruit.edible ? t.edible : t.notEdible}
                </h2>
              </div>
              <p className="text-lg text-gray-700 mb-4">{plant.fruit.safety_note}</p>
              <div className="bg-white/50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-500 uppercase text-sm mb-1">{t.nutrition}</h3>
                <p className="text-lg font-medium">{plant.fruit.nutrition}</p>
              </div>
            </div>
          )}

          {/* Detailed Care */}
          <div className="space-y-6">
            <Section title={t.pruning} content={plant.care.pruning} />
            <Section title={t.pests} content={plant.care.pests} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CareItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-bold text-gray-500 text-sm uppercase">{label}</span>
      </div>
      <p className="text-lg font-semibold text-gray-900 leading-tight">{value}</p>
    </div>
  );
}

function Section({ title, content }: { title: string, content: string }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-lg text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
}
