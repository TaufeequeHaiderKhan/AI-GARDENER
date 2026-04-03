import React from 'react';
import { SavedPlant } from '../types';
import { Calendar, ChevronRight, Leaf } from 'lucide-react';
import { motion } from 'motion/react';

interface PortfolioProps {
  plants: SavedPlant[];
  onSelect: (plant: SavedPlant) => void;
}

export default function Portfolio({ plants, onSelect }: PortfolioProps) {
  if (plants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6">
          <Leaf size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Garden is Empty
        </h2>
        <p className="text-gray-500 text-lg">
          Identify plants to add them here
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 space-y-4 pb-32">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        My Garden
      </h2>
      <div className="grid gap-4">
        {plants.map((plant) => (
          <motion.button
            key={plant.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(plant)}
            className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-left w-full"
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
              <img src={plant.image} className="w-full h-full object-cover" alt={plant.common_name} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 truncate">
                {plant.common_name}
              </h3>
              <p className="text-gray-500 italic text-sm mb-2 truncate">{plant.scientific_name}</p>
              <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                <Calendar size={14} />
                <span>{new Date(plant.date).toLocaleDateString()}</span>
              </div>
            </div>
            <ChevronRight className="text-gray-300" size={24} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
