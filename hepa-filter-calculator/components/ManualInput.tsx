'use client';

import { useState } from 'react';
import { FilterData } from './FilterCalculator';

interface ManualInputProps {
  onDataSubmit: (data: FilterData) => void;
}

export function ManualInput({ onDataSubmit }: ManualInputProps) {
  const [width, setWidth] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [length, setLength] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const w = parseFloat(width);
    const weight = parseFloat(netWeight);
    const len = parseFloat(length);

    if (!isNaN(w) && !isNaN(weight) && !isNaN(len) && w > 0 && weight > 0 && len > 0) {
      onDataSubmit({ width: w, netWeight: weight, length: len });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-700 border border-slate-600 rounded-lg p-6 space-y-4">
      <h3 className="font-bold text-xl text-white mb-3">Manuel Veri Girişi</h3>
      
      <div>
        <label htmlFor="width" className="block text-base font-bold text-slate-200 mb-1">
          Genişlik (mm)
        </label>
        <input
          id="width"
          type="number"
          step="0.1"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          placeholder="Örn: 896"
          className="w-full px-3 py-3 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-800 text-white text-lg"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="netWeight" className="block text-base font-bold text-slate-200 mb-1">
            Net Ağırlık (kg)
          </label>
          <input
            id="netWeight"
            type="number"
            step="0.1"
            value={netWeight}
            onChange={(e) => setNetWeight(e.target.value)}
            placeholder="Örn: 59.9"
            className="w-full px-3 py-3 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-800 text-white text-lg"
            required
          />
        </div>

        <div>
          <label htmlFor="length" className="block text-base font-bold text-slate-200 mb-1">
            Uzunluk (m)
          </label>
          <input
            id="length"
            type="number"
            step="0.1"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="Örn: 880"
            className="w-full px-3 py-3 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-800 text-white text-lg"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-6 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-500 transition-colors active:bg-blue-400 touch-manipulation"
      >
        ✓ Devam Et
      </button>
    </form>
  );
}
