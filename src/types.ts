export type Language = 'en' | 'ur';

export interface AppSettings {
  general: {
    language: Language;
    startScreen: 'camera' | 'portfolio' | 'reminders';
    theme: 'high-contrast' | 'light' | 'dark';
  };
  voice: {
    language: Language | 'match';
    speechRate: number; // 0.5 to 2.0
    micSensitivity: 'low' | 'medium' | 'high';
    confirmBeforeAction: boolean;
  };
  model: {
    onDevice: boolean;
    cloudFallback: boolean;
    updateMode: 'automatic' | 'manual';
    confidenceThreshold: number; // 0.0 to 1.0
  };
  notifications: {
    reminderTimes: {
      watering: string;
      fertilizing: string;
      pruning: string;
    };
    type: 'popup-sound' | 'popup' | 'silent';
    snoozeOptions: '1-day' | '3-days';
    shareSuggestions: boolean;
  };
  privacy: {
    processLocally: boolean;
    uploadConsent: boolean;
    analytics: boolean;
    cloudSync: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    romanUrdu: boolean;
    voiceGuide: boolean;
  };
}

export interface PlantInfo {
  scientific_name: string;
  common_name: string;
  category: 'house' | 'veg' | 'fruit' | 'tree';
  care: {
    watering: string;
    light: string;
    soil: string;
    fertilizer: string;
    pruning: string;
    pests: string;
  };
  fruit: {
    produced: boolean;
    edible: boolean;
    safety_note: string;
    nutrition: string;
  };
  confidence: number;
}

export interface SavedPlant extends PlantInfo {
  id: string;
  image: string;
  date: string;
}

export interface Reminder {
  id: string;
  plantId: string;
  plantName: string;
  type: 'watering' | 'fertilizer' | 'pruning' | 'maintenance';
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  time: string; // HH:mm
  lastTriggered?: string; // ISO date
  enabled: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  type: 'text' | 'voice';
}
